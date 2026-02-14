import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { StatsTable } from "@/components/stats/stats-table";
import { TeamRoster } from "@/components/teams/team-roster";
import { getTeam } from "@/lib/queries/teams";
import {
  getPlayersByTeam,
  getTeamBattingStats,
  getTeamFieldingStats,
} from "@/lib/queries/players";
import { getStatLabel } from "@/lib/utils/stat-labels";
import { isAdmin } from "@/lib/auth";
import { Pencil, Users, BarChart3 } from "lucide-react";
import type { PlayerCareerBatting, PlayerCareerFielding } from "@/lib/types";

function stat(key: string, label: string) {
  return { key, label, title: getStatLabel(label), align: "center" as const };
}

const battingColumns = [
  {
    key: "player_name",
    label: "Jugador",
    align: "left" as const,
    render: (row: PlayerCareerBatting) => (
      <Link
        href={`/jugadores/${row.player_id}`}
        className="hover:text-amber-500 transition-colors"
      >
        {row.first_name} {row.last_name}
      </Link>
    ),
  },
  stat("games_played", "G"),
  stat("ab", "AB"),
  stat("h", "H"),
  stat("doubles", "2B"),
  stat("triples", "3B"),
  stat("hr", "HR"),
  stat("rbi", "RBI"),
  stat("r", "R"),
  stat("bb", "BB"),
  stat("so", "SO"),
  stat("sb", "SB"),
  {
    key: "avg",
    label: "AVG",
    title: getStatLabel("AVG"),
    align: "center" as const,
    render: (row: PlayerCareerBatting) => (
      <span className="font-semibold">{row.avg.toFixed(3)}</span>
    ),
  },
  {
    key: "obp",
    label: "OBP",
    title: getStatLabel("OBP"),
    align: "center" as const,
    render: (row: PlayerCareerBatting) => row.obp.toFixed(3),
  },
  {
    key: "slg",
    label: "SLG",
    title: getStatLabel("SLG"),
    align: "center" as const,
    render: (row: PlayerCareerBatting) => row.slg.toFixed(3),
  },
  {
    key: "ops",
    label: "OPS",
    title: getStatLabel("OPS"),
    align: "center" as const,
    render: (row: PlayerCareerBatting) => row.ops.toFixed(3),
  },
];

const fieldingColumns = [
  {
    key: "player_name",
    label: "Jugador",
    align: "left" as const,
    render: (row: PlayerCareerFielding) => (
      <Link
        href={`/jugadores/${row.player_id}`}
        className="hover:text-amber-500 transition-colors"
      >
        {row.first_name} {row.last_name}
      </Link>
    ),
  },
  stat("games_played", "G"),
  stat("po", "PO"),
  stat("a", "A"),
  stat("e", "E"),
  stat("dp", "DP"),
  {
    key: "fpct",
    label: "FPCT",
    title: getStatLabel("FPCT"),
    align: "center" as const,
    render: (row: PlayerCareerFielding) => (
      <span className="font-semibold">{row.fpct.toFixed(3)}</span>
    ),
  },
];

export default async function EquipoDetailPage({
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

  const [players, battingStats, fieldingStats, admin] = await Promise.all([
    getPlayersByTeam(id),
    getTeamBattingStats(id),
    getTeamFieldingStats(id),
    isAdmin(),
  ]);

  return (
    <>
      <PageHeader
        title={team.name}
        action={
          admin ? (
            <Link href={`/admin/equipos/${id}/editar`}>
              <Button variant="secondary" size="sm">
                <Pencil size={14} />
                Editar
              </Button>
            </Link>
          ) : undefined
        }
      />

      {/* Team info card */}
      <Card className="mb-6">
        <CardContent className="flex items-center gap-4 pt-0">
          <Avatar
            src={team.logo_url}
            alt={team.name}
            fallback={team.short_name.slice(0, 2)}
            size="xl"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge>{team.short_name}</Badge>
            </div>
            <h2 className="text-xl font-bold">{team.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <div
                className="w-4 h-4 rounded-full border border-zinc-700"
                style={{ backgroundColor: team.primary_color }}
              />
              <div
                className="w-4 h-4 rounded-full border border-zinc-700"
                style={{ backgroundColor: team.secondary_color }}
              />
              <span className="text-sm text-muted ml-1">
                {players.length} jugador{players.length !== 1 ? "es" : ""}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roster */}
      <Card>
        <CardHeader>
          <CardTitle>Roster</CardTitle>
          {admin && (
            <Link href={`/admin/jugadores/nuevo?team=${id}`}>
              <Button variant="ghost" size="sm">
                <Users size={14} />
                Agregar
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {players.length === 0 ? (
            <EmptyState
              icon={<Users size={32} />}
              title="Sin jugadores"
              description={admin ? "Agrega jugadores a este equipo" : "No hay jugadores registrados"}
              action={
                admin ? (
                  <Link href={`/admin/jugadores/nuevo?team=${id}`}>
                    <Button size="sm">Agregar Jugador</Button>
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <TeamRoster players={players} />
          )}
        </CardContent>
      </Card>

      {/* Team Batting Stats */}
      {battingStats.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={18} />
              Estadísticas de Bateo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatsTable<PlayerCareerBatting>
              columns={battingColumns}
              data={battingStats}
              keyExtractor={(row) => row.player_id}
            />
          </CardContent>
        </Card>
      )}

      {/* Team Fielding Stats */}
      {fieldingStats.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={18} />
              Estadísticas de Fildeo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatsTable<PlayerCareerFielding>
              columns={fieldingColumns}
              data={fieldingStats}
              keyExtractor={(row) => row.player_id}
            />
          </CardContent>
        </Card>
      )}
    </>
  );
}
