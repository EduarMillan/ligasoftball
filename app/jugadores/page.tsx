import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { PlayerCard } from "@/components/players/player-card";
import { getPlayers } from "@/lib/queries/players";
import { isAdmin } from "@/lib/auth";
import { User, Plus } from "lucide-react";
import type { PlayerWithTeam } from "@/lib/types";

export default async function JugadoresPage() {
  const [players, admin] = await Promise.all([
    getPlayers() as Promise<PlayerWithTeam[]>,
    isAdmin(),
  ]);

  return (
    <>
      <PageHeader
        title="Jugadores"
        description="Todos los jugadores de la liga"
        action={
          admin ? (
            <Link href="/admin/jugadores/nuevo">
              <Button size="sm">
                <Plus size={16} />
                Nuevo
              </Button>
            </Link>
          ) : undefined
        }
      />

      {players.length === 0 ? (
        <EmptyState
          icon={<User size={40} />}
          title="No hay jugadores"
          description="Crea el primer jugador para comenzar"
          action={
            admin ? (
              <Link href="/admin/jugadores/nuevo">
                <Button>
                  <Plus size={16} />
                  Crear Jugador
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}
    </>
  );
}
