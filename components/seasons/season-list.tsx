"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { toggleSeasonActive, deleteSeason } from "@/lib/actions/seasons";
import { formatDate } from "@/lib/utils/format";
import type { Season } from "@/lib/types";
import { Star, Trash2 } from "lucide-react";

interface SeasonListProps {
  seasons: Season[];
}

export function SeasonList({ seasons }: SeasonListProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleActivate = (id: string) => {
    startTransition(async () => {
      const result = await toggleSeasonActive(id);
      if (result?.error) {
        toast("error", result.error);
      } else {
        toast("success", "Temporada activada");
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteSeason(id);
      if (result?.error) {
        toast("error", result.error);
        setConfirmId(null);
      }
    });
  };

  return (
    <div className="space-y-2">
      {seasons.map((season) => (
        <div
          key={season.id}
          className="flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-card hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{season.name}</span>
                {season.is_active && (
                  <Badge variant="accent">Activa</Badge>
                )}
              </div>
              <p className="text-sm text-muted mt-0.5">
                {formatDate(season.start_date)}
                {season.end_date && ` — ${formatDate(season.end_date)}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!season.is_active && (
              <Button
                variant="ghost"
                size="sm"
                loading={isPending}
                onClick={() => handleActivate(season.id)}
              >
                <Star size={14} />
                Activar
              </Button>
            )}
            {confirmId === season.id ? (
              <div className="flex items-center gap-2 animate-scale-in">
                <Button
                  variant="danger"
                  size="sm"
                  loading={isPending}
                  onClick={() => handleDelete(season.id)}
                >
                  Confirmar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmId(null)}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setConfirmId(season.id)}
              >
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
