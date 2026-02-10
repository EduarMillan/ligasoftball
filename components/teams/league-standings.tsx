import { cn } from "@/lib/utils/cn";
import { calcWinPct } from "@/lib/utils/stats";
import type { TeamStanding } from "@/lib/types";

interface LeagueStandingsProps {
  standings: TeamStanding[];
  className?: string;
}

export function LeagueStandings({ standings, className }: LeagueStandingsProps) {
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
            <th className="px-3 py-2 text-center text-xs uppercase tracking-wider text-zinc-500 font-medium">
              CA
            </th>
            <th className="px-3 py-2 text-center text-xs uppercase tracking-wider text-zinc-500 font-medium">
              CR
            </th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team, i) => (
            <tr
              key={team.team_id}
              className="border-b border-border/50 hover:bg-zinc-800/30 transition-colors"
            >
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-600 w-4">{i + 1}</span>
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: team.primary_color }}
                  />
                  <span className="font-medium">{team.team_name}</span>
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
              <td className="px-3 py-2.5 text-center font-mono tabular-nums text-zinc-400">
                {team.runs_scored}
              </td>
              <td className="px-3 py-2.5 text-center font-mono tabular-nums text-zinc-400">
                {team.runs_allowed}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
