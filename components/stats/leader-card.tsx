import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

interface LeaderEntry {
  rank: number;
  name: string;
  team: string;
  value: string | number;
  teamColor?: string;
}

interface LeaderCardProps {
  title: string;
  entries: LeaderEntry[];
  className?: string;
}

export function LeaderCard({ title, entries, className }: LeaderCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {entries.map((entry) => (
          <div
            key={`${entry.name}-${entry.rank}`}
            className="flex items-center gap-3"
          >
            <span
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                entry.rank === 1
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-zinc-800 text-zinc-500"
              )}
            >
              {entry.rank}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{entry.name}</p>
              <p className="text-xs text-muted">{entry.team}</p>
            </div>
            <span className="text-lg font-bold font-mono tabular-nums">
              {entry.value}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
