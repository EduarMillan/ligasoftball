"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Player } from "@/lib/types";
import { formatFullName } from "@/lib/utils/format";

interface PlayerStatEntry {
  player_id: string;
  at_bats: number;
  hits: number;
  doubles: number;
  triples: number;
  home_runs: number;
  runs: number;
  rbi: number;
  walks: number;
  strikeouts: number;
  stolen_bases: number;
}

interface GameStatEntryFormProps {
  players: Player[];
  gameId: string;
  teamId: string;
  onSubmit: (stats: PlayerStatEntry[]) => void;
}

const defaultStats = {
  at_bats: 0,
  hits: 0,
  doubles: 0,
  triples: 0,
  home_runs: 0,
  runs: 0,
  rbi: 0,
  walks: 0,
  strikeouts: 0,
  stolen_bases: 0,
};

const statFields = [
  { key: "at_bats", label: "AB" },
  { key: "hits", label: "H" },
  { key: "doubles", label: "2B" },
  { key: "triples", label: "3B" },
  { key: "home_runs", label: "HR" },
  { key: "runs", label: "R" },
  { key: "rbi", label: "RBI" },
  { key: "walks", label: "BB" },
  { key: "strikeouts", label: "SO" },
  { key: "stolen_bases", label: "SB" },
] as const;

export function GameStatEntryForm({
  players,
  gameId: _gameId,
  teamId: _teamId,
  onSubmit,
}: GameStatEntryFormProps) {
  const [entries, setEntries] = useState<Record<string, PlayerStatEntry>>(
    Object.fromEntries(
      players.map((p) => [
        p.id,
        { player_id: p.id, ...defaultStats },
      ])
    )
  );

  const updateStat = (
    playerId: string,
    field: keyof typeof defaultStats,
    value: number
  ) => {
    setEntries((prev) => ({
      ...prev,
      [playerId]: { ...prev[playerId], [field]: value },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(Object.values(entries));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-2 py-2 text-left text-xs uppercase tracking-wider text-zinc-500 font-medium sticky left-0 bg-card">
                Jugador
              </th>
              {statFields.map((f) => (
                <th
                  key={f.key}
                  className="px-1 py-2 text-center text-xs uppercase tracking-wider text-zinc-500 font-medium"
                >
                  {f.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.id} className="border-b border-border/30">
                <td className="px-2 py-1.5 whitespace-nowrap font-medium sticky left-0 bg-card">
                  <span className="text-xs text-zinc-500 mr-1">
                    #{player.jersey_number}
                  </span>
                  {formatFullName(player.first_name, player.last_name)}
                </td>
                {statFields.map((f) => (
                  <td key={f.key} className="px-1 py-1">
                    <Input
                      type="number"
                      min={0}
                      value={entries[player.id][f.key]}
                      onChange={(e) =>
                        updateStat(
                          player.id,
                          f.key,
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-14 text-center px-1 py-1 text-sm"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end mt-4">
        <Button type="submit">Guardar Estadísticas</Button>
      </div>
    </form>
  );
}
