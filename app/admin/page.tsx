import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTeams } from "@/lib/queries/teams";
import { getSeasons } from "@/lib/queries/seasons";
import { Users, User, Calendar, Trophy, ChevronRight } from "lucide-react";

export default async function AdminPage() {
  const [teams, seasons] = await Promise.all([
    getTeams().catch(() => []),
    getSeasons().catch(() => []),
  ]);

  const activeSeason = seasons.find((s) => s.is_active);

  const adminLinks = [
    {
      href: "/admin/equipos/nuevo",
      icon: Users,
      title: "Crear Equipo",
      description: "Agrega un nuevo equipo a la liga",
      count: `${teams.length} equipos`,
    },
    {
      href: "/admin/jugadores/nuevo",
      icon: User,
      title: "Crear Jugador",
      description: "Registra un nuevo jugador",
    },
    {
      href: "/juegos/nuevo",
      icon: Calendar,
      title: "Crear Juego",
      description: "Programa un nuevo juego",
    },
    {
      href: "/admin/temporadas",
      icon: Trophy,
      title: "Temporadas",
      description: activeSeason
        ? `Activa: ${activeSeason.name}`
        : "Sin temporada activa",
      badge: activeSeason ? activeSeason.name : undefined,
    },
  ];

  return (
    <>
      <PageHeader
        title="Administración"
        description="Panel de administración de la liga"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {adminLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <Card className="h-full cursor-pointer hover:border-amber-500/30 transition-all group">
                <CardContent className="flex items-start gap-4 pt-0">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 mt-0.5">
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground group-hover:text-amber-400 transition-colors">
                        {link.title}
                      </h3>
                      {link.badge && (
                        <Badge variant="accent">{link.badge}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted mt-0.5">
                      {link.description}
                    </p>
                    {link.count && (
                      <p className="text-xs text-zinc-600 mt-1">{link.count}</p>
                    )}
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-zinc-600 mt-1.5 group-hover:text-amber-400 transition-colors"
                  />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}
