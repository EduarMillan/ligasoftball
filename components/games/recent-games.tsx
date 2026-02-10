import { GameScoreCard } from "./game-score-card";
import type { GameWithTeams } from "@/lib/types";

interface RecentGamesProps {
  games: GameWithTeams[];
}

export function RecentGames({ games }: RecentGamesProps) {
  return (
    <div className="space-y-3">
      {games.map((game) => (
        <GameScoreCard key={game.id} game={game} />
      ))}
    </div>
  );
}
