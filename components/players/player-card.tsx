import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { PlayerWithTeam } from "@/lib/types";
import { formatFullName } from "@/lib/utils/format";

interface PlayerCardProps {
  player: PlayerWithTeam;
}

export function PlayerCard({ player }: PlayerCardProps) {
  return (
    <Link href={`/jugadores/${player.id}`}>
      <Card className="h-full cursor-pointer hover:border-zinc-600 transition-all group">
        <CardContent className="flex items-center gap-3 pt-0">
          <Avatar
            src={player.photo_url}
            alt={formatFullName(player.first_name, player.last_name)}
            fallback={`${player.first_name[0]}${player.last_name[0]}`}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-500">
                #{player.jersey_number}
              </span>
              <h3 className="text-sm font-semibold group-hover:text-amber-400 transition-colors truncate">
                {formatFullName(player.first_name, player.last_name)}
              </h3>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="text-xs"
                style={{ color: player.team.primary_color }}
              >
                {player.team.short_name}
              </span>
              <div className="flex gap-1">
                {player.positions.slice(0, 2).map((pos) => (
                  <Badge key={pos} variant="muted">
                    {pos}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
