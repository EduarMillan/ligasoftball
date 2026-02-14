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
  { key: "pa", label: "PA", title: "Apariciones al plato", field: "plate_appearances" as const },
  { key: "r", label: "R", title: "Carreras", field: "runs" as const },
  { key: "1b", label: "1B", title: "Sencillos" },
  { key: "2b", label: "2B", title: "Dobles", field: "doubles" as const },
  { key: "3b", label: "3B", title: "Triples", field: "triples" as const },
  { key: "hr", label: "HR", title: "Jonrones", field: "home_runs" as const },
  { key: "rbi", label: "RBI", title: "Carreras impulsadas", field: "rbi" as const },
  { key: "bb", label: "BB", title: "Bases por bolas", field: "walks" as const },
  { key: "so", label: "SO", title: "Ponches", field: "strikeouts" as const },
  { key: "sb", label: "SB", title: "Bases robadas", field: "stolen_bases" as const },
  { key: "sf", label: "SF", title: "Sacrifice fly", field: "sacrifice_flies" as const },
];

const fieldingCols = [
  { key: "po", label: "PO", title: "Putouts", field: "putouts" as const },
  { key: "a", label: "A", title: "Asistencias", field: "assists" as const },
  { key: "e", label: "E", title: "Errores", field: "errors" as const },
];

const allCols = [...battingCols, ...fieldingCols];
const fieldingKeys = new Set(fieldingCols.map((c) => c.key));

// Fields that contribute to AB = PA - BB - SF
const abFields = new Set(["pa", "bb", "sf"]);
// Fields that contribute to H = 1B + 2B + 3B + HR
const hFields = new Set(["1b", "2b", "3b", "hr"]);
// All auto-calc contributing fields
const autoCalcFields = new Set([...abFields, ...hFields]);

type StatField = (typeof allCols)[number]["field"];

