import Link from "next/link";
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
import { Trophy, Calendar, TrendingUp, Plus, ArrowRight, Zap, Medal, AlertCircle } from "lucide-react";
import type { GameWithTeams, TeamStanding } from "@/lib/types";

export default async function DashboardPage() {
  const [standings, recentGames, upcomingGames, avgLeaders, hrLeaders, sbLeaders, admin] =
    await Promise.all([
      getTeamStandings().catch(() => [] as TeamStanding[]),
      getRecentGames(4).catch(() => []) as Promise<GameWithTeams[]>,
      getUpcomingGames(4).catch(() => []) as Promise<GameWithTeams[]>,
      getBattingLeaders(undefined, 20).catch(() => []),
      getHomeRunLeaders(undefined, 10).catch(() => []),
      getStolenBaseLeaders(undefined, 10).catch(() => []),
      isAdmin(),
    ]);

  return (
    <>
      {/* Hero Section */}
      <div
        className="relative rounded-2xl overflow-hidden mb-8 bg-dot-pattern animate-slide-up"
      >
        {/* Ambient glow blobs */}
        <div
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-0 animate-fade-in"
          style={{
            background: "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)",
            animationDelay: "300ms",
          }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-0 animate-fade-in"
          style={{
            background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)",
            animationDelay: "500ms",
          }}
        />

        <div className="relative px-6 py-8 sm:py-10">
          <div className="flex items-center gap-2 mb-3 animate-slide-up">
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Temporada Activa
            </span>
          </div>

          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight animate-slide-up"
            style={{ animationDelay: "50ms" }}
          >
            Liga de{" "}
            <span className="text-shimmer">Softball</span>
          </h1>

          <p
            className="text-sm text-muted mt-2 max-w-md animate-slide-up"
            style={{ animationDelay: "100ms" }}
          >
            Clasificación, resultados y estadísticas de la temporada
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Standings + Recent */}
        <div className="lg:col-span-2 space-y-6">
          {/* Standings */}
          <Card
            className="animate-slide-up"
            style={{ animationDelay: "100ms" }}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-amber-500" />
                <CardTitle>Clasificación</CardTitle>
              </div>
              <Link href="/equipos">
                <Button variant="ghost" size="sm">
                  Ver todos <ArrowRight size={14} className="ml-1" />
                </Button>
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
          <Card
            className="animate-slide-up"
            style={{ animationDelay: "200ms" }}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-amber-500" />
                <CardTitle>Juegos Recientes</CardTitle>
              </div>
              <Link href="/juegos">
                <Button variant="ghost" size="sm">
                  Ver todos <ArrowRight size={14} className="ml-1" />
                </Button>
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
            <Card
              className="animate-slide-up"
              style={{ animationDelay: "300ms" }}
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-emerald-500" />
                  <CardTitle>Próximos Juegos</CardTitle>
                </div>
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
        <div
          className="space-y-6 animate-slide-up"
          style={{ animationDelay: "200ms" }}
        >
          {avgLeaders.length > 0 ? (
            <LeaderCard
              title="Líderes de Bateo"
              subtitle="AVG"
              icon={<TrendingUp size={18} className="text-amber-500" />}
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
              subtitle="Home Runs"
              icon={<Zap size={18} className="text-amber-500" />}
              entries={hrLeaders.map((l, i) => ({
                rank: i + 1,
                name: `${l.first_name} ${l.last_name}`,
                team: l.team_short_name,
                value: l.hr,
                teamColor: l.team_color,
              }))}
            />
          )}

          {/* HR históricos pre-temporada */}
          <Card className="glass-card border-gradient">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-amber-500" />
                <div>
                  <CardTitle className="text-base">HR Previos a la App</CardTitle>
                  <p className="text-xs text-muted mt-0.5">Registros anteriores al sistema</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-800/60 rounded-lg px-2.5 py-2 mb-3">
                <AlertCircle size={12} className="shrink-0 text-amber-500/70" />
                <span>Jonrones anotados antes que se comenzara a usar la aplicación</span>
              </div>
              {[
                { name: "Alber Arias",      hr: 2 },
                { name: "Daniel Sanchez",   hr: 1 },
                { name: "Felix Rivas",      hr: 1 },
                { name: "Jefferson Peña",   hr: 1 },
                { name: "Jeison Noguera",   hr: 1 },
                { name: "Michael",          hr: 1 },
                { name: "Felix Bruno",      hr: 1 },
              ].map((entry, i) => (
                <div
                  key={entry.name}
                  className={`flex items-center gap-3 px-2 py-1.5 rounded-lg transition-colors${i === 0 ? " bg-amber-500/5" : ""}`}
                >
                  {i < 3 ? (
                    <span className={`w-6 h-6 flex items-center justify-center${i === 0 ? " glow-amber rounded-full" : ""}`}>
                      <Medal
                        size={16}
                        className={i === 0 ? "text-amber-400" : i === 1 ? "text-zinc-300" : "text-amber-700"}
                      />
                    </span>
                  ) : (
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-zinc-800 text-zinc-500">
                      {i + 1}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate${i === 0 ? " text-amber-50" : ""}`}>
                      {entry.name}
                    </p>
                  </div>
                  <span className={`text-lg font-bold font-mono tabular-nums${i === 0 ? " text-amber-400" : ""}`}>
                    {entry.hr}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {sbLeaders.length > 0 && (
            <LeaderCard
              title="Líderes de SB"
              subtitle="Bases Robadas"
              icon={<TrendingUp size={18} className="text-amber-500" />}
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
            <Card
              className="glass-card border-gradient animate-slide-up"
              style={{ animationDelay: "400ms" }}
            >
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
