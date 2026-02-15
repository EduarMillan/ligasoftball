"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import type { PlayerGameStatsInsert, GameInningInsert, GameInning } from "@/lib/types";

/**
 * Auto-calculate linescore (game_innings) from player stats.
 * Uses POs to determine completed half-innings, then derives R/H/E
 * for each inning by subtracting previously recorded innings from totals.
 *
 * Convention: game_innings entry for a team stores that team's offensive
 * R and H, plus the fielding team's E for that half-inning.
 */
async function autoCalculateLinescore(gameId: string) {
  const supabase = await createClient();

  // Get game to know home/away teams
  const { data: game } = await supabase
    .from("games")
    .select("home_team_id, away_team_id")
    .eq("id", gameId)
    .single();
  if (!game) return;

  // Get all player stats for this game
  const { data: allStats } = await supabase
    .from("player_game_stats")
    .select("team_id, runs, hits, putouts, errors")
    .eq("game_id", gameId);
  if (!allStats) return;

  // Sum stats per team
  const sumTeam = (teamId: string) => {
    const stats = allStats.filter((s) => s.team_id === teamId);
    return {
      runs: stats.reduce((s, st) => s + (st.runs ?? 0), 0),
      hits: stats.reduce((s, st) => s + (st.hits ?? 0), 0),
      putouts: stats.reduce((s, st) => s + (st.putouts ?? 0), 0),
      errors: stats.reduce((s, st) => s + (st.errors ?? 0), 0),
    };
  };

  const awayTotals = sumTeam(game.away_team_id);
  const homeTotals = sumTeam(game.home_team_id);

  // Home POs = outs recorded by home defense during top halves (away batting)
  // Away POs = outs recorded by away defense during bottom halves (home batting)
  const completedTopHalves = Math.floor(homeTotals.putouts / 3);
  const completedBottomHalves = Math.floor(awayTotals.putouts / 3);

  if (completedTopHalves === 0 && completedBottomHalves === 0) return;

  // Get existing game innings
  const { data: existingInnings } = await supabase
    .from("game_innings")
    .select("*")
    .eq("game_id", gameId)
    .order("inning");

  const existing = (existingInnings ?? []) as GameInning[];
  const existingAway = existing.filter((i) => i.team_id === game.away_team_id);
  const existingHome = existing.filter((i) => i.team_id === game.home_team_id);

  const toUpsert: GameInningInsert[] = [];

  // Away team's latest completed inning (top halves)
  if (completedTopHalves > 0) {
    const latestAway = existingAway.find((i) => i.inning === completedTopHalves);
    // Only calculate if: inning is new, or was created empty (fielding saved before batting)
    const shouldCalcAway = !latestAway || (latestAway.runs === 0 && latestAway.hits === 0);

    if (shouldCalcAway) {
      const prevInnings = existingAway.filter((i) => i.inning < completedTopHalves);
      const prevR = prevInnings.reduce((s, i) => s + i.runs, 0);
      const prevH = prevInnings.reduce((s, i) => s + i.hits, 0);
      const prevE = prevInnings.reduce((s, i) => s + i.errors, 0);

      toUpsert.push({
        game_id: gameId,
        team_id: game.away_team_id,
        inning: completedTopHalves,
        runs: Math.max(0, awayTotals.runs - prevR),
        hits: Math.max(0, awayTotals.hits - prevH),
        errors: Math.max(0, homeTotals.errors - prevE),
      });
    }
  }

  // Home team's latest completed inning (bottom halves)
  if (completedBottomHalves > 0) {
    const latestHome = existingHome.find((i) => i.inning === completedBottomHalves);
    const shouldCalcHome = !latestHome || (latestHome.runs === 0 && latestHome.hits === 0);

    if (shouldCalcHome) {
      const prevInnings = existingHome.filter((i) => i.inning < completedBottomHalves);
      const prevR = prevInnings.reduce((s, i) => s + i.runs, 0);
      const prevH = prevInnings.reduce((s, i) => s + i.hits, 0);
      const prevE = prevInnings.reduce((s, i) => s + i.errors, 0);

      toUpsert.push({
        game_id: gameId,
        team_id: game.home_team_id,
        inning: completedBottomHalves,
        runs: Math.max(0, homeTotals.runs - prevR),
        hits: Math.max(0, homeTotals.hits - prevH),
        errors: Math.max(0, awayTotals.errors - prevE),
      });
    }
  }

  if (toUpsert.length > 0) {
    await supabase
      .from("game_innings")
      .upsert(toUpsert, { onConflict: "game_id,team_id,inning" });
  }
}

export async function saveBulkStats(
  gameId: string,
  stats: PlayerGameStatsInsert[]
) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return { error: auth.error };
    const supabase = await createClient();
    const { error } = await supabase
      .from("player_game_stats")
      .upsert(stats, { onConflict: "player_id,game_id" });
    if (error) return { error: `Error al guardar estadísticas: ${error.message}` };

    // Auto-calculate linescore from POs
    await autoCalculateLinescore(gameId);

    revalidatePath(`/juegos/${gameId}`);
    revalidatePath(`/admin/juegos/${gameId}/estadisticas`);
    revalidatePath("/jugadores");
    revalidatePath("/equipos");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { error: `Error inesperado: ${e instanceof Error ? e.message : "desconocido"}` };
  }
}

