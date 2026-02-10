"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function createSeason(prevState: unknown, formData: FormData) {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };
  const supabase = await createClient();

  const isActive = formData.get("is_active") === "on";

  // If setting as active, deactivate others first
  if (isActive) {
    await supabase.from("seasons").update({ is_active: false }).eq("is_active", true);
  }

  const { error } = await supabase.from("seasons").insert({
    name: formData.get("name") as string,
    year: parseInt(formData.get("year") as string),
    start_date: formData.get("start_date") as string,
    end_date: (formData.get("end_date") as string) || null,
    is_active: isActive,
  });

  if (error) return { error: "Error al crear temporada." };
  revalidatePath("/admin/temporadas");
  redirect("/admin/temporadas");
}

export async function toggleSeasonActive(id: string) {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };
  const supabase = await createClient();

  // Deactivate all first
  await supabase.from("seasons").update({ is_active: false }).eq("is_active", true);

  // Activate this one
  const { error } = await supabase
    .from("seasons")
    .update({ is_active: true })
    .eq("id", id);

  if (error) return { error: "Error al activar temporada." };
  revalidatePath("/admin/temporadas");
}

export async function deleteSeason(id: string) {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };
  const supabase = await createClient();
  const { error } = await supabase.from("seasons").delete().eq("id", id);
  if (error) return { error: "Error al eliminar temporada." };
  revalidatePath("/admin/temporadas");
  redirect("/admin/temporadas");
}
