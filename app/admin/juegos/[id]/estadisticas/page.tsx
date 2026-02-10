import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { StatsPageClient } from "@/components/games/stats-page-client";
import { getGame } from "@/lib/queries/games";
import { getPlayersByTeam } from "@/lib/queries/players";
import { getPlayerGameStats } from "@/lib/queries/stats";
import { formatGameDate } from "@/lib/utils/format";
import type { GameWithTeams } from "@/lib/types";

export default async function EstadisticasJuegoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let game: GameWithTeams;
  try {
    game = await getGame(id) as GameWithTeams;
  } catch {
    notFound();
  }

  const [awayPlayers, homePlayers, existingStats] = await Promise.all([
    getPlayersByTeam(game.away_team_id),
    getPlayersByTeam(game.home_team_id),
    getPlayerGameStats(id),
  ]);

  return (
    <>
      <PageHeader
        title="Entrada de Estadísticas"
        description={`${game.away_team.short_name} @ ${game.home_team.short_name} — ${formatGameDate(game.game_date)}`}
      />

      <StatsPageClient
        game={game}
        awayPlayers={awayPlayers}
        homePlayers={homePlayers}
        existingStats={existingStats}
      />
    </>
  );
}
