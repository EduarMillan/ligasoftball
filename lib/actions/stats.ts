"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import type { PlayerGameStatsInsert } from "@/lib/types";

export async function saveBulkStats(
  gameId: string,
  stats: PlayerGameStatsInsert[]
) {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };
  const supabase = await createClient();
  const { error } = await supabase
    .from("player_game_stats")
    .upsert(stats, { onConflict: "player_id,game_id" });
  if (error) return { error: "Error al guardar estadísticas." };
  revalidatePath(`/juegos/${gameId}`);
  revalidatePath("/jugadores");
  revalidatePath("/equipos");
  revalidatePath("/");
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
