import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { TeamCard } from "@/components/teams/team-card";
import { getTeams } from "@/lib/queries/teams";
import { isAdmin } from "@/lib/auth";
import { Users, Plus } from "lucide-react";

export default async function EquiposPage() {
  const [teams, admin] = await Promise.all([getTeams(), isAdmin()]);

  return (
    <>
      <PageHeader
        title="Equipos"
        description="Todos los equipos de la liga"
        action={
          admin ? (
            <Link href="/admin/equipos/nuevo">
              <Button size="sm">
                <Plus size={16} />
                Nuevo
              </Button>
            </Link>
          ) : undefined
        }
      />

      {teams.length === 0 ? (
        <EmptyState
          icon={<Users size={40} />}
          title="No hay equipos"
          description="Crea el primer equipo para comenzar"
          action={
            admin ? (
              <Link href="/admin/equipos/nuevo">
                <Button>
                  <Plus size={16} />
                  Crear Equipo
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 stagger-children">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </>
  );
}
