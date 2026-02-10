import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-scale-in">
      <p className="text-7xl font-bold text-amber-500 mb-2">404</p>
      <h2 className="text-xl font-semibold mb-2">P&aacute;gina no encontrada</h2>
      <p className="text-muted text-sm mb-6 text-center max-w-md">
        La p&aacute;gina que buscas no existe o fue movida.
      </p>
      <Link href="/">
        <Button>Volver al inicio</Button>
      </Link>
    </div>
  );
}