function PlayerRow({
  player,
  cols,
  existingStat,
  rowIndex,
}: {
  player: Player;
  cols: typeof allCols;
  existingStat?: PlayerGameStats;
  rowIndex: number;
}) {
  const init1B = existingStat
    ? (existingStat.hits ?? 0) - (existingStat.doubles ?? 0) - (existingStat.triples ?? 0) - (existingStat.home_runs ?? 0)
    : 0;

  const initAB = existingStat ? (existingStat.at_bats ?? 0) : 0;
  const initH = existingStat ? (existingStat.hits ?? 0) : 0;

  const [ab, setAB] = useState(initAB);
  const [hits, setHits] = useState(initH);
  const [fields, setFields] = useState({
    pa: existingStat?.plate_appearances ?? 0,
    bb: existingStat?.walks ?? 0,
    sf: existingStat?.sacrifice_flies ?? 0,
    "1b": Math.max(0, init1B),
    "2b": existingStat?.doubles ?? 0,
    "3b": existingStat?.triples ?? 0,
    hr: existingStat?.home_runs ?? 0,
  });

  function handleChange(key: string, value: number) {
    if (!autoCalcFields.has(key)) return;
    const next = { ...fields, [key]: value };
    setFields(next);
    if (abFields.has(key)) {
      setAB(next.pa - next.bb - next.sf);
    }
    if (hFields.has(key)) {
      setHits(next["1b"] + next["2b"] + next["3b"] + next.hr);
    }
  }

  const isEven = rowIndex % 2 === 0;

  return (
    <tr className={`border-b border-border/30 ${isEven ? "bg-zinc-800/50" : "bg-zinc-950/50"}`}>
      <td className={`px-2 py-1 sticky left-0 z-10 ${isEven ? "bg-zinc-800" : "bg-zinc-950"}`}>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-zinc-500 font-mono">
            #{player.jersey_number}
          </span>
          <span className="text-xs font-medium whitespace-nowrap">
            {formatFullName(player.first_name, player.last_name)}
          </span>
        </div>
      </td>
      {/* AB — auto-calculated, read-only */}
      <td className="px-0.5 py-0.5">
        <input type="hidden" name={`${player.id}_ab`} value={ab} />
        <div
          title="AB = PA - BB - SF"
          className="w-full min-w-[42px] rounded-lg border border-amber-500/20 bg-amber-500/5 px-1.5 py-1.5 text-center text-xs font-mono tabular-nums text-amber-400"
        >
          {ab}
        </div>
      </td>
      {/* H — auto-calculated, read-only */}
      <td className="px-0.5 py-0.5">
        <input type="hidden" name={`${player.id}_h`} value={hits} />
        <div
          title="H = 1B + 2B + 3B + HR"
          className="w-full min-w-[42px] rounded-lg border border-amber-500/20 bg-amber-500/5 px-1.5 py-1.5 text-center text-xs font-mono tabular-nums text-amber-400"
        >
          {hits}
        </div>
      </td>
      {cols.map((col, i) => {
        const isFielding = fieldingKeys.has(col.key);
        const isFirstFielding = isFielding && !fieldingKeys.has(cols[i - 1]?.key);
        const field = "field" in col ? (col.field as StatField) : undefined;
        const defaultVal = col.key === "1b"
          ? Math.max(0, init1B)
          : existingStat && field
            ? existingStat[field] ?? 0
            : 0;
        return (
          <td key={col.key} className={`px-0.5 py-0.5${isFirstFielding ? " pl-1.5 border-l border-emerald-500/30" : ""}`}>
            <input
              type="number"
              name={`${player.id}_${col.key}`}
              defaultValue={defaultVal}
              min={0}
              onChange={
                autoCalcFields.has(col.key)
                  ? (e) => handleChange(col.key, parseInt(e.target.value) || 0)
                  : undefined
              }
              className={`w-full min-w-[42px] rounded-lg border px-1.5 py-1.5 text-center text-xs font-mono tabular-nums text-foreground focus:outline-none focus:ring-1 transition-colors ${
                isFielding
                  ? "border-emerald-500/30 bg-emerald-500/10 focus:ring-emerald-500/50 focus:border-emerald-500"
                  : "border-border bg-zinc-900 focus:ring-amber-500/50 focus:border-amber-500"
              }`}
            />
          </td>
        );
      })}
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
                title="Turnos al bate (auto: PA-BB-SF)"
                className="px-1 py-1.5 text-center text-xs uppercase tracking-wider text-amber-500/70 font-medium min-w-[50px]"
              >
                AB
              </th>
              <th
                title="Hits totales (auto: 1B+2B+3B+HR)"
                className="px-1 py-1.5 text-center text-xs uppercase tracking-wider text-amber-500/70 font-medium min-w-[50px]"
              >
                H
              </th>
              {allCols.map((col, i) => {
                const isFielding = fieldingKeys.has(col.key);
                const isFirstFielding = isFielding && !fieldingKeys.has(allCols[i - 1]?.key);
                return (
                  <th
                    key={col.key}
                    title={col.title}
                    className={`px-1 py-1.5 text-center text-xs uppercase tracking-wider font-medium min-w-[50px] ${
                      isFielding ? "text-emerald-400" : "text-zinc-500"
                    }${isFirstFielding ? " pl-1.5 border-l border-emerald-500/30" : ""}`}
                  >
                    {col.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {regulars.map((player, i) => (
              <PlayerRow
                key={player.id}
                player={player}
                cols={allCols}
                existingStat={statsMap.get(player.id)}
                rowIndex={i}
              />
            ))}

            {reserves.length > 0 && (
              <>
                <tr>
                  <td
                    colSpan={allCols.length + 3}
                    className="px-2 py-1.5 text-center text-[10px] uppercase tracking-widest text-zinc-600 font-medium"
                  >
                    — Reservas —
                  </td>
                </tr>
                {reserves.map((player, i) => (
                  <PlayerRow
                    key={player.id}
                    player={player}
                    cols={allCols}
                    existingStat={statsMap.get(player.id)}
                    rowIndex={i}
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
