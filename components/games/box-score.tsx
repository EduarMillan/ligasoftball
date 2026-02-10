import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { calcAvg } from "@/lib/utils/stats";
import { getStatLabel } from "@/lib/utils/stat-labels";
import type { PlayerGameStats, Player, Team } from "@/lib/types";

type StatWithPlayer = PlayerGameStats & { player: Player };

interface BoxScoreProps {
  homeTeam: Team;
  awayTeam: Team;
  stats: StatWithPlayer[];
  className?: string;
}

function TeamBattingTable({
  team,
  teamStats,
}: {
  team: Team;
  teamStats: StatWithPlayer[];
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 px-1">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: team.primary_color }}
        />
        <h4 className="text-sm font-semibold">{team.name}</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Jugador", "AB", "H", "2B", "3B", "HR", "R", "RBI", "BB", "SO", "E", "AVG"].map(
                (h) => (
                  <th
                    key={h}
                    title={h !== "Jugador" ? getStatLabel(h) : undefined}
                    className={cn(
                      "px-2 py-1.5 text-xs uppercase tracking-wider text-zinc-500 font-medium whitespace-nowrap cursor-default",
                      h !== "Jugador" && "text-center"
                    )}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {teamStats.map((s) => (
              <tr
                key={s.id}
                className="border-b border-border/30 hover:bg-zinc-800/30"
              >
                <td className="px-2 py-1.5 font-medium whitespace-nowrap">
                  {s.player.first_name} {s.player.last_name}
                </td>
                <td className="px-2 py-1.5 text-center font-mono tabular-nums">
                  {s.at_bats}
                </td>
                <td className="px-2 py-1.5 text-center font-mono tabular-nums">
                  {s.hits}
                </td>
                <td className="px-2 py-1.5 text-center font-mono tabular-nums">
                  {s.doubles}
                </td>
                <td className="px-2 py-1.5 text-center font-mono tabular-nums">
                  {s.triples}
                </td>
                <td className="px-2 py-1.5 text-center font-mono tabular-nums">
                  {s.home_runs}
                </td>
                <td className="px-2 py-1.5 text-center font-mono tabular-nums">
                  {s.runs}
                </td>
                <td className="px-2 py-1.5 text-center font-mono tabular-nums">
                  {s.rbi}
                </td>
                <td className="px-2 py-1.5 text-center font-mono tabular-nums">
                  {s.walks}
                </td>
                <td className="px-2 py-1.5 text-center font-mono tabular-nums">
                  {s.strikeouts}
                </td>
                <td className="px-2 py-1.5 text-center font-mono tabular-nums">
                  {s.errors}
                </td>
                <td className="px-2 py-1.5 text-center font-mono tabular-nums font-semibold">
                  {calcAvg(s.hits, s.at_bats)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function BoxScore({ homeTeam, awayTeam, stats, className }: BoxScoreProps) {
  const homeStats = stats.filter((s) => s.team_id === homeTeam.id);
  const awayStats = stats.filter((s) => s.team_id === awayTeam.id);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Box Score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <TeamBattingTable team={awayTeam} teamStats={awayStats} />
        <TeamBattingTable team={homeTeam} teamStats={homeStats} />
      </CardContent>
    </Card>
  );
}
