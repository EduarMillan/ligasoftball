"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhotoUpload } from "@/components/forms/photo-upload";
import type { Team } from "@/lib/types";

interface TeamFormProps {
  team?: Team;
  onSubmit: (prevState: unknown, data: FormData) => Promise<{ error?: string } | void>;
}

export function TeamForm({ team, onSubmit }: TeamFormProps) {
  const [state, formAction, isPending] = useActionState(onSubmit, null);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="animate-slide-down rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {state.error}
        </div>
      )}

      <PhotoUpload name="logo" currentUrl={team?.logo_url} />

      <Input
        id="name"
        name="name"
        label="Nombre del Equipo"
        placeholder="Ej: Águilas de Oro"
        defaultValue={team?.name}
        required
      />

      <Input
        id="short_name"
        name="short_name"
        label="Nombre Corto"
        placeholder="Ej: AGU"
        maxLength={5}
        defaultValue={team?.short_name}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="primary_color"
          name="primary_color"
          type="color"
          label="Color Primario"
          defaultValue={team?.primary_color ?? "#f59e0b"}
        />
        <Input
          id="secondary_color"
          name="secondary_color"
          type="color"
          label="Color Secundario"
          defaultValue={team?.secondary_color ?? "#18181b"}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={isPending}>
          {team ? "Guardar Cambios" : "Crear Equipo"}
        </Button>
      </div>
    </form>
  );
}
