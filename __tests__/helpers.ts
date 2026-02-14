import type { Player } from "@/lib/types";

let counter = 0;

export function makePlayer(overrides: Partial<Player> = {}): Player {
  counter++;
  return {
    id: `p${counter}`,
    team_id: "team-1",
    first_name: `Player`,
    last_name: `${counter}`,
    jersey_number: counter,
    photo_url: null,
    positions: ["SS"],
    bats: "R",
    throws: "R",
    date_of_birth: null,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

export function makePlayers(count: number): Player[] {
  return Array.from({ length: count }, (_, i) =>
    makePlayer({
      id: `p${i + 1}`,
      first_name: `Player`,
      last_name: `${String.fromCharCode(65 + i)}`,
      jersey_number: (i + 1) * 10,
    })
  );
}

export function resetCounter() {
  counter = 0;
}
