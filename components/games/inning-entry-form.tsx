"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Linescore } from "@/components/games/linescore";
import { saveInning, deleteInning } from "@/lib/actions/stats";
import { useToast } from "@/components/ui/toast";
import { BarChart3, Plus, Trash2 } from "lucide-react";
import type { GameInning, GameWithTeams } from "@/lib/types";

interface InningEntryFormProps {
  game: GameWithTeams;
  innings: GameInning[];
}

export function InningEntryForm({ game, innings: initialInnings }: InningEntryFormProps) {
  const [innings, setInnings] = useState(initialInnings);
  const [inning, setInning] = useState(() => {
    const max = initialInnings.reduce((m, i) => Math.max(m, i.inning), 0);
    return max > 0 ? max : 1;
  });
  const [half, setHalf] = useState<"top" | "bottom">("top");
  const [runs, setRuns] = useState(0);
  const [hits, setHits] = useState(0);
  const [errors, setErrors] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const teamId = half === "top" ? game.away_team_id : game.home_team_id;
  const teamName = half === "top" ? game.away_team.short_name : game.home_team.short_name;

  // Compute current scores from innings
  const awayScore = innings
    .filter((i) => i.team_id === game.away_team_id)
    .reduce((s, i) => s + i.runs, 0);
  const homeScore = innings
    .filter((i) => i.team_id === game.home_team_id)
    .reduce((s, i) => s + i.runs, 0);

  function handleSave() {
    startTransition(async () => {
      const result = await saveInning(game.id, teamId, inning, runs, hits, errors);
      if (result.error) {
        toast("error", result.error);
        return;
      }
      // Update local state
      setInnings((prev) => {
        const filtered = prev.filter(
          (i) => !(i.team_id === teamId && i.inning === inning)
        );
        return [
          ...filtered,
          { id: crypto.randomUUID(), game_id: game.id, team_id: teamId, inning, runs, hits, errors },
        ];
      });
      toast("success", `Inning ${inning} (${half === "top" ? "Alta" : "Baja"}) guardado`);
      // Auto-advance: if top, go to bottom same inning; if bottom, go to top next inning
      if (half === "top") {
        setHalf("bottom");
      } else {
        setHalf("top");
        setInning((prev) => prev + 1);
      }
      setRuns(0);
      setHits(0);
      setErrors(0);
    });
  }

  function handleDelete(teamIdToDelete: string, inningNum: number) {
    const key = `${teamIdToDelete}-${inningNum}`;
    setIsDeleting(key);
    startTransition(async () => {
      const result = await deleteInning(game.id, teamIdToDelete, inningNum);
      setIsDeleting(null);
      if (result.error) {
        toast("error", result.error);
        return;
      }
      setInnings((prev) =>
        prev.filter((i) => !(i.team_id === teamIdToDelete && i.inning === inningNum))
      );
      toast("success", "Entrada eliminada");
    });
  }

  // Sort innings for display
  const sortedInnings = [...innings].sort((a, b) => {
    if (a.inning !== b.inning) return a.inning - b.inning;
    // Away (top) first, then home (bottom)
    const aIsAway = a.team_id === game.away_team_id ? 0 : 1;
    const bIsAway = b.team_id === game.away_team_id ? 0 : 1;
    return aIsAway - bIsAway;
  });

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 size={16} />
          Línea de Anotación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Live linescore */}
        {innings.length > 0 && (
          <Linescore
            innings={innings}
            awayTeam={game.away_team}
            homeTeam={game.home_team}
            awayScore={awayScore}
            homeScore={homeScore}
            totalInnings={game.innings}
          />
        )}

        {/* Entry form */}
        <div className="border-t border-border pt-4">
          <div className="flex flex-wrap items-end gap-3">
            {/* Inning */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                Inning
              </label>
              <input
                type="number"
                min={1}
                value={inning}
                onChange={(e) => setInning(parseInt(e.target.value) || 1)}
                className="w-16 rounded-lg border border-border bg-zinc-900 px-2 py-1.5 text-center text-sm font-mono focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              />
            </div>

            {/* Half */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                Entrada
              </label>
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => setHalf("top")}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    half === "top"
                      ? "bg-amber-500 text-zinc-950"
                      : "bg-zinc-900 text-zinc-400 hover:text-foreground"
                  }`}
                >
                  Alta ({game.away_team.short_name})
                </button>
                <button
                  type="button"
                  onClick={() => setHalf("bottom")}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors border-l border-border ${
                    half === "bottom"
                      ? "bg-amber-500 text-zinc-950"
                      : "bg-zinc-900 text-zinc-400 hover:text-foreground"
                  }`}
                >
                  Baja ({game.home_team.short_name})
                </button>
              </div>
            </div>

            {/* R */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                R
              </label>
              <input
                type="number"
                min={0}
                value={runs}
                onChange={(e) => setRuns(parseInt(e.target.value) || 0)}
                className="w-14 rounded-lg border border-border bg-zinc-900 px-2 py-1.5 text-center text-sm font-mono focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              />
            </div>

            {/* H */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                H
              </label>
              <input
                type="number"
                min={0}
                value={hits}
                onChange={(e) => setHits(parseInt(e.target.value) || 0)}
                className="w-14 rounded-lg border border-border bg-zinc-900 px-2 py-1.5 text-center text-sm font-mono focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              />
            </div>

            {/* E */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                E
              </label>
              <input
                type="number"
                min={0}
                value={errors}
                onChange={(e) => setErrors(parseInt(e.target.value) || 0)}
                className="w-14 rounded-lg border border-border bg-zinc-900 px-2 py-1.5 text-center text-sm font-mono focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              />
            </div>

            {/* Save */}
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              loading={isPending}
            >
              <Plus size={14} />
              Guardar
            </Button>
          </div>

          <p className="text-[10px] text-zinc-600 mt-2">
            Registrando: Inning {inning}, {half === "top" ? "Parte Alta" : "Parte Baja"} — {teamName}
          </p>
        </div>

        {/* Existing entries list */}
        {sortedInnings.length > 0 && (
          <div className="border-t border-border pt-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">
              Entradas registradas
            </p>
            <div className="space-y-1">
              {sortedInnings.map((inn) => {
                const isAway = inn.team_id === game.away_team_id;
                const team = isAway ? game.away_team : game.home_team;
                const delKey = `${inn.team_id}-${inn.inning}`;
                return (
                  <div
                    key={`${inn.team_id}-${inn.inning}`}
                    className="flex items-center justify-between bg-zinc-900/50 rounded-lg px-3 py-1.5 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: team.primary_color }}
                      />
                      <span className="font-medium">
                        {inn.inning}° {isAway ? "Alta" : "Baja"}
                      </span>
                      <span className="text-zinc-500">({team.short_name})</span>
                      <span className="font-mono text-zinc-300">
                        R:{inn.runs} H:{inn.hits} E:{inn.errors}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(inn.team_id, inn.inning)}
                      disabled={isDeleting === delKey}
                      className="text-zinc-600 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
