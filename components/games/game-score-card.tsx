import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatGameDate } from "@/lib/utils/format";
import { GAME_STATUS_LABELS, GAME_STATUS_COLORS } from "@/lib/utils/constants";
import type { GameWithTeams } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

interface GameScoreCardProps {
  game: GameWithTeams;
}

export function GameScoreCard({ game }: GameScoreCardProps) {
  const isFinal = game.status === "final";
  const isLive = game.status === "in_progress";

  const awayWon =
    isFinal &&
    game.away_score !== null &&
    game.home_score !== null &&
    game.away_score > game.home_score;

  const homeWon =
    isFinal &&
    game.away_score !== null &&
    game.home_score !== null &&
    game.home_score > game.away_score;

  return (
    <Link href={`/juegos/${game.id}`}>
      <Card
        className={cn(
          "cursor-pointer hover:border-zinc-600 transition-all",
          isLive && "glass-card border-amber-500/20"
        )}
      >
        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted">
              {formatGameDate(game.game_date)}
            </span>
            <Badge className={cn(GAME_STATUS_COLORS[game.status])}>
              {GAME_STATUS_LABELS[game.status]}
            </Badge>
          </div>

          <div className="space-y-0">
            {/* Away team */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "rounded-full",
                    awayWon ? "w-3 h-3" : "w-2.5 h-2.5",
                    !awayWon && isFinal && "opacity-60"
                  )}
                  style={{ backgroundColor: game.away_team.primary_color }}
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    awayWon && "font-bold",
                    !awayWon && isFinal && "text-zinc-400"
                  )}
                >
                  {game.away_team.name}
                </span>
              </div>
              {game.away_score !== null && (
                <span
                  className={cn(
                    "font-bold font-mono tabular-nums",
                    awayWon
                      ? "text-2xl text-emerald-400"
                      : isFinal
                        ? "text-base text-zinc-500"
                        : "text-lg"
                  )}
                >
                  {game.away_score}
                </span>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-zinc-800/60 mx-1" />

            {/* Home team */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "rounded-full",
                    homeWon ? "w-3 h-3" : "w-2.5 h-2.5",
                    !homeWon && isFinal && "opacity-60"
                  )}
                  style={{ backgroundColor: game.home_team.primary_color }}
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    homeWon && "font-bold",
                    !homeWon && isFinal && "text-zinc-400"
                  )}
                >
                  {game.home_team.name}
                </span>
              </div>
              {game.home_score !== null && (
                <span
                  className={cn(
                    "font-bold font-mono tabular-nums",
                    homeWon
                      ? "text-2xl text-emerald-400"
                      : isFinal
                        ? "text-base text-zinc-500"
                        : "text-lg"
                  )}
                >
                  {game.home_score}
                </span>
              )}
            </div>
          </div>

          {game.location && (
            <p className="text-xs text-zinc-600 mt-2">{game.location}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
