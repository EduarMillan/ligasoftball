import { createClient } from "@/lib/supabase/server";
import type { GameWithTeams } from "@/lib/types";

export async function getGames(seasonId?: string): Promise<GameWithTeams[]> {
  const supabase = await createClient();
  let query = supabase
    .from("games")
    .select("*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)")
    .order("game_date", { ascending: false });

  if (seasonId) {
    query = query.eq("season_id", seasonId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as GameWithTeams[];
}

export async function getGame(id: string): Promise<GameWithTeams> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .select("*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as GameWithTeams;
}

export async function getRecentGames(limit = 5): Promise<GameWithTeams[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .select("*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)")
    .eq("status", "final")
    .order("game_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as GameWithTeams[];
}

export async function getUpcomingGames(limit = 5): Promise<GameWithTeams[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .select("*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)")
    .eq("status", "scheduled")
    .order("game_date")
    .limit(limit);
  if (error) throw error;
  return data as GameWithTeams[];
}
