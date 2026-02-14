import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { BoxScore } from "@/components/games/box-score";
import { Linescore } from "@/components/games/linescore";
import { QuickScoreForm } from "@/components/games/quick-score-form";
import { GameStatusControl } from "@/components/games/game-status-control";
import { getGame } from "@/lib/queries/games";
import { getPlayerGameStats, getGameInnings } from "@/lib/queries/stats";
import { formatGameDate } from "@/lib/utils/format";
import { isAdmin } from "@/lib/auth";
import { BarChart3, ClipboardList, MapPin, Pencil, User, Users } from "lucide-react";
import type { GameWithTeams, PlayerGameStats, Player } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

type StatWithPlayer = PlayerGameStats & { player: Player };

export default async function JuegoDetailPage({
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

  const [stats, innings, admin] = await Promise.all([
    getPlayerGameStats(id),
    getGameInnings(id),
    isAdmin(),
  ]);
  const isFinal = game.status === "final";

  return (
    <>
      <PageHeader
        title="Detalle del Juego"
        description={formatGameDate(game.game_date)}
        action={
          admin ? (
            <div className="flex gap-2">
              <Link href={`/admin/juegos/${id}/editar`}>
                <Button variant="secondary" size="sm">
                  <Pencil size={14} />
                  Editar
                </Button>
              </Link>
              <Link href={`/admin/juegos/${id}/estadisticas`}>
                <Button variant="secondary" size="sm">
                  <ClipboardList size={14} />
                  Stats
                </Button>
              </Link>
            </div>
          ) : undefined
        }
      />

      {/* Score card */}
      <Card className="mb-4">
        <CardContent className="pt-2">
          <div className="flex items-center justify-between mb-4">
            {admin ? (
              <GameStatusControl gameId={id} status={game.status} />
            ) : (
              <Badge variant={isFinal ? "default" : "muted"}>
                {game.status === "scheduled" ? "Programado" : game.status === "in_progress" ? "En Progreso" : game.status === "final" ? "Final" : game.status === "postponed" ? "Pospuesto" : "Cancelado"}
              </Badge>
            )}
            {game.location && (
              <span className="text-xs text-muted flex items-center gap-1">
                <MapPin size={12} />
                {game.location}
              </span>
            )}
          </div>

          <div className="space-y-3">
            {/* Away team */}
            <div className="flex items-center justify-between">
              <Link href={`/equipos/${game.away_team.id}`} className="flex items-center gap-3 hover:text-amber-400 transition-colors">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: game.away_team.primary_color }}
                />
                <span className={cn("text-lg font-medium", isFinal && game.away_score !== null && game.home_score !== null && game.away_score > game.home_score && "font-bold")}>
                  {game.away_team.name}
                </span>
                <Badge variant="muted">{game.away_team.short_name}</Badge>
              </Link>
              <span className="text-3xl font-bold font-mono tabular-nums">
                {game.away_score ?? "-"}
              </span>
            </div>

            {/* Home team */}
            <div className="flex items-center justify-between">
              <Link href={`/equipos/${game.home_team.id}`} className="flex items-center gap-3 hover:text-amber-400 transition-colors">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: game.home_team.primary_color }}
                />
                <span className={cn("text-lg font-medium", isFinal && game.home_score !== null && game.away_score !== null && game.home_score > game.away_score && "font-bold")}>
                  {game.home_team.name}
                </span>
                <Badge variant="muted">{game.home_team.short_name}</Badge>
              </Link>
              <span className="text-3xl font-bold font-mono tabular-nums">
                {game.home_score ?? "-"}
              </span>
            </div>
          </div>

          {game.umpire && (
            <p className="text-xs text-muted mt-3 flex items-center gap-1">
              <User size={12} />
              Árbitro: {game.umpire}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Linescore */}
      {innings.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={16} />
              Línea de Anotación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Linescore
              innings={innings}
              awayTeam={game.away_team}
              homeTeam={game.home_team}
              awayScore={game.away_score}
              homeScore={game.home_score}
              totalInnings={game.innings}
            />
          </CardContent>
        </Card>
      )}

      {/* Lineup */}
      {stats.length > 0 && <LineupSection stats={stats as StatWithPlayer[]} awayTeam={game.away_team} homeTeam={game.home_team} />}

      {/* Box Score */}
      {stats.length > 0 ? (
        <BoxScore
          homeTeam={game.home_team}
          awayTeam={game.away_team}
          stats={stats as never[]}
        />
      ) : admin ? (
        <Card>
          <CardHeader>
            <CardTitle>Marcador Rápido</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickScoreForm
              gameId={id}
              homeTeamName={game.home_team.name}
              awayTeamName={game.away_team.name}
              homeScore={game.home_score}
              awayScore={game.away_score}
            />
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}

function TeamLineup({
  teamName,
  teamColor,
  regulars,
  reserves,
}: {
  teamName: string;
  teamColor: string;
  regulars: StatWithPlayer[];
  reserves: StatWithPlayer[];
}) {
  if (regulars.length === 0 && reserves.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: teamColor }} />
        <h4 className="text-sm font-semibold">{teamName}</h4>
      </div>
      {regulars.length > 0 && (
        <div className="space-y-0.5 mb-2">
          {regulars.map((s) => (
            <div key={s.id} className="flex items-center gap-2 text-xs px-2 py-0.5">
              <span className="text-amber-500 font-bold w-4 text-center text-[10px]">
                {s.batting_order}
              </span>
              <span className="text-zinc-500 font-mono text-[10px]">
                #{s.player.jersey_number}
              </span>
              <span>{s.player.first_name} {s.player.last_name}</span>
              {s.player.positions.length > 0 && (
                <span className="text-zinc-600 text-[10px]">{s.player.positions[0]}</span>
              )}
            </div>
          ))}
        </div>
      )}
      {reserves.length > 0 && (
        <>
          <p className="text-[10px] uppercase tracking-widest text-zinc-600 px-2 mb-0.5">Reservas</p>
          <div className="space-y-0.5">
            {reserves.map((s) => (
              <div key={s.id} className="flex items-center gap-2 text-xs px-2 py-0.5 text-zinc-400">
                <span className="w-4" />
                <span className="text-zinc-600 font-mono text-[10px]">
                  #{s.player.jersey_number}
                </span>
                <span>{s.player.first_name} {s.player.last_name}</span>
                {s.player.positions.length > 0 && (
                  <span className="text-zinc-600 text-[10px]">{s.player.positions[0]}</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function LineupSection({
  stats,
  awayTeam,
  homeTeam,
}: {
  stats: StatWithPlayer[];
  awayTeam: GameWithTeams["away_team"];
  homeTeam: GameWithTeams["home_team"];
}) {
  const awayStats = stats.filter((s) => s.team_id === awayTeam.id);
  const homeStats = stats.filter((s) => s.team_id === homeTeam.id);

  const awayRegulars = awayStats
    .filter((s) => s.is_starter)
    .sort((a, b) => (a.batting_order ?? 99) - (b.batting_order ?? 99));
  const awayReserves = awayStats.filter((s) => !s.is_starter);

  const homeRegulars = homeStats
    .filter((s) => s.is_starter)
    .sort((a, b) => (a.batting_order ?? 99) - (b.batting_order ?? 99));
  const homeReserves = homeStats.filter((s) => !s.is_starter);

  // Only show if at least one player has is_starter set
  const hasLineupData = awayRegulars.length > 0 || homeRegulars.length > 0;
  if (!hasLineupData) return null;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users size={16} />
          Lineup
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TeamLineup
            teamName={awayTeam.name}
            teamColor={awayTeam.primary_color}
            regulars={awayRegulars}
            reserves={awayReserves}
          />
          <TeamLineup
            teamName={homeTeam.name}
            teamColor={homeTeam.primary_color}
            regulars={homeRegulars}
            reserves={homeReserves}
          />
        </div>
      </CardContent>
    </Card>
  );
}
