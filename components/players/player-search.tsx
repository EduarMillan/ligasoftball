"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { PlayerCard } from "@/components/players/player-card";
import { EmptyState } from "@/components/ui/empty-state";
import { User } from "lucide-react";
import type { PlayerWithTeam } from "@/lib/types";
import { formatFullName } from "@/lib/utils/format";

interface PlayerSearchProps {
  players: PlayerWithTeam[];
}

export function PlayerSearch({ players }: PlayerSearchProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players;
    return players.filter((p) => {
      const fullName = formatFullName(p.first_name, p.last_name).toLowerCase();
      const jersey = String(p.jersey_number);
      const team = p.team.short_name.toLowerCase();
      const positions = p.positions.join(" ").toLowerCase();
      return (
        fullName.includes(q) ||
        jersey.includes(q) ||
        team.includes(q) ||
        positions.includes(q)
      );
    });
  }, [players, query]);

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, equipo, posición o número…"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-9 py-2.5 text-sm text-foreground placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Results count */}
      {query && (
        <p className="text-xs text-zinc-500">
          {filtered.length === 0
            ? "Sin resultados"
            : `${filtered.length} jugador${filtered.length !== 1 ? "es" : ""} encontrado${filtered.length !== 1 ? "s" : ""}`}
        </p>
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {filtered.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<User size={40} />}
          title="Sin resultados"
          description={`No hay jugadores que coincidan con "${query}"`}
        />
      )}
    </div>
  );
}
