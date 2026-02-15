import { cn } from "@/lib/utils/cn";
import { calcWinPct } from "@/lib/utils/stats";
import { Avatar } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";
import type { TeamStanding } from "@/lib/types";

interface LeagueStandingsProps {
  standings: TeamStanding[];
  className?: string;
}

const TROPHY_COLORS: Record<number, string> = {
  0: "text-amber-400",
  1: "text-zinc-300",
  2: "text-amber-700",
};

export function LeagueStandings({ standings, className }: LeagueStandingsProps) {
  const maxWins = Math.max(...standings.map((t) => t.wins + t.losses), 1);

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-zinc-500 font-medium">
              Equipo
            </th>
            <th className="px-3 py-2 text-center text-xs uppercase tracking-wider text-zinc-500 font-medium">
              G
            </th>
            <th className="px-3 py-2 text-center text-xs uppercase tracking-wider text-zinc-500 font-medium">
              P
            </th>
            <th className="px-3 py-2 text-center text-xs uppercase tracking-wider text-zinc-500 font-medium">
              PCT
            </th>
            <th className="px-3 py-2 text-center text-xs uppercase tracking-wider text-zinc-500 font-medium hidden sm:table-cell">
              CA
            </th>
            <th className="px-3 py-2 text-center text-xs uppercase tracking-wider text-zinc-500 font-medium hidden sm:table-cell">
              CR
            </th>
            <th className="px-3 py-2 text-xs uppercase tracking-wider text-zinc-500 font-medium w-24 hidden md:table-cell">
              %
            </th>
          </tr>
        </thead>
        <tbody className="stagger-rows">
          {standings.map((team, i) => {
            const total = team.wins + team.losses;
            const pct = total > 0 ? (team.wins / total) * 100 : 0;

            return (
              <tr
                key={team.team_id}
                className={cn(
                  "border-b border-border/50 hover:bg-zinc-800/30 transition-colors",
                  i === 0 && "bg-amber-500/5"
                )}
              >
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    {i < 3 ? (
                      <span className="w-4 flex justify-center">
                        <Trophy size={14} className={TROPHY_COLORS[i]} />
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-600 w-4 text-center">{i + 1}</span>
                    )}
                    <Avatar
                      src={team.logo_url}
                      alt={team.team_name}
                      fallback={team.short_name.slice(0, 2)}
                      size="sm"
                    />
                    <span className={cn("font-medium", i === 0 && "text-zinc-100")}>
                      {team.team_name}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-center font-mono tabular-nums text-emerald-400">
                  {team.wins}
                </td>
                <td className="px-3 py-2.5 text-center font-mono tabular-nums text-red-400">
                  {team.losses}
                </td>
                <td className="px-3 py-2.5 text-center font-mono tabular-nums font-semibold">
                  {calcWinPct(team.wins, team.losses)}
                </td>
                <td className="px-3 py-2.5 text-center font-mono tabular-nums text-zinc-400 hidden sm:table-cell">
                  {team.runs_scored}
                </td>
                <td className="px-3 py-2.5 text-center font-mono tabular-nums text-zinc-400 hidden sm:table-cell">
                  {team.runs_allowed}
                </td>
                <td className="px-3 py-2.5 hidden md:table-cell">
                  <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-500/70 animate-win-bar"
                      style={{
                        "--bar-width": `${pct}%`,
                        animationDelay: `${i * 80}ms`,
                      } as React.CSSProperties}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
