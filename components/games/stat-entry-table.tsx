"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { Player, PlayerGameStats } from "@/lib/types";
import { formatFullName } from "@/lib/utils/format";
import { saveGameStats } from "@/lib/actions/stats";
import type { LineupResult } from "@/components/games/lineup-selector";

interface StatEntryTableProps {
  lineup: LineupResult;
  gameId: string;
  teamId: string;
  teamName: string;
  teamColor: string;
  existingStats?: PlayerGameStats[];
}

const battingCols = [
  { key: "ab", label: "AB", title: "Turnos al bate", field: "at_bats" as const },
  { key: "r", label: "R", title: "Carreras", field: "runs" as const },
  { key: "h", label: "H", title: "Hits", field: "hits" as const },
  { key: "2b", label: "2B", title: "Dobles", field: "doubles" as const },
  { key: "3b", label: "3B", title: "Triples", field: "triples" as const },
  { key: "hr", label: "HR", title: "Jonrones", field: "home_runs" as const },
  { key: "rbi", label: "RBI", title: "Carreras impulsadas", field: "rbi" as const },
  { key: "bb", label: "BB", title: "Bases por bolas", field: "walks" as const },
  { key: "so", label: "SO", title: "Ponches", field: "strikeouts" as const },
  { key: "sb", label: "SB", title: "Bases robadas", field: "stolen_bases" as const },
  { key: "hbp", label: "HBP", title: "Golpeado por lanzamiento", field: "hit_by_pitch" as const },
  { key: "sf", label: "SF", title: "Sacrifice fly", field: "sacrifice_flies" as const },
  { key: "po", label: "PO", title: "Putouts", field: "putouts" as const },
  { key: "a", label: "A", title: "Asistencias", field: "assists" as const },
  { key: "e", label: "E", title: "Errores", field: "errors" as const },
];

// Fields that contribute to PA = AB + BB + HBP + SF
const paFields = new Set(["ab", "bb", "hbp", "sf"]);

type StatField = (typeof battingCols)[number]["field"];

function PlayerRow({
  player,
  cols,
  existingStat,
}: {
  player: Player;
  cols: typeof battingCols;
  existingStat?: PlayerGameStats;
}) {
  const initPA = existingStat
    ? (existingStat.at_bats ?? 0) +
      (existingStat.walks ?? 0) +
      (existingStat.hit_by_pitch ?? 0) +
      (existingStat.sacrifice_flies ?? 0)
    : 0;

  const [pa, setPA] = useState(initPA);
  const [fields, setFields] = useState({
    ab: existingStat?.at_bats ?? 0,
    bb: existingStat?.walks ?? 0,
    hbp: existingStat?.hit_by_pitch ?? 0,
    sf: existingStat?.sacrifice_flies ?? 0,
  });

  function handleChange(key: string, value: number) {
    if (paFields.has(key)) {
      const next = { ...fields, [key]: value };
      setFields(next);
      setPA(next.ab + next.bb + next.hbp + next.sf);
    }
  }

  return (
    <tr className="border-b border-border/30">
      <td className="px-2 py-1 sticky left-0 bg-card z-10">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-zinc-500 font-mono">
            #{player.jersey_number}
          </span>
          <span className="text-xs font-medium whitespace-nowrap">
            {formatFullName(player.first_name, player.last_name)}
          </span>
        </div>
      </td>
      {/* PA — auto-calculated, read-only */}
      <td className="px-0.5 py-0.5">
        <input type="hidden" name={`${player.id}_pa`} value={pa} />
        <div
          title="PA = AB + BB + HBP + SF"
          className="w-full min-w-[42px] rounded-lg border border-amber-500/20 bg-amber-500/5 px-1.5 py-1.5 text-center text-xs font-mono tabular-nums text-amber-400"
        >
          {pa}
        </div>
      </td>
      {cols.map((col) => (
        <td key={col.key} className="px-0.5 py-0.5">
          <input
            type="number"
            name={`${player.id}_${col.key}`}
            defaultValue={existingStat ? existingStat[col.field as StatField] : 0}
            min={0}
            onChange={
              paFields.has(col.key)
                ? (e) => handleChange(col.key, parseInt(e.target.value) || 0)
                : undefined
            }
            className="w-full min-w-[42px] rounded-lg border border-border bg-zinc-900 px-1.5 py-1.5 text-center text-xs font-mono tabular-nums text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500 transition-colors"
          />
        </td>
      ))}
    </tr>
  );
}

export function StatEntryTable({
  lineup,
  gameId,
  teamId,
  teamName,
  teamColor,
  existingStats = [],
}: StatEntryTableProps) {
  const [saved, setSaved] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = await saveGameStats(formData);
      if (!result?.error) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
      return result;
    },
    null
  );

  const { regulars, reserves } = lineup;
  const allPlayers = [...regulars, ...reserves];

  const statsMap = new Map(existingStats.map((s) => [s.player_id, s]));

  return (
    <form action={formAction}>
      {state?.error && (
        <div className="animate-slide-down rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 mb-3">
          {state.error}
        </div>
      )}

      {saved && (
        <div className="animate-slide-down rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400 mb-3">
          Stats guardadas correctamente
        </div>
      )}

      <input type="hidden" name="game_id" value={gameId} />
      <input type="hidden" name="team_id" value={teamId} />
      {allPlayers.map((p) => (
        <input key={p.id} type="hidden" name="player_id" value={p.id} />
      ))}

      {/* Hidden inputs for is_starter and batting_order */}
      {regulars.map((p, i) => (
        <span key={`meta-${p.id}`}>
          <input type="hidden" name={`${p.id}_starter`} value="true" />
          <input type="hidden" name={`${p.id}_order`} value={i + 1} />
        </span>
      ))}
      {reserves.map((p) => (
        <span key={`meta-${p.id}`}>
          <input type="hidden" name={`${p.id}_starter`} value="false" />
          <input type="hidden" name={`${p.id}_order`} value="0" />
        </span>
      ))}

      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: teamColor }}
        />
        <h3 className="font-semibold">{teamName}</h3>
      </div>

      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-2 py-1.5 text-left text-xs uppercase tracking-wider text-zinc-500 font-medium sticky left-0 bg-card z-10 min-w-[140px]">
                Jugador
              </th>
              <th
                title="Apariciones al plato (auto: AB+BB+HBP+SF)"
                className="px-1 py-1.5 text-center text-xs uppercase tracking-wider text-amber-500/70 font-medium min-w-[50px]"
              >
                PA
              </th>
              {battingCols.map((col) => (
                <th
                  key={col.key}
                  title={col.title}
                  className="px-1 py-1.5 text-center text-xs uppercase tracking-wider text-zinc-500 font-medium min-w-[50px]"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {regulars.map((player) => (
              <PlayerRow
                key={player.id}
                player={player}
                cols={battingCols}
                existingStat={statsMap.get(player.id)}
              />
            ))}

            {reserves.length > 0 && (
              <>
                <tr>
                  <td
                    colSpan={battingCols.length + 2}
                    className="px-2 py-1.5 text-center text-[10px] uppercase tracking-widest text-zinc-600 font-medium"
                  >
                    — Reservas —
                  </td>
                </tr>
                {reserves.map((player) => (
                  <PlayerRow
                    key={player.id}
                    player={player}
                    cols={battingCols}
                    existingStat={statsMap.get(player.id)}
                  />
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-4">
        <Button type="submit" loading={isPending}>Guardar Stats de {teamName}</Button>
      </div>
    </form>
  );
}
