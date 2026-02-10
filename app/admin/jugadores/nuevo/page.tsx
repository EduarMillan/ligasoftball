import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { PlayerForm } from "@/components/forms/player-form";
import { getTeams } from "@/lib/queries/teams";
import { createPlayer } from "@/lib/actions/players";

export default async function NuevoJugadorPage({
  searchParams,
}: {
  searchParams: Promise<{ team?: string }>;
}) {
  const { team: defaultTeamId } = await searchParams;
  const teams = await getTeams();

  return (
    <>
      <PageHeader
        title="Crear Jugador"
        description="Registra un nuevo jugador en la liga"
      />

      <Card>
        <CardContent className="pt-2">
          <PlayerForm
            teams={teams}
            defaultTeamId={defaultTeamId}
            onSubmit={createPlayer}
          />
        </CardContent>
      </Card>
    </>
  );
}
