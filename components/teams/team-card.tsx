import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import type { Team } from "@/lib/types";

interface TeamCardProps {
  team: Team;
}

export function TeamCard({ team }: TeamCardProps) {
  return (
    <Link href={`/equipos/${team.id}`}>
      <Card className="h-full cursor-pointer hover:border-zinc-600 transition-all group">
        <CardContent className="flex items-center gap-4 pt-0">
          <Avatar
            src={team.logo_url}
            alt={team.name}
            fallback={team.short_name.slice(0, 2)}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-amber-400 transition-colors truncate">
              {team.name}
            </h3>
            <p className="text-sm text-muted">{team.short_name}</p>
          </div>
          <div
            className="w-3 h-8 rounded-full"
            style={{ backgroundColor: team.primary_color }}
          />
        </CardContent>
      </Card>
    </Link>
  );
}
