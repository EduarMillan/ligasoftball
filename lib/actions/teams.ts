"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { uploadFile } from "@/lib/actions/upload";

export async function createTeam(prevState: unknown, formData: FormData) {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const shortName = (formData.get("short_name") as string).toUpperCase();

  const { data, error } = await supabase
    .from("teams")
    .insert({
      name,
      short_name: shortName,
      primary_color: formData.get("primary_color") as string,
      secondary_color: formData.get("secondary_color") as string,
    })
    .select("id")
    .single();

  if (error) return { error: "Error al crear equipo." };

  // Upload logo if provided
  const logoFile = formData.get("logo") as File | null;
  if (logoFile && logoFile.size > 0) {
    try {
      const url = await uploadFile("team-logos", `${data.id}/logo.jpg`, logoFile);
      await supabase.from("teams").update({ logo_url: url }).eq("id", data.id);
    } catch {
      // Team created, logo failed — not critical
    }
  }

  revalidatePath("/equipos");
  redirect("/equipos");
}

export async function updateTeam(id: string, prevState: unknown, formData: FormData) {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };
  const supabase = await createClient();

  const updates: Record<string, unknown> = {
    name: formData.get("name") as string,
    short_name: (formData.get("short_name") as string).toUpperCase(),
    primary_color: formData.get("primary_color") as string,
    secondary_color: formData.get("secondary_color") as string,
  };

  // Upload logo if provided
  const logoFile = formData.get("logo") as File | null;
  if (logoFile && logoFile.size > 0) {
    try {
      const url = await uploadFile("team-logos", `${id}/logo.jpg`, logoFile);
      updates.logo_url = url;
    } catch {
      // Logo upload failed — continue with other updates
    }
  }

  const { error } = await supabase.from("teams").update(updates).eq("id", id);

  if (error) return { error: "Error al actualizar equipo." };
  revalidatePath("/equipos");
  revalidatePath(`/equipos/${id}`);
  redirect(`/equipos/${id}`);
}

export async function deleteTeam(id: string) {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };
  const supabase = await createClient();
  const { error } = await supabase.from("teams").delete().eq("id", id);
  if (error) return { error: "Error al eliminar equipo." };
  revalidatePath("/equipos");
  redirect("/equipos");
}
