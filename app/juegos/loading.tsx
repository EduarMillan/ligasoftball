import { Skeleton } from "@/components/ui/skeleton";

export default function JuegosLoading() {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Skeleton className="h-8 w-28 mb-2" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-2xl p-4"
          >
            <Skeleton className="h-4 w-20 mb-3" />
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-8" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-8" />
            </div>
            <Skeleton className="h-3 w-32 mt-3" />
          </div>
        ))}
      </div>
    </div>
  );
}
