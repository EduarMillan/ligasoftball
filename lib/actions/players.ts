"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function createPlayer(prevState: unknown, formData: FormData) {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };
  const supabase = await createClient();

  const positions = (formData.get("position") as string) || "";
  const photoFile = formData.get("photo") as File | null;
  let photoUrl: string | null = null;

  // Upload photo if provided
  if (photoFile && photoFile.size > 0) {
    const ext = photoFile.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("player-photos")
      .upload(path, photoFile, { cacheControl: "3600", upsert: true });
    if (uploadError) return { error: "Error al subir la foto." };
    const { data: { publicUrl } } = supabase.storage
      .from("player-photos")
      .getPublicUrl(path);
    photoUrl = publicUrl;
  }

  const { error } = await supabase.from("players").insert({
    team_id: formData.get("team_id") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    jersey_number: parseInt(formData.get("jersey_number") as string),
    positions: positions ? [positions] : [],
    bats: (formData.get("bats") as "R" | "L" | "S") || "R",
    throws: (formData.get("throws") as "R" | "L") || "R",
    photo_url: photoUrl,
  });

  if (error) return { error: "Error al crear jugador." };
  revalidatePath("/jugadores");
  revalidatePath(`/equipos/${formData.get("team_id")}`);
  redirect("/jugadores");
}

export async function updatePlayer(id: string, prevState: unknown, formData: FormData) {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };
  const supabase = await createClient();

  const positions = (formData.get("position") as string) || "";
  const photoFile = formData.get("photo") as File | null;

  const updateData: Record<string, unknown> = {
    team_id: formData.get("team_id") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    jersey_number: parseInt(formData.get("jersey_number") as string),
    positions: positions ? [positions] : [],
    bats: (formData.get("bats") as string) || "R",
    throws: (formData.get("throws") as string) || "R",
  };

  // Upload new photo if provided
  if (photoFile && photoFile.size > 0) {
    const ext = photoFile.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("player-photos")
      .upload(path, photoFile, { cacheControl: "3600", upsert: true });
    if (uploadError) return { error: "Error al subir la foto." };
    const { data: { publicUrl } } = supabase.storage
      .from("player-photos")
      .getPublicUrl(path);
    updateData.photo_url = publicUrl;
  }

  const { error } = await supabase
    .from("players")
    .update(updateData)
    .eq("id", id);

  if (error) return { error: "Error al actualizar jugador." };
  revalidatePath("/jugadores");
  revalidatePath(`/jugadores/${id}`);
  revalidatePath(`/equipos/${formData.get("team_id")}`);
  redirect(`/jugadores/${id}`);
}

export async function deletePlayer(id: string) {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };
  const supabase = await createClient();
  const { error } = await supabase.from("players").delete().eq("id", id);
  if (error) return { error: "Error al eliminar jugador." };
  revalidatePath("/jugadores");
  redirect("/jugadores");
}
