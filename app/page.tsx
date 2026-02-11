import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { LeagueStandings } from "@/components/teams/league-standings";
import { GameScoreCard } from "@/components/games/game-score-card";
import { LeaderCard } from "@/components/stats/leader-card";
import { getTeamStandings } from "@/lib/queries/teams";
import { getRecentGames, getUpcomingGames } from "@/lib/queries/games";
import { getBattingLeaders, getHomeRunLeaders, getStolenBaseLeaders } from "@/lib/queries/stats";
import { isAdmin } from "@/lib/auth";
import { Trophy, Calendar, TrendingUp, Plus } from "lucide-react";
import type { GameWithTeams, TeamStanding } from "@/lib/types";

export default async function DashboardPage() {
  const [standings, recentGames, upcomingGames, avgLeaders, hrLeaders, sbLeaders, admin] =
    await Promise.all([
      getTeamStandings().catch(() => [] as TeamStanding[]),
      getRecentGames(4).catch(() => []) as Promise<GameWithTeams[]>,
      getUpcomingGames(4).catch(() => []) as Promise<GameWithTeams[]>,
      getBattingLeaders(undefined, 5).catch(() => []),
      getHomeRunLeaders(undefined, 5).catch(() => []),
      getStolenBaseLeaders(undefined, 5).catch(() => []),
      isAdmin(),
    ]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Resumen de la Liga de Softball"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Standings + Recent */}
        <div className="lg:col-span-2 space-y-6">
          {/* Standings */}
          <Card>
            <CardHeader>
              <CardTitle>Clasificación</CardTitle>
              <Link href="/equipos">
                <Button variant="ghost" size="sm">Ver todos</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {standings.length > 0 ? (
                <LeagueStandings standings={standings} />
              ) : (
                <EmptyState
                  icon={<Trophy size={32} />}
                  title="Sin datos"
                  description="La clasificación aparecerá cuando haya juegos finalizados"
                />
              )}
            </CardContent>
          </Card>

          {/* Recent games */}
          <Card>
            <CardHeader>
              <CardTitle>Juegos Recientes</CardTitle>
              <Link href="/juegos">
                <Button variant="ghost" size="sm">Ver todos</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentGames.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 stagger-children">
                  {recentGames.map((game) => (
                    <GameScoreCard key={game.id} game={game} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Calendar size={32} />}
                  title="Sin juegos recientes"
                  description="Los resultados aparecerán aquí"
                />
              )}
            </CardContent>
          </Card>

          {/* Upcoming games */}
          {upcomingGames.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Próximos Juegos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 stagger-children">
                  {upcomingGames.map((game) => (
                    <GameScoreCard key={game.id} game={game} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column: Leaders */}
        <div className="space-y-6">
          {avgLeaders.length > 0 ? (
            <LeaderCard
              title="Líderes de Bateo (AVG)"
              entries={avgLeaders.map((l, i) => ({
                rank: i + 1,
                name: `${l.first_name} ${l.last_name}`,
                team: l.team_short_name,
                value: l.avg.toFixed(3).replace(/^0/, ""),
                teamColor: l.team_color,
              }))}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Líderes de Bateo</CardTitle>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={<TrendingUp size={28} />}
                  title="Sin datos"
                  description="Los líderes aparecerán cuando haya estadísticas"
                />
              </CardContent>
            </Card>
          )}

          {hrLeaders.length > 0 && (
            <LeaderCard
              title="Líderes de HR"
              entries={hrLeaders.map((l, i) => ({
                rank: i + 1,
                name: `${l.first_name} ${l.last_name}`,
                team: l.team_short_name,
                value: l.hr,
                teamColor: l.team_color,
              }))}
            />
          )}

          {sbLeaders.length > 0 && (
            <LeaderCard
              title="Líderes de SB"
              entries={sbLeaders.map((l, i) => ({
                rank: i + 1,
                name: `${l.first_name} ${l.last_name}`,
                team: l.team_short_name,
                value: l.sb,
                teamColor: l.team_color,
              }))}
            />
          )}

          {/* Quick actions - admin only */}
          {admin && (
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/juegos/nuevo" className="block">
                  <Button variant="secondary" className="w-full justify-start">
                    <Plus size={16} />
                    Programar Juego
                  </Button>
                </Link>
                <Link href="/admin/jugadores/nuevo" className="block">
                  <Button variant="secondary" className="w-full justify-start">
                    <Plus size={16} />
                    Registrar Jugador
                  </Button>
                </Link>
                <Link href="/admin/equipos/nuevo" className="block">
                  <Button variant="secondary" className="w-full justify-start">
                    <Plus size={16} />
                    Crear Equipo
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
