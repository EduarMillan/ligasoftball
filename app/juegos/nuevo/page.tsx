import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { NewGameForm } from "@/components/games/new-game-form";
import { getTeams } from "@/lib/queries/teams";
import { getSeasons } from "@/lib/queries/seasons";
import { createGame } from "@/lib/actions/games";
import { AlertCircle } from "lucide-react";

export default async function NuevoJuegoPage() {
  const [teams, seasons] = await Promise.all([getTeams(), getSeasons()]);

  const canCreate = teams.length >= 2 && seasons.length >= 1;

  return (
    <>
      <PageHeader
        title="Nuevo Juego"
        description="Programa un nuevo juego"
      />

      <Card>
        <CardContent className="pt-2">
          {canCreate ? (
            <NewGameForm
              teams={teams}
              seasons={seasons}
              onSubmit={createGame}
            />
          ) : (
            <EmptyState
              icon={<AlertCircle size={32} />}
              title="No se puede crear un juego"
              description={
                teams.length < 2
                  ? "Necesitas al menos 2 equipos registrados"
                  : "Necesitas al menos 1 temporada registrada"
              }
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
