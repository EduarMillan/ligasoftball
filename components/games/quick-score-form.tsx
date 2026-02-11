"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { updateGameScore } from "@/lib/actions/games";
import { useEffect, useRef } from "react";

interface QuickScoreFormProps {
  gameId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number | null;
  awayScore: number | null;
}

export function QuickScoreForm({
  gameId,
  homeTeamName,
  awayTeamName,
  homeScore,
  awayScore,
}: QuickScoreFormProps) {
  const action = updateGameScore.bind(null, gameId);
  const [state, formAction, isPending] = useActionState(action, null);
  const { toast } = useToast();
  const prevState = useRef(state);

  useEffect(() => {
    if (state !== prevState.current) {
      prevState.current = state;
      if (state?.error) {
        toast("error", state.error);
      } else if (state === undefined) {
        toast("success", "Marcador actualizado");
      }
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-3">
      {state?.error && (
        <div className="animate-slide-down rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="away_score" className="block text-sm font-medium text-zinc-300">
            {awayTeamName} <span className="text-zinc-500 text-xs">(Visitante)</span>
          </label>
          <input
            id="away_score"
            name="away_score"
            type="number"
            min={0}
            defaultValue={awayScore ?? 0}
            required
            className="w-full rounded-xl border border-border bg-zinc-900 px-4 py-2.5 text-sm text-foreground text-center font-mono text-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="home_score" className="block text-sm font-medium text-zinc-300">
            {homeTeamName} <span className="text-zinc-500 text-xs">(Local)</span>
          </label>
          <input
            id="home_score"
            name="home_score"
            type="number"
            min={0}
            defaultValue={homeScore ?? 0}
            required
            className="w-full rounded-xl border border-border bg-zinc-900 px-4 py-2.5 text-sm text-foreground text-center font-mono text-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      <p className="text-xs text-zinc-500">
        Al guardar, el juego se marcará como finalizado.
      </p>

      <div className="flex justify-end">
        <Button type="submit" size="sm" loading={isPending}>
          Guardar Marcador
        </Button>
      </div>
    </form>
  );
}
