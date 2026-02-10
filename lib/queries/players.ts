import { createClient } from "@/lib/supabase/server";
import type {
  Player,
  PlayerWithTeam,
  PlayerCareerBatting,
  PlayerCareerPitching,
  PlayerCareerFielding,
} from "@/lib/types";

export async function getPlayers(teamId?: string): Promise<PlayerWithTeam[]> {
  const supabase = await createClient();
  let query = supabase
    .from("players")
    .select("*, team:teams(*)")
    .eq("is_active", true)
    .order("last_name");

  if (teamId) {
    query = query.eq("team_id", teamId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as PlayerWithTeam[];
}

export async function getPlayer(id: string): Promise<PlayerWithTeam> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .select("*, team:teams(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as PlayerWithTeam;
}

export async function getPlayerCareerBatting(
  playerId?: string
): Promise<PlayerCareerBatting[]> {
  const supabase = await createClient();
  let query = supabase.from("player_career_batting").select("*");

  if (playerId) {
    query = query.eq("player_id", playerId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as PlayerCareerBatting[];
}

export async function getPlayerCareerPitching(
  playerId?: string
): Promise<PlayerCareerPitching[]> {
  const supabase = await createClient();
  let query = supabase.from("player_career_pitching").select("*");

  if (playerId) {
    query = query.eq("player_id", playerId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as PlayerCareerPitching[];
}

export async function getPlayerCareerFielding(
  playerId?: string
): Promise<PlayerCareerFielding[]> {
  const supabase = await createClient();
  let query = supabase.from("player_career_fielding").select("*");

  if (playerId) {
    query = query.eq("player_id", playerId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as PlayerCareerFielding[];
}

export async function getTeamBattingStats(
  teamId: string
): Promise<PlayerCareerBatting[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_career_batting")
    .select("*")
    .eq("team_id", teamId)
    .order("avg", { ascending: false });
  if (error) throw error;
  return data as PlayerCareerBatting[];
}

export async function getTeamFieldingStats(
  teamId: string
): Promise<PlayerCareerFielding[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_career_fielding")
    .select("*")
    .eq("team_id", teamId)
    .order("games_played", { ascending: false });
  if (error) throw error;
  return data as PlayerCareerFielding[];
}

export async function getPlayersByTeam(teamId: string): Promise<Player[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("team_id", teamId)
    .eq("is_active", true)
    .order("jersey_number");
  if (error) throw error;
  return data as Player[];
}
