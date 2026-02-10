"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { updateGameStatus } from "@/lib/actions/games";
import { GAME_STATUS_LABELS, GAME_STATUS_COLORS, type GameStatus } from "@/lib/utils/constants";
import { cn } from "@/lib/utils/cn";
import { Play, CheckCircle } from "lucide-react";

interface GameStatusControlProps {
  gameId: string;
  status: GameStatus;
}

export function GameStatusControl({ gameId, status }: GameStatusControlProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleStatusChange = (newStatus: GameStatus) => {
    startTransition(async () => {
      const result = await updateGameStatus(gameId, newStatus);
      if (result?.error) {
        toast("error", result.error);
      } else {
        toast("success", `Estado actualizado a ${GAME_STATUS_LABELS[newStatus]}`);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Badge className={cn(GAME_STATUS_COLORS[status])}>
        {GAME_STATUS_LABELS[status]}
      </Badge>

      {status === "scheduled" && (
        <Button
          variant="secondary"
          size="sm"
          loading={isPending}
          onClick={() => handleStatusChange("in_progress")}
        >
          <Play size={14} />
          Iniciar
        </Button>
      )}
      {status === "in_progress" && (
        <Button
          variant="primary"
          size="sm"
          loading={isPending}
          onClick={() => handleStatusChange("final")}
        >
          <CheckCircle size={14} />
          Finalizar
        </Button>
      )}
    </div>
  );
}
