import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { PlayerForm } from "@/components/forms/player-form";
import { DeletePlayerButton } from "@/components/players/delete-player-button";
import { getPlayer } from "@/lib/queries/players";
import { getTeams } from "@/lib/queries/teams";
import { updatePlayer } from "@/lib/actions/players";
import { formatFullName } from "@/lib/utils/format";

export default async function EditarJugadorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let player;
  try {
    player = await getPlayer(id);
  } catch {
    notFound();
  }

  const teams = await getTeams();
  const updatePlayerWithId = updatePlayer.bind(null, id);

  return (
    <>
      <PageHeader
        title="Editar Jugador"
        description={formatFullName(player.first_name, player.last_name)}
      />

      <Card className="mb-4">
        <CardContent className="pt-2">
          <PlayerForm
            player={player}
            teams={teams}
            onSubmit={updatePlayerWithId}
          />
        </CardContent>
      </Card>

      <Card className="border-red-500/20">
        <CardContent className="pt-2">
          <h3 className="text-sm font-semibold text-red-400 mb-2">Zona de peligro</h3>
          <p className="text-sm text-muted mb-3">
            Eliminar el jugador también eliminará todas sus estadísticas.
          </p>
          <DeletePlayerButton
            playerId={id}
            playerName={formatFullName(player.first_name, player.last_name)}
          />
        </CardContent>
      </Card>
    </>
  );
}
