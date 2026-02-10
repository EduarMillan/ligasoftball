"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SeasonFormProps {
  onSubmit: (prevState: unknown, data: FormData) => Promise<{ error?: string } | void>;
}

export function SeasonForm({ onSubmit }: SeasonFormProps) {
  const [state, formAction, isPending] = useActionState(onSubmit, null);
  const currentYear = new Date().getFullYear();

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="animate-slide-down rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {state.error}
        </div>
      )}

      <Input
        id="name"
        name="name"
        label="Nombre de la Temporada"
        placeholder="Ej: Temporada 2026"
        required
      />

      <Input
        id="year"
        name="year"
        type="number"
        label="Año"
        defaultValue={currentYear}
        min={2020}
        max={2099}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="start_date"
          name="start_date"
          type="date"
          label="Fecha de Inicio"
          required
        />
        <Input
          id="end_date"
          name="end_date"
          type="date"
          label="Fecha de Fin"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="is_active"
          className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500/50"
          defaultChecked
        />
        <span className="text-sm text-zinc-300">Temporada activa</span>
      </label>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={isPending}>Crear Temporada</Button>
      </div>
    </form>
  );
}
