"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function createGame(prevState: unknown, formData: FormData) {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("games")
    .insert({
      season_id: formData.get("season_id") as string,
      home_team_id: formData.get("home_team_id") as string,
      away_team_id: formData.get("away_team_id") as string,
      game_date: formData.get("game_date") as string,
      innings: parseInt(formData.get("innings") as string) || 7,
      location: (formData.get("location") as string) || null,
      umpire: (formData.get("umpire") as string) || null,
    })
    .select("id")
    .single();

  if (error) return { error: "Error al crear juego." };
  revalidatePath("/juegos");
  redirect(`/juegos/${data.id}`);
}

type GameStatus = "scheduled" | "in_progress" | "final" | "postponed" | "cancelled";

export async function updateGameScore(
  id: string,
  prevState: unknown,
  formData: FormData
) {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };
  const supabase = await createClient();

  const homeScore = parseInt(formData.get("home_score") as string);
  const awayScore = parseInt(formData.get("away_score") as string);

  if (isNaN(homeScore) || isNaN(awayScore) || homeScore < 0 || awayScore < 0) {
    return { error: "Las carreras deben ser números válidos." };
  }

  const { error } = await supabase
    .from("games")
    .update({
      home_score: homeScore,
      away_score: awayScore,
      status: "final" as GameStatus,
    })
    .eq("id", id);

  if (error) return { error: "Error al actualizar marcador." };
  revalidatePath("/juegos");
  revalidatePath(`/juegos/${id}`);
}

export async function updateGameStatus(id: string, status: GameStatus) {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };
  const supabase = await createClient();
  const { error } = await supabase
    .from("games")
    .update({ status })
    .eq("id", id);
  if (error) return { error: "Error al actualizar estado del juego." };
  revalidatePath("/juegos");
  revalidatePath(`/juegos/${id}`);
}

export async function updateGame(id: string, prevState: unknown, formData: FormData) {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };
  const supabase = await createClient();

  const { error } = await supabase
    .from("games")
    .update({
      season_id: formData.get("season_id") as string,
      home_team_id: formData.get("home_team_id") as string,
      away_team_id: formData.get("away_team_id") as string,
      game_date: formData.get("game_date") as string,
      innings: parseInt(formData.get("innings") as string) || 7,
      location: (formData.get("location") as string) || null,
      umpire: (formData.get("umpire") as string) || null,
    })
    .eq("id", id);

  if (error) return { error: "Error al actualizar juego." };
  revalidatePath("/juegos");
  revalidatePath(`/juegos/${id}`);
  redirect(`/juegos/${id}`);
}

export async function deleteGame(id: string) {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };
  const supabase = await createClient();
  const { error } = await supabase.from("games").delete().eq("id", id);
  if (error) return { error: "Error al eliminar juego." };
  revalidatePath("/juegos");
  redirect("/juegos");
}
