"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { deleteTeam } from "@/lib/actions/teams";
import { Trash2 } from "lucide-react";

interface DeleteTeamButtonProps {
  teamId: string;
  teamName: string;
}

export function DeleteTeamButton({ teamId, teamName }: DeleteTeamButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteTeam(teamId);
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
        Eliminar Equipo
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3 animate-scale-in">
      <p className="text-sm text-red-400">
        Eliminar &quot;{teamName}&quot;?
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
