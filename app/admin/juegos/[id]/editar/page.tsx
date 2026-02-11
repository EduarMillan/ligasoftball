import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { NewGameForm } from "@/components/games/new-game-form";
import { DeleteGameButton } from "@/components/games/delete-game-button";
import { getGame } from "@/lib/queries/games";
import { getTeams } from "@/lib/queries/teams";
import { getSeasons } from "@/lib/queries/seasons";
import { updateGame } from "@/lib/actions/games";
import type { GameWithTeams } from "@/lib/types";

export default async function EditarJuegoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let game: GameWithTeams;
  try {
    game = await getGame(id);
  } catch {
    notFound();
  }

  const [teams, seasons] = await Promise.all([getTeams(), getSeasons()]);
  const updateGameWithId = updateGame.bind(null, id);

  return (
    <>
      <PageHeader
        title="Editar Juego"
        description={`${game.away_team.name} vs ${game.home_team.name}`}
      />

      <Card className="mb-4">
        <CardContent className="pt-2">
          <NewGameForm
            teams={teams}
            seasons={seasons}
            game={game}
            onSubmit={updateGameWithId}
          />
        </CardContent>
      </Card>

      <Card className="border-red-500/20">
        <CardContent className="pt-2">
          <h3 className="text-sm font-semibold text-red-400 mb-2">Zona de peligro</h3>
          <p className="text-sm text-muted mb-3">
            Eliminar el juego también eliminará todas sus estadísticas e innings.
          </p>
          <DeleteGameButton gameId={id} />
        </CardContent>
      </Card>
    </>
  );
}
