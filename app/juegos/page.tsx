import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { GameScoreCard } from "@/components/games/game-score-card";
import { getGames } from "@/lib/queries/games";
import { isAdmin } from "@/lib/auth";
import { Calendar, Plus } from "lucide-react";
import type { GameWithTeams } from "@/lib/types";

export default async function JuegosPage() {
  const [games, admin] = await Promise.all([
    getGames() as Promise<GameWithTeams[]>,
    isAdmin(),
  ]);

  return (
    <>
      <PageHeader
        title="Juegos"
        description="Resultados y juegos programados"
        action={
          admin ? (
            <Link href="/juegos/nuevo">
              <Button size="sm">
                <Plus size={16} />
                Nuevo
              </Button>
            </Link>
          ) : undefined
        }
      />

      {games.length === 0 ? (
        <EmptyState
          icon={<Calendar size={40} />}
          title="No hay juegos"
          description="Programa el primer juego de la temporada"
          action={
            admin ? (
              <Link href="/juegos/nuevo">
                <Button>
                  <Plus size={16} />
                  Crear Juego
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 stagger-children">
          {games.map((game) => (
            <GameScoreCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </>
  );
}
