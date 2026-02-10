import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { PlayerWithTeam } from "@/lib/types";
import { formatFullName } from "@/lib/utils/format";

interface PlayerProfileProps {
  player: PlayerWithTeam;
}

export function PlayerProfile({ player }: PlayerProfileProps) {
  return (
    <Card>
      <CardContent className="flex flex-col sm:flex-row items-center gap-4 pt-0">
        <Avatar
          src={player.photo_url}
          alt={formatFullName(player.first_name, player.last_name)}
          fallback={`${player.first_name[0]}${player.last_name[0]}`}
          size="xl"
        />
        <div className="text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <span className="text-2xl font-mono text-zinc-500">
              #{player.jersey_number}
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight mt-1">
            {formatFullName(player.first_name, player.last_name)}
          </h2>
          <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start flex-wrap">
            <span
              className="text-sm font-medium"
              style={{ color: player.team.primary_color }}
            >
              {player.team.name}
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-sm text-muted">
              Batea: {player.bats} / Tira: {player.throws}
            </span>
          </div>
          <div className="flex gap-1 mt-2 justify-center sm:justify-start">
            {player.positions.map((pos) => (
              <Badge key={pos}>{pos}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
