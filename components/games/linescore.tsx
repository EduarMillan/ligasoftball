import { cn } from "@/lib/utils/cn";
import type { GameInning, Team } from "@/lib/types";

interface LinescoreProps {
  innings: GameInning[];
  awayTeam: Team;
  homeTeam: Team;
  awayScore: number | null;
  homeScore: number | null;
  totalInnings: number;
}

export function Linescore({
  innings,
  awayTeam,
  homeTeam,
  awayScore,
  homeScore,
  totalInnings,
}: LinescoreProps) {
  // Build lookup: { [teamId]: { [inning]: { runs, hits, errors } } }
  const byTeam = new Map<string, Map<number, GameInning>>();
  for (const inn of innings) {
    if (!byTeam.has(inn.team_id)) byTeam.set(inn.team_id, new Map());
    byTeam.get(inn.team_id)!.set(inn.inning, inn);
  }

  const awayInnings = byTeam.get(awayTeam.id) ?? new Map<number, GameInning>();
  const homeInnings = byTeam.get(homeTeam.id) ?? new Map<number, GameInning>();

  // Determine how many inning columns to show
  const maxInningFromData = innings.reduce((max, i) => Math.max(max, i.inning), 0);
  const numCols = Math.max(totalInnings, maxInningFromData);
  const inningNums = Array.from({ length: numCols }, (_, i) => i + 1);

  // Totals
  const awayTotalH = inningNums.reduce((s, n) => s + (awayInnings.get(n)?.hits ?? 0), 0);
  const homeTotalH = inningNums.reduce((s, n) => s + (homeInnings.get(n)?.hits ?? 0), 0);
  // E convention: each entry stores the FIELDING team's errors during that half-inning.
  // Away entries hold home's errors (during top), home entries hold away's errors (during bottom).
  // Swap so each row displays that team's OWN errors.
  const awayOwnErrors = inningNums.reduce((s, n) => s + (homeInnings.get(n)?.errors ?? 0), 0);
  const homeOwnErrors = inningNums.reduce((s, n) => s + (awayInnings.get(n)?.errors ?? 0), 0);

  const thClass =
    "px-2 py-1.5 text-center text-[10px] uppercase tracking-wider text-zinc-500 font-medium";
  const tdClass =
    "px-2 py-1.5 text-center text-xs font-mono tabular-nums";

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-2 py-1.5 text-left text-[10px] uppercase tracking-wider text-zinc-500 font-medium min-w-[80px]">
              Equipo
            </th>
            {inningNums.map((n) => (
              <th key={n} className={thClass}>
                {n}
              </th>
            ))}
            <th className={cn(thClass, "border-l border-border text-amber-500/70")}>R</th>
            <th className={cn(thClass, "text-zinc-400")}>H</th>
            <th className={cn(thClass, "text-zinc-400")}>E</th>
          </tr>
        </thead>
        <tbody>
          {/* Away row */}
          <tr className="border-b border-border/30">
            <td className="px-2 py-1.5">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: awayTeam.primary_color }}
                />
                <span className="text-xs font-semibold">{awayTeam.short_name}</span>
              </div>
            </td>
            {inningNums.map((n) => {
              const inn = awayInnings.get(n);
              return (
                <td key={n} className={cn(tdClass, inn && inn.runs > 0 && "text-foreground font-semibold", (!inn || inn.runs === 0) && "text-zinc-600")}>
                  {inn ? inn.runs : "-"}
                </td>
              );
            })}
            <td className={cn(tdClass, "border-l border-border font-bold text-amber-400")}>
              {awayScore ?? 0}
            </td>
            <td className={cn(tdClass, "text-zinc-300")}>{awayTotalH}</td>
            <td className={cn(tdClass, "text-zinc-300")}>{awayOwnErrors}</td>
          </tr>

          {/* Home row */}
          <tr>
            <td className="px-2 py-1.5">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: homeTeam.primary_color }}
                />
                <span className="text-xs font-semibold">{homeTeam.short_name}</span>
              </div>
            </td>
            {inningNums.map((n) => {
              const inn = homeInnings.get(n);
              return (
                <td key={n} className={cn(tdClass, inn && inn.runs > 0 && "text-foreground font-semibold", (!inn || inn.runs === 0) && "text-zinc-600")}>
                  {inn ? inn.runs : "-"}
                </td>
              );
            })}
            <td className={cn(tdClass, "border-l border-border font-bold text-amber-400")}>
              {homeScore ?? 0}
            </td>
            <td className={cn(tdClass, "text-zinc-300")}>{homeTotalH}</td>
            <td className={cn(tdClass, "text-zinc-300")}>{homeOwnErrors}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
