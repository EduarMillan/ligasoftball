"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { deleteGame } from "@/lib/actions/games";
import { Trash2 } from "lucide-react";

interface DeleteGameButtonProps {
  gameId: string;
}

export function DeleteGameButton({ gameId }: DeleteGameButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteGame(gameId);
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
        Eliminar Juego
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3 animate-scale-in">
      <p className="text-sm text-red-400">Eliminar este juego?</p>
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
