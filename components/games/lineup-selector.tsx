"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { formatFullName } from "@/lib/utils/format";
import { X, UserPlus, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import type { Player } from "@/lib/types";

export interface LineupResult {
  regulars: Player[];
  reserves: Player[];
}

interface LineupSelectorProps {
  players: Player[];
  teamName: string;
  teamColor: string;
  onConfirm: (lineup: LineupResult) => void;
}

export function LineupSelector({
  players,
  teamName,
  teamColor,
  onConfirm,
}: LineupSelectorProps) {
  const [regularIds, setRegularIds] = useState<string[]>([]);
  const [reserveIds, setReserveIds] = useState<string[]>([]);

  const playerMap = new Map(players.map((p) => [p.id, p]));

  const regulars = regularIds.map((id) => playerMap.get(id)!).filter(Boolean);
  const reserves = reserveIds.map((id) => playerMap.get(id)!).filter(Boolean);
  const assigned = new Set([...regularIds, ...reserveIds]);
  const available = players.filter((p) => !assigned.has(p.id));

  function assignRegular(playerId: string) {
    setRegularIds((prev) => [...prev, playerId]);
  }

  function assignReserve(playerId: string) {
    setReserveIds((prev) => [...prev, playerId]);
  }

  function remove(playerId: string) {
    setRegularIds((prev) => prev.filter((id) => id !== playerId));
    setReserveIds((prev) => prev.filter((id) => id !== playerId));
  }

  const moveUp = useCallback((index: number) => {
    if (index <= 0) return;
    setRegularIds((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, []);

  const moveDown = useCallback((index: number) => {
    setRegularIds((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }, []);

  function handleConfirm() {
    onConfirm({ regulars, reserves });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: teamColor }}
        />
        <h3 className="font-semibold">{teamName}</h3>
      </div>

      {/* Regulares */}
      <div>
        <h4 className="text-xs uppercase tracking-wider text-amber-500 font-medium mb-2">
          Regulares ({regulars.length})
        </h4>
        {regulars.length === 0 ? (
          <p className="text-xs text-zinc-500 italic">
            Sin regulares seleccionados
          </p>
        ) : (
          <div className="space-y-1">
            {regulars.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-500 w-5 text-center">
                    {i + 1}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    #{p.jersey_number}
                  </span>
                  <span className="text-sm">
                    {formatFullName(p.first_name, p.last_name)}
                  </span>
                  {p.positions.length > 0 && (
                    <span className="text-[10px] text-zinc-500">
                      {p.positions[0]}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                    className="text-zinc-500 hover:text-amber-400 disabled:opacity-20 disabled:cursor-default transition-colors p-0.5"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(i)}
                    disabled={i === regulars.length - 1}
                    className="text-zinc-500 hover:text-amber-400 disabled:opacity-20 disabled:cursor-default transition-colors p-0.5"
                  >
                    <ChevronDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    className="text-zinc-500 hover:text-red-400 transition-colors p-0.5 ml-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reservas */}
      <div>
        <h4 className="text-xs uppercase tracking-wider text-zinc-400 font-medium mb-2">
          Reservas ({reserves.length})
        </h4>
        {reserves.length === 0 ? (
          <p className="text-xs text-zinc-500 italic">
            Sin reservas seleccionadas
          </p>
        ) : (
          <div className="space-y-1">
            {reserves.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-border bg-zinc-800/50 px-3 py-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500 font-mono">
                    #{p.jersey_number}
                  </span>
                  <span className="text-sm">
                    {formatFullName(p.first_name, p.last_name)}
                  </span>
                  {p.positions.length > 0 && (
                    <span className="text-[10px] text-zinc-500">
                      {p.positions[0]}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  className="text-zinc-500 hover:text-red-400 transition-colors p-0.5"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Disponibles */}
      {available.length > 0 && (
        <div>
          <h4 className="text-xs uppercase tracking-wider text-zinc-500 font-medium mb-2">
            Disponibles ({available.length})
          </h4>
          <div className="space-y-1">
            {available.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-zinc-900/50 px-3 py-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500 font-mono">
                    #{p.jersey_number}
                  </span>
                  <span className="text-sm text-zinc-400">
                    {formatFullName(p.first_name, p.last_name)}
                  </span>
                  {p.positions.length > 0 && (
                    <span className="text-[10px] text-zinc-600">
                      {p.positions[0]}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => assignRegular(p.id)}
                    className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors"
                  >
                    Regular
                  </button>
                  <button
                    type="button"
                    onClick={() => assignReserve(p.id)}
                    className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors"
                  >
                    Reserva
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Select all shortcut */}
      {available.length > 0 && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setRegularIds((prev) => [...prev, ...available.map((p) => p.id)]);
            }}
            className="text-[11px] text-amber-500/70 hover:text-amber-500 transition-colors flex items-center gap-1"
          >
            <UserPlus size={12} />
            Todos como regulares
          </button>
        </div>
      )}

      {/* Confirm */}
      <div className="flex justify-end pt-2">
        <Button
          type="button"
          size="sm"
          disabled={regulars.length === 0}
          onClick={handleConfirm}
        >
          Confirmar Lineup
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}
