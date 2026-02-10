import { createClient } from "@/lib/supabase/server";
import type { Season } from "@/lib/types";

export async function getSeasons(): Promise<Season[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .order("year", { ascending: false });
  if (error) throw error;
  return data as Season[];
}

export async function getActiveSeason(): Promise<Season | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .eq("is_active", true)
    .single();
  if (error) return null;
  return data as Season;
}

export async function getSeason(id: string): Promise<Season> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Season;
}
