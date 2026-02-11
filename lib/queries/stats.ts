import { createClient } from "@/lib/supabase/server";
import type {
  PlayerGameStats,
  Player,
  GameInning,
  SeasonBattingLeader,
  SeasonPitchingLeader,
} from "@/lib/types";

type StatsWithPlayer = PlayerGameStats & { player: Player };

export async function getPlayerGameStats(
  gameId: string
): Promise<StatsWithPlayer[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_game_stats")
    .select("*, player:players(*)")
    .eq("game_id", gameId)
    .order("batting_order", { ascending: true });
  if (error) throw error;
  return data as StatsWithPlayer[];
}

export async function getPlayerGameLog(playerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_game_stats")
    .select(
      "*, game:games(*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*))"
    )
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getBattingLeaders(
  seasonId?: string,
  limit = 5
): Promise<SeasonBattingLeader[]> {
  const supabase = await createClient();
  let query = supabase
    .from("season_batting_leaders")
    .select("*")
    .order("avg", { ascending: false })
    .limit(limit);

  if (seasonId) {
    query = query.eq("season_id", seasonId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as SeasonBattingLeader[];
}

export async function getPitchingLeaders(
  seasonId?: string,
  limit = 5
): Promise<SeasonPitchingLeader[]> {
  const supabase = await createClient();
  let query = supabase
    .from("season_pitching_leaders")
    .select("*")
    .order("era", { ascending: true })
    .limit(limit);

  if (seasonId) {
    query = query.eq("season_id", seasonId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as SeasonPitchingLeader[];
}

export async function getHomeRunLeaders(
  seasonId?: string,
  limit = 5
): Promise<SeasonBattingLeader[]> {
  const supabase = await createClient();
  let query = supabase
    .from("season_batting_leaders")
    .select("*")
    .order("hr", { ascending: false })
    .limit(limit);

  if (seasonId) {
    query = query.eq("season_id", seasonId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as SeasonBattingLeader[];
}

export async function getRbiLeaders(
  seasonId?: string,
  limit = 5
): Promise<SeasonBattingLeader[]> {
  const supabase = await createClient();
  let query = supabase
    .from("season_batting_leaders")
    .select("*")
    .order("rbi", { ascending: false })
    .limit(limit);

  if (seasonId) {
    query = query.eq("season_id", seasonId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as SeasonBattingLeader[];
}

export async function getStolenBaseLeaders(
  seasonId?: string,
  limit = 5
): Promise<SeasonBattingLeader[]> {
  const supabase = await createClient();
  let query = supabase
    .from("season_batting_leaders")
    .select("*")
    .gt("sb", 0)
    .order("sb", { ascending: false })
    .limit(limit);

  if (seasonId) {
    query = query.eq("season_id", seasonId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as SeasonBattingLeader[];
}

export async function getGameInnings(gameId: string): Promise<GameInning[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("game_innings")
    .select("*")
    .eq("game_id", gameId)
    .order("inning")
    .order("team_id");
  if (error) throw error;
  return data as GameInning[];
}
