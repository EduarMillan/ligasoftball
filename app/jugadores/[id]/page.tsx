import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PlayerProfile } from "@/components/players/player-profile";
import { StatsGrid } from "@/components/stats/stats-grid";
import { PlayerGameLog } from "@/components/players/player-game-log";
import { getPlayer } from "@/lib/queries/players";
import { getPlayerCareerBatting } from "@/lib/queries/players";
import { getPlayerGameLog } from "@/lib/queries/stats";
import { formatFullName } from "@/lib/utils/format";
import { DeletePlayerButton } from "@/components/players/delete-player-button";
import { Pencil, BarChart3 } from "lucide-react";
import type { PlayerWithTeam } from "@/lib/types";

export default async function JugadorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let player: PlayerWithTeam;
  try {
    player = await getPlayer(id) as PlayerWithTeam;
  } catch {
    notFound();
  }

  const [battingStats, gameLog] = await Promise.all([
    getPlayerCareerBatting(id),
    getPlayerGameLog(id),
  ]);

  const batting = battingStats[0];

  return (
    <>
      <PageHeader
        title={formatFullName(player.first_name, player.last_name)}
        action={
          <div className="flex items-center gap-2">
            <Link href={`/admin/jugadores/${id}/editar`}>
              <Button variant="secondary" size="sm">
                <Pencil size={14} />
                Editar
              </Button>
            </Link>
            <DeletePlayerButton
              playerId={id}
              playerName={formatFullName(player.first_name, player.last_name)}
            />
          </div>
        }
      />

      <PlayerProfile player={player} />

      {/* Career batting stats */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Estadísticas de Carrera</CardTitle>
        </CardHeader>
        <CardContent>
          {batting ? (
            <StatsGrid
              columns={6}
              stats={[
                { label: "G", value: batting.games_played },
                { label: "AB", value: batting.ab },
                { label: "H", value: batting.h },
                { label: "HR", value: batting.hr },
                { label: "RBI", value: batting.rbi },
                { label: "R", value: batting.r },
                { label: "BB", value: batting.bb },
                { label: "SO", value: batting.so },
                { label: "SB", value: batting.sb },
                { label: "AVG", value: batting.avg.toFixed(3).replace(/^0/, "") },
                { label: "OBP", value: batting.obp.toFixed(3).replace(/^0/, "") },
                { label: "OPS", value: batting.ops.toFixed(3).replace(/^0/, "") },
              ]}
            />
          ) : (
            <EmptyState
              icon={<BarChart3 size={32} />}
              title="Sin estadísticas"
              description="Las estadísticas aparecerán cuando haya juegos registrados"
            />
          )}
        </CardContent>
      </Card>

      {/* Game log */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Juego por Juego</CardTitle>
        </CardHeader>
        <CardContent>
          {gameLog.length > 0 ? (
            <PlayerGameLog entries={gameLog as never[]} />
          ) : (
            <EmptyState
              icon={<BarChart3 size={32} />}
              title="Sin juegos"
              description="El historial de juegos aparecerá aquí"
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
