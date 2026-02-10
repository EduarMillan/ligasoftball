import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Player } from "@/lib/types";
import { formatFullName } from "@/lib/utils/format";

interface TeamRosterProps {
  players: Player[];
}

export function TeamRoster({ players }: TeamRosterProps) {
  return (
    <div className="space-y-2">
      {players.map((player) => (
        <Link
          key={player.id}
          href={`/jugadores/${player.id}`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-800/50 transition-colors"
        >
          <Avatar
            src={player.photo_url}
            alt={formatFullName(player.first_name, player.last_name)}
            fallback={`${player.first_name[0]}${player.last_name[0]}`}
            size="sm"
          />
          <span className="text-sm font-mono text-zinc-500 w-8">
            #{player.jersey_number}
          </span>
          <span className="text-sm font-medium flex-1">
            {formatFullName(player.first_name, player.last_name)}
          </span>
          <div className="flex gap-1">
            {player.positions.map((pos) => (
              <Badge key={pos} variant="muted">
                {pos}
              </Badge>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
}
