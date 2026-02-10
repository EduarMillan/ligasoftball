import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { TeamForm } from "@/components/forms/team-form";
import { DeleteTeamButton } from "@/components/teams/delete-team-button";
import { getTeam } from "@/lib/queries/teams";
import { updateTeam } from "@/lib/actions/teams";

export default async function EditarEquipoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let team;
  try {
    team = await getTeam(id);
  } catch {
    notFound();
  }

  const updateTeamWithId = updateTeam.bind(null, id);

  return (
    <>
      <PageHeader
        title="Editar Equipo"
        description={team.name}
      />

      <Card className="mb-4">
        <CardContent className="pt-2">
          <TeamForm team={team} onSubmit={updateTeamWithId} />
        </CardContent>
      </Card>

      <Card className="border-red-500/20">
        <CardContent className="pt-2">
          <h3 className="text-sm font-semibold text-red-400 mb-2">Zona de peligro</h3>
          <p className="text-sm text-muted mb-3">
            Eliminar el equipo también eliminará todos sus jugadores y estadísticas.
          </p>
          <DeleteTeamButton teamId={id} teamName={team.name} />
        </CardContent>
      </Card>
    </>
  );
}
