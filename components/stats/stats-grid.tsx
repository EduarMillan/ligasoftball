import { cn } from "@/lib/utils/cn";
import { StatValue } from "@/components/ui/stat-value";

interface StatItem {
  label: string;
  value: string | number;
}

interface StatsGridProps {
  stats: StatItem[];
  columns?: 3 | 4 | 5 | 6;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const colStyles = {
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-3 sm:grid-cols-6",
};

export function StatsGrid({
  stats,
  columns = 4,
  size = "md",
  className,
}: StatsGridProps) {
  return (
    <div className={cn("grid gap-4", colStyles[columns], className)}>
      {stats.map((stat) => (
        <StatValue
          key={stat.label}
          label={stat.label}
          value={stat.value}
          size={size}
        />
      ))}
    </div>
  );
}
