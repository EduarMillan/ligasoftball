"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { Medal, ChevronDown, ChevronUp } from "lucide-react";

interface LeaderEntry {
  rank: number;
  name: string;
  team: string;
  value: string | number;
  teamColor?: string;
}

interface LeaderCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  entries: LeaderEntry[];
  className?: string;
  defaultVisible?: number;
}

const MEDAL_COLORS: Record<number, string> = {
  1: "text-amber-400",
  2: "text-zinc-300",
  3: "text-amber-700",
};

export function LeaderCard({
  title,
  subtitle,
  icon,
  entries,
  className,
  defaultVisible = 5,
}: LeaderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = entries.length > defaultVisible;
  const visible = expanded ? entries : entries.slice(0, defaultVisible);

  return (
    <Card className={cn("glass-card border-gradient", className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {subtitle && (
              <p className="text-xs text-muted mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {visible.map((entry) => (
          <div
            key={`${entry.name}-${entry.rank}`}
            className={cn(
              "flex items-center gap-3 px-2 py-1.5 rounded-lg transition-colors",
              entry.rank === 1 && "bg-amber-500/5"
            )}
          >
            {entry.rank <= 3 ? (
              <span
                className={cn(
                  "w-6 h-6 flex items-center justify-center",
                  entry.rank === 1 && "glow-amber rounded-full"
                )}
              >
                <Medal size={16} className={MEDAL_COLORS[entry.rank]} />
              </span>
            ) : (
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-zinc-800 text-zinc-500">
                {entry.rank}
              </span>
            )}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm font-medium truncate",
                  entry.rank === 1 && "text-amber-50"
                )}
              >
                {entry.name}
              </p>
              <p className="text-xs text-muted">{entry.team}</p>
            </div>
            <span
              className={cn(
                "text-lg font-bold font-mono tabular-nums",
                entry.rank === 1 && "text-amber-400"
              )}
            >
              {entry.value}
            </span>
          </div>
        ))}
        {hasMore && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1 text-xs text-amber-500 hover:text-amber-400 transition-colors py-2 mt-1"
          >
            {expanded ? (
              <>
                Ver menos <ChevronUp size={14} />
              </>
            ) : (
              <>
                Ver más <ChevronDown size={14} />
              </>
            )}
          </button>
        )}
      </CardContent>
    </Card>
  );
}
