"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Team, Season, GameWithTeams } from "@/lib/types";

interface NewGameFormProps {
  teams: Team[];
  seasons: Season[];
  game?: GameWithTeams;
  onSubmit: (prevState: unknown, data: FormData) => Promise<{ error?: string } | void>;
}

export function NewGameForm({ teams, seasons, game, onSubmit }: NewGameFormProps) {
  const [state, formAction, isPending] = useActionState(onSubmit, null);

  const teamOptions = teams.map((t) => ({ value: t.id, label: t.name }));
  const seasonOptions = seasons.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  const activeSeason = seasons.find((s) => s.is_active);
  const defaultSeasonId = game?.season_id ?? activeSeason?.id;
  const defaultDate = game?.game_date
    ? new Date(game.game_date).toISOString().slice(0, 16)
    : undefined;

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="animate-slide-down rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {state.error}
        </div>
      )}

      <Select
        id="season_id"
        name="season_id"
        label="Temporada"
        options={seasonOptions}
        placeholder="Selecciona una temporada"
        defaultValue={defaultSeasonId}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          id="home_team_id"
          name="home_team_id"
          label="Equipo Local"
          options={teamOptions}
          placeholder="Selecciona equipo"
          defaultValue={game?.home_team_id}
          required
        />
        <Select
          id="away_team_id"
          name="away_team_id"
          label="Equipo Visitante"
          options={teamOptions}
          placeholder="Selecciona equipo"
          defaultValue={game?.away_team_id}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="game_date"
          name="game_date"
          type="datetime-local"
          label="Fecha y Hora"
          defaultValue={defaultDate}
          required
        />
        <Input
          id="innings"
          name="innings"
          type="number"
          label="Innings"
          defaultValue={game?.innings ?? 7}
          min={1}
        />
      </div>

      <Input
        id="location"
        name="location"
        label="Ubicación"
        placeholder="Nombre del campo"
        defaultValue={game?.location ?? ""}
      />

      <Input
        id="umpire"
        name="umpire"
        label="Árbitro"
        placeholder="Nombre del árbitro"
        defaultValue={game?.umpire ?? ""}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={isPending}>{game ? "Guardar Cambios" : "Crear Juego"}</Button>
      </div>
    </form>
  );
}
