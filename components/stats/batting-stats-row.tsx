import { cn } from "@/lib/utils/cn";

interface BattingStatsRowProps {
  playerName: string;
  jerseyNumber: number;
  ab: number;
  h: number;
  doubles: number;
  triples: number;
  hr: number;
  r: number;
  rbi: number;
  bb: number;
  so: number;
  avg: string;
  className?: string;
}

export function BattingStatsRow({
  playerName,
  jerseyNumber,
  ab,
  h,
  doubles,
  triples,
  hr,
  r,
  rbi,
  bb,
  so,
  avg,
  className,
}: BattingStatsRowProps) {
  return (
    <tr className={cn("border-b border-border/50", className)}>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 w-6 text-right font-mono">
            #{jerseyNumber}
          </span>
          <span className="text-sm font-medium">{playerName}</span>
        </div>
      </td>
      <td className="px-2 py-2 text-center font-mono tabular-nums text-sm">
        {ab}
      </td>
      <td className="px-2 py-2 text-center font-mono tabular-nums text-sm">
        {h}
      </td>
      <td className="px-2 py-2 text-center font-mono tabular-nums text-sm">
        {doubles}
      </td>
      <td className="px-2 py-2 text-center font-mono tabular-nums text-sm">
        {triples}
      </td>
      <td className="px-2 py-2 text-center font-mono tabular-nums text-sm">
        {hr}
      </td>
      <td className="px-2 py-2 text-center font-mono tabular-nums text-sm">
        {r}
      </td>
      <td className="px-2 py-2 text-center font-mono tabular-nums text-sm">
        {rbi}
      </td>
      <td className="px-2 py-2 text-center font-mono tabular-nums text-sm">
        {bb}
      </td>
      <td className="px-2 py-2 text-center font-mono tabular-nums text-sm">
        {so}
      </td>
      <td className="px-2 py-2 text-center font-mono tabular-nums text-sm font-semibold">
        {avg}
      </td>
    </tr>
  );
}
