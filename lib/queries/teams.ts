import { createClient } from "@/lib/supabase/server";
import type { Team, TeamStanding } from "@/lib/types";

export async function getTeams(): Promise<Team[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .order("name");
  if (error) throw error;
  return data as Team[];
}

export async function getTeam(id: string): Promise<Team> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Team;
}

export async function getTeamStandings(): Promise<TeamStanding[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("team_standings")
    .select("*")
    .order("wins", { ascending: false })
    .order("run_diff", { ascending: false });
  if (error) throw error;
  return data as TeamStanding[];
}
