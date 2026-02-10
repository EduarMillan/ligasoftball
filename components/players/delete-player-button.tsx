"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { deletePlayer } from "@/lib/actions/players";
import { Trash2 } from "lucide-react";

interface DeletePlayerButtonProps {
  playerId: string;
  playerName: string;
}

export function DeletePlayerButton({ playerId, playerName }: DeletePlayerButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deletePlayer(playerId);
      if (result?.error) {
        toast("error", result.error);
        setConfirming(false);
      }
    });
  };

  if (!confirming) {
    return (
      <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
        <Trash2 size={14} />
        Eliminar Jugador
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3 animate-scale-in">
      <p className="text-sm text-red-400">
        Eliminar &quot;{playerName}&quot;?
      </p>
      <Button
        variant="danger"
        size="sm"
        loading={isPending}
        onClick={handleDelete}
      >
        Confirmar
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setConfirming(false)}
        disabled={isPending}
      >
        Cancelar
      </Button>
    </div>
  );
}
