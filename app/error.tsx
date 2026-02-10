"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-scale-in">
      <div className="rounded-full bg-red-500/10 p-4 mb-4">
        <AlertTriangle size={40} className="text-red-400" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Algo sali&oacute; mal</h2>
      <p className="text-muted text-sm mb-6 text-center max-w-md">
        Ocurri&oacute; un error inesperado. Puedes intentar nuevamente o volver al inicio.
      </p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={reset}>
          Reintentar
        </Button>
        <Button onClick={() => (window.location.href = "/")}>
          Ir al inicio
        </Button>
      </div>
    </div>
  );
}
