import { cn } from "@/lib/utils/cn";
import { calcAvg } from "@/lib/utils/stats";
import { formatShortDate } from "@/lib/utils/format";
import { getStatLabel } from "@/lib/utils/stat-labels";
import type { PlayerGameStats, Game } from "@/lib/types";

type GameLogEntry = PlayerGameStats & {
  game: Game;
};

interface PlayerGameLogProps {
  entries: GameLogEntry[];
  className?: string;
}

export function PlayerGameLog({ entries, className }: PlayerGameLogProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {["Fecha", "AB", "H", "HR", "RBI", "R", "E", "AVG"].map((h) => (
              <th
                key={h}
                title={h !== "Fecha" ? getStatLabel(h) : undefined}
                className={cn(
                  "py-2 text-xs uppercase tracking-wider text-zinc-500 font-medium cursor-default",
                  h === "Fecha" ? "px-3 text-left" : "px-2 text-center"
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.id}
              className="border-b border-border/50 hover:bg-zinc-800/30 transition-colors"
            >
              <td className="px-3 py-2.5 text-muted">
                {formatShortDate(entry.game.game_date)}
              </td>
              <td className="px-2 py-2.5 text-center font-mono tabular-nums">
                {entry.at_bats}
              </td>
              <td className="px-2 py-2.5 text-center font-mono tabular-nums">
                {entry.hits}
              </td>
              <td className="px-2 py-2.5 text-center font-mono tabular-nums">
                {entry.home_runs}
              </td>
              <td className="px-2 py-2.5 text-center font-mono tabular-nums">
                {entry.rbi}
              </td>
              <td className="px-2 py-2.5 text-center font-mono tabular-nums">
                {entry.runs}
              </td>
              <td className="px-2 py-2.5 text-center font-mono tabular-nums">
                {entry.errors}
              </td>
              <td className="px-2 py-2.5 text-center font-mono tabular-nums font-semibold">
                {calcAvg(entry.hits, entry.at_bats)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
