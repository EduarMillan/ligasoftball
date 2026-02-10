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

  return (
    <Link href={`/juegos/${game.id}`}>
      <Card className="cursor-pointer hover:border-zinc-600 transition-all">
        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted">
              {formatGameDate(game.game_date)}
            </span>
            <Badge className={cn(GAME_STATUS_COLORS[game.status])}>
              {GAME_STATUS_LABELS[game.status]}
            </Badge>
          </div>

          <div className="space-y-2">
            {/* Away team */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: game.away_team.primary_color }}
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    isFinal &&
                      game.away_score !== null &&
                      game.home_score !== null &&
                      game.away_score > game.home_score &&
                      "font-bold"
                  )}
                >
                  {game.away_team.name}
                </span>
              </div>
              {game.away_score !== null && (
                <span className="text-lg font-bold font-mono tabular-nums">
                  {game.away_score}
                </span>
              )}
            </div>

            {/* Home team */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: game.home_team.primary_color }}
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    isFinal &&
                      game.away_score !== null &&
                      game.home_score !== null &&
                      game.home_score > game.away_score &&
                      "font-bold"
                  )}
                >
                  {game.home_team.name}
                </span>
              </div>
              {game.home_score !== null && (
                <span className="text-lg font-bold font-mono tabular-nums">
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