export async function saveLineup(
  gameId: string,
  teamId: string,
  regulars: { id: string }[],
  reserves: { id: string }[]
) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return { error: auth.error };

    const supabase = await createClient();

    // Check which players already have stats for this game
    const { data: existing } = await supabase
      .from("player_game_stats")
      .select("player_id")
      .eq("game_id", gameId)
      .eq("team_id", teamId);

    const existingIds = new Set((existing ?? []).map((s) => s.player_id));

    // Only insert skeleton records for players that don't have stats yet
    const newRecords: PlayerGameStatsInsert[] = [];

    for (let i = 0; i < regulars.length; i++) {
      if (!existingIds.has(regulars[i].id)) {
        newRecords.push({
          player_id: regulars[i].id,
          game_id: gameId,
          team_id: teamId,
          is_starter: true,
          batting_order: i + 1,
        });
      }
    }

    for (const r of reserves) {
      if (!existingIds.has(r.id)) {
        newRecords.push({
          player_id: r.id,
          game_id: gameId,
          team_id: teamId,
          is_starter: false,
          batting_order: null,
        });
      }
    }

    if (newRecords.length > 0) {
      const { error } = await supabase
        .from("player_game_stats")
        .insert(newRecords);
      if (error) return { error: `Error al guardar lineup: ${error.message}` };
    }

    // Update is_starter and batting_order for players that already exist
    for (let i = 0; i < regulars.length; i++) {
      if (existingIds.has(regulars[i].id)) {
        await supabase
          .from("player_game_stats")
          .update({ is_starter: true, batting_order: i + 1 })
          .eq("player_id", regulars[i].id)
          .eq("game_id", gameId);
      }
    }

    for (const r of reserves) {
      if (existingIds.has(r.id)) {
        await supabase
          .from("player_game_stats")
          .update({ is_starter: false, batting_order: null })
          .eq("player_id", r.id)
          .eq("game_id", gameId);
      }
    }

    revalidatePath(`/admin/juegos/${gameId}/estadisticas`);
    revalidatePath(`/juegos/${gameId}`);
    return { success: true };
  } catch (e) {
    return { error: `Error inesperado: ${e instanceof Error ? e.message : "desconocido"}` };
  }
}

export async function saveGameStats(formData: FormData) {
  const gameId = formData.get("game_id") as string;
  const playerIds = formData.getAll("player_id") as string[];
  const teamId = formData.get("team_id") as string;

  const stats: PlayerGameStatsInsert[] = playerIds.map((playerId) => {
    const get = (field: string) =>
      parseInt(formData.get(`${playerId}_${field}`) as string) || 0;

    const starterVal = formData.get(`${playerId}_starter`) as string;
    const isStarter = starterVal === "true";
    const battingOrder = parseInt(formData.get(`${playerId}_order`) as string) || null;

    return {
      player_id: playerId,
      game_id: gameId,
      team_id: teamId,
      is_starter: isStarter,
      batting_order: battingOrder,
      plate_appearances: get("pa"),
      at_bats: get("ab"),
      runs: get("r"),
      hits: get("h"),
      doubles: get("2b"),
      triples: get("3b"),
      home_runs: get("hr"),
      rbi: get("rbi"),
      walks: get("bb"),
      strikeouts: get("so"),
      stolen_bases: get("sb"),
      caught_stealing: get("cs"),
      hit_by_pitch: get("hbp"),
      sacrifice_flies: get("sf"),
      sacrifice_bunts: get("sac"),
      // Fielding
      putouts: get("po"),
      assists: get("a"),
      errors: get("e"),
      // Pitching
      innings_pitched: parseFloat(formData.get(`${playerId}_ip`) as string) || 0,
      hits_allowed: get("ha"),
      earned_runs: get("er"),
      walks_allowed: get("bba"),
      strikeouts_pitched: get("kp"),
      decision: (formData.get(`${playerId}_dec`) as "W" | "L" | "S") || null,
    };
  });

  return await saveBulkStats(gameId, stats);
}

export async function saveInning(
  gameId: string,
  teamId: string,
  inning: number,
  runs: number,
  hits: number,
  errors: number
) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return { error: auth.error };

    const supabase = await createClient();
    const record: GameInningInsert = {
      game_id: gameId,
      team_id: teamId,
      inning,
      runs,
      hits,
      errors,
    };

    const { error } = await supabase
      .from("game_innings")
      .upsert(record, { onConflict: "game_id,team_id,inning" });

    if (error) return { error: `Error al guardar inning: ${error.message}` };

    revalidatePath(`/juegos/${gameId}`);
    revalidatePath(`/admin/juegos/${gameId}/estadisticas`);
    return { success: true };
  } catch (e) {
    return { error: `Error inesperado: ${e instanceof Error ? e.message : "desconocido"}` };
  }
}

export async function deleteInning(
  gameId: string,
  teamId: string,
  inning: number
) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return { error: auth.error };

    const supabase = await createClient();
    const { error } = await supabase
      .from("game_innings")
      .delete()
      .eq("game_id", gameId)
      .eq("team_id", teamId)
      .eq("inning", inning);

    if (error) return { error: `Error al eliminar inning: ${error.message}` };

    revalidatePath(`/juegos/${gameId}`);
    revalidatePath(`/admin/juegos/${gameId}/estadisticas`);
    return { success: true };
  } catch (e) {
    return { error: `Error inesperado: ${e instanceof Error ? e.message : "desconocido"}` };
  }
}
