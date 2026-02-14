"use client";

import { useState, useMemo, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { LineupSelector, type LineupResult } from "@/components/games/lineup-selector";
import { StatEntryTable } from "@/components/games/stat-entry-table";
import { saveLineup } from "@/lib/actions/stats";
import { ArrowLeft, Users } from "lucide-react";
import type { Player, PlayerGameStats, GameWithTeams } from "@/lib/types";

type StatsWithPlayer = PlayerGameStats & { player: Player };

interface StatsPageClientProps {
  game: GameWithTeams;
  awayPlayers: Player[];
  homePlayers: Player[];
  existingStats: StatsWithPlayer[];
}

function deriveLineup(stats: StatsWithPlayer[]): LineupResult {
  const starters = stats
    .filter((s) => s.is_starter)
    .sort((a, b) => (a.batting_order ?? 0) - (b.batting_order ?? 0));
  const reserves = stats.filter((s) => !s.is_starter);
  return {
    regulars: starters.map((s) => s.player),
    reserves: reserves.map((s) => s.player),
  };
}

export function StatsPageClient({
  game,
  awayPlayers,
  homePlayers,
  existingStats,
}: StatsPageClientProps) {
  const awayExisting = useMemo(
    () => existingStats.filter((s) => s.team_id === game.away_team_id),
    [existingStats, game.away_team_id]
  );
  const homeExisting = useMemo(
    () => existingStats.filter((s) => s.team_id === game.home_team_id),
    [existingStats, game.home_team_id]
  );

  const hasExistingAway = awayExisting.length > 0;
  const hasExistingHome = homeExisting.length > 0;

  const [step, setStep] = useState<"lineup" | "stats">(
    hasExistingAway && hasExistingHome ? "stats" : "lineup"
  );
  const [awayLineup, setAwayLineup] = useState<LineupResult | null>(
    hasExistingAway ? deriveLineup(awayExisting) : null
  );
  const [homeLineup, setHomeLineup] = useState<LineupResult | null>(
    hasExistingHome ? deriveLineup(homeExisting) : null
  );
  const [isSaving, startTransition] = useTransition();

  function confirmLineup(
    teamId: string,
    lineup: LineupResult,
    setSide: (l: LineupResult) => void
  ) {
    setSide(lineup);
    startTransition(async () => {
      await saveLineup(
        game.id,
        teamId,
        lineup.regulars.map((p) => ({ id: p.id })),
        lineup.reserves.map((p) => ({ id: p.id }))
      );
    });
  }

  const bothConfirmed = awayLineup !== null && homeLineup !== null;

  if (step === "stats" && awayLineup && homeLineup) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => setStep("lineup")}
          className="text-sm text-zinc-400 hover:text-amber-500 transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={14} />
          Volver al Lineup
        </button>

        {/* Away team stats */}
        <Card>
          <CardContent className="pt-2">
            <StatEntryTable
              lineup={awayLineup}
              gameId={game.id}
              teamId={game.away_team_id}
              teamName={game.away_team.name}
              teamColor={game.away_team.primary_color}
              existingStats={awayExisting}
            />
          </CardContent>
        </Card>

        {/* Home team stats */}
        <Card>
          <CardContent className="pt-2">
            <StatEntryTable
              lineup={homeLineup}
              gameId={game.id}
              teamId={game.home_team_id}
              teamName={game.home_team.name}
              teamColor={game.home_team.primary_color}
              existingStats={homeExisting}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-400">
        Selecciona los jugadores que participaron en el juego antes de registrar estadísticas.
      </p>

      {/* Away lineup */}
      <Card>
        <CardContent className="pt-2">
          {awayPlayers.length > 0 ? (
            awayLineup ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: game.away_team.primary_color }}
                    />
                    <h3 className="font-semibold">{game.away_team.name}</h3>
                    <span className="text-xs text-green-400">
                      Lineup confirmado ({awayLineup.regulars.length}R + {awayLineup.reserves.length}S)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAwayLineup(null)}
                  >
                    Editar
                  </Button>
                </div>
              </div>
            ) : (
              <LineupSelector
                players={awayPlayers}
                teamName={game.away_team.name}
                teamColor={game.away_team.primary_color}
                onConfirm={(lineup) =>
                  confirmLineup(game.away_team_id, lineup, setAwayLineup)
                }
              />
            )
          ) : (
            <EmptyState
              icon={<Users size={32} />}
              title={`${game.away_team.name} sin jugadores`}
              description="Agrega jugadores al equipo para registrar estadísticas"
            />
          )}
        </CardContent>
      </Card>

      {/* Home lineup */}
      <Card>
        <CardContent className="pt-2">
          {homePlayers.length > 0 ? (
            homeLineup ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: game.home_team.primary_color }}
                    />
                    <h3 className="font-semibold">{game.home_team.name}</h3>
                    <span className="text-xs text-green-400">
                      Lineup confirmado ({homeLineup.regulars.length}R + {homeLineup.reserves.length}S)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setHomeLineup(null)}
                  >
                    Editar
                  </Button>
                </div>
              </div>
            ) : (
              <LineupSelector
                players={homePlayers}
                teamName={game.home_team.name}
                teamColor={game.home_team.primary_color}
                onConfirm={(lineup) =>
                  confirmLineup(game.home_team_id, lineup, setHomeLineup)
                }
              />
            )
          ) : (
            <EmptyState
              icon={<Users size={32} />}
              title={`${game.home_team.name} sin jugadores`}
              description="Agrega jugadores al equipo para registrar estadísticas"
            />
          )}
        </CardContent>
      </Card>

      {/* Continue button */}
      <div className="flex justify-end">
        <Button
          disabled={!bothConfirmed || isSaving}
          loading={isSaving}
          onClick={() => setStep("stats")}
        >
          Continuar a Stats
        </Button>
      </div>
    </div>
  );
}
