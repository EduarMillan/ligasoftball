import { cn } from "@/lib/utils/cn";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "success" | "danger" | "muted";
}

const variantStyles: Record<string, string> = {
  default: "bg-zinc-800 text-zinc-300",
  accent: "bg-amber-500/20 text-amber-400",
  success: "bg-emerald-500/20 text-emerald-400",
  danger: "bg-red-500/20 text-red-400",
  muted: "bg-zinc-800/50 text-zinc-500",
};

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
