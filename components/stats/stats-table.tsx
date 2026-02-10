import { cn } from "@/lib/utils/cn";

interface Column<T> {
  key: string;
  label: string;
  title?: string;
  align?: "left" | "center" | "right";
  render?: (row: T) => React.ReactNode;
}

interface StatsTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  className?: string;
  onRowClick?: (row: T) => void;
}

export function StatsTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyExtractor,
  className,
  onRowClick,
}: StatsTableProps<T>) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                title={col.title}
                className={cn(
                  "px-3 py-2 text-xs uppercase tracking-wider text-zinc-500 font-medium whitespace-nowrap",
                  col.title && "cursor-default",
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center",
                  (!col.align || col.align === "left") && "text-left"
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              {...(onRowClick ? { onClick: () => onRowClick(row) } : {})}
              className={cn(
                "border-b border-border/50 transition-colors",
                onRowClick && "cursor-pointer hover:bg-zinc-800/50"
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "px-3 py-2.5 font-mono tabular-nums whitespace-nowrap",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center"
                  )}
                >
                  {col.render
                    ? col.render(row)
                    : (row[col.key] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
