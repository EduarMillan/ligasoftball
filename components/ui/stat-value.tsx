import { cn } from "@/lib/utils/cn";
import { getStatLabel } from "@/lib/utils/stat-labels";

interface StatValueProps {
  label: string;
  value: string | number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: { value: "text-lg font-bold font-mono", label: "text-[10px]" },
  md: { value: "text-2xl font-bold font-mono", label: "text-xs" },
  lg: { value: "text-3xl font-bold font-mono", label: "text-xs" },
};

export function StatValue({
  label,
  value,
  size = "md",
  className,
}: StatValueProps) {
  const styles = sizeStyles[size];

  return (
    <div className={cn("flex flex-col items-center cursor-default", className)} title={getStatLabel(label)}>
      <span className={cn(styles.value, "stat-value text-foreground")}>
        {value}
      </span>
      <span
        className={cn(
          styles.label,
          "uppercase tracking-wider text-muted mt-0.5"
        )}
      >
        {label}
      </span>
    </div>
  );
}
