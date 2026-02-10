"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PhotoUpload } from "@/components/forms/photo-upload";
import type { Player, Team } from "@/lib/types";
import { POSITIONS, BAT_SIDES, THROW_SIDES } from "@/lib/utils/constants";

interface PlayerFormProps {
  player?: Player;
  teams: Team[];
  defaultTeamId?: string;
  onSubmit: (prevState: unknown, data: FormData) => Promise<{ error?: string } | void>;
}

export function PlayerForm({ player, teams, defaultTeamId, onSubmit }: PlayerFormProps) {
  const [state, formAction, isPending] = useActionState(onSubmit, null);

  const teamOptions = teams.map((t) => ({ value: t.id, label: t.name }));
  const batOptions = BAT_SIDES.map((b) => ({
    value: b,
    label: b === "R" ? "Derecho" : b === "L" ? "Zurdo" : "Switch",
  }));
  const throwOptions = THROW_SIDES.map((t) => ({
    value: t,
    label: t === "R" ? "Derecho" : "Zurdo",
  }));
  const positionOptions = POSITIONS.map((p) => ({ value: p, label: p }));

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="animate-slide-down rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {state.error}
        </div>
      )}

      <PhotoUpload name="photo" currentUrl={player?.photo_url} />

      <Select
        id="team_id"
        name="team_id"
        label="Equipo"
        options={teamOptions}
        placeholder="Selecciona un equipo"
        defaultValue={player?.team_id ?? defaultTeamId}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="first_name"
          name="first_name"
          label="Nombre"
          placeholder="Ej: Juan"
          defaultValue={player?.first_name}
          required
        />
        <Input
          id="last_name"
          name="last_name"
          label="Apellido"
          placeholder="Ej: Pérez"
          defaultValue={player?.last_name}
          required
        />
      </div>

      <Input
        id="jersey_number"
        name="jersey_number"
        type="number"
        label="Número de Jersey"
        placeholder="Ej: 24"
        defaultValue={player?.jersey_number}
        min={0}
        max={99}
        required
      />

      <Select
        id="position"
        name="position"
        label="Posición Principal"
        options={positionOptions}
        placeholder="Selecciona una posición"
        defaultValue={player?.positions[0]}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          id="bats"
          name="bats"
          label="Batea"
          options={batOptions}
          defaultValue={player?.bats ?? "R"}
        />
        <Select
          id="throws"
          name="throws"
          label="Tira"
          options={throwOptions}
          defaultValue={player?.throws ?? "R"}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={isPending}>
          {player ? "Guardar Cambios" : "Crear Jugador"}
        </Button>
      </div>
    </form>
  );
}
