import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StatEntryTable } from "@/components/games/stat-entry-table";
import { makePlayers, resetCounter } from "./helpers";
import type { Player, PlayerGameStats } from "@/lib/types";

// Mock the server action
vi.mock("@/lib/actions/stats", () => ({
  saveGameStats: vi.fn(),
}));

beforeEach(() => resetCounter());

const baseProps = {
  gameId: "game-1",
  teamId: "team-1",
  teamName: "Águilas",
  teamColor: "#f59e0b",
};

function makeStats(
  player: Player,
  overrides: Partial<PlayerGameStats> = {}
): PlayerGameStats {
  return {
    id: `stat-${player.id}`,
    player_id: player.id,
    game_id: "game-1",
    team_id: "team-1",
    plate_appearances: 0,
    at_bats: 0,
    runs: 0,
    hits: 0,
    doubles: 0,
    triples: 0,
    home_runs: 0,
    rbi: 0,
    walks: 0,
    strikeouts: 0,
    stolen_bases: 0,
    caught_stealing: 0,
    hit_by_pitch: 0,
    sacrifice_flies: 0,
    sacrifice_bunts: 0,
    ground_into_dp: 0,
    left_on_base: 0,
    putouts: 0,
    assists: 0,
    errors: 0,
    double_plays: 0,
    passed_balls: 0,
    fielding_position: null,
    innings_pitched: 0,
    hits_allowed: 0,
    runs_allowed: 0,
    earned_runs: 0,
    walks_allowed: 0,
    strikeouts_pitched: 0,
    home_runs_allowed: 0,
    hit_batters: 0,
    wild_pitches: 0,
    balks: 0,
    batters_faced: 0,
    pitch_count: 0,
    decision: null,
    batting_order: null,
    is_starter: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("StatEntryTable", () => {
  it("renders regulars in the given order", () => {
    const players = makePlayers(3);
    const lineup = {
      regulars: [players[2], players[1], players[0]],
      reserves: [],
    };

    render(<StatEntryTable lineup={lineup} {...baseProps} />);

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Player C");
    expect(rows[2]).toHaveTextContent("Player B");
    expect(rows[3]).toHaveTextContent("Player A");
  });

  it("renders reserves after regulars with separator", () => {
    const players = makePlayers(4);
    const lineup = {
      regulars: [players[0], players[1]],
      reserves: [players[2], players[3]],
    };

    render(<StatEntryTable lineup={lineup} {...baseProps} />);

    expect(screen.getByText("— Reservas —")).toBeInTheDocument();

    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(6);
    expect(rows[1]).toHaveTextContent("Player A");
    expect(rows[2]).toHaveTextContent("Player B");
    expect(rows[4]).toHaveTextContent("Player C");
    expect(rows[5]).toHaveTextContent("Player D");
  });

  it("creates hidden inputs with correct batting_order per lineup order", () => {
    const players = makePlayers(3);
    const lineup = {
      regulars: [players[2], players[0], players[1]],
      reserves: [],
    };

    const { container } = render(
      <StatEntryTable lineup={lineup} {...baseProps} />
    );

    const orderInputs = container.querySelectorAll<HTMLInputElement>(
      'input[type="hidden"][name$="_order"]'
    );

    const orderMap = new Map<string, string>();
    orderInputs.forEach((input) => {
      const playerId = input.name.replace("_order", "");
      orderMap.set(playerId, input.value);
    });

    expect(orderMap.get("p3")).toBe("1");
    expect(orderMap.get("p1")).toBe("2");
    expect(orderMap.get("p2")).toBe("3");
  });

  it("creates hidden inputs marking regulars as starters", () => {
    const players = makePlayers(3);
    const lineup = {
      regulars: [players[0]],
      reserves: [players[1], players[2]],
    };

    const { container } = render(
      <StatEntryTable lineup={lineup} {...baseProps} />
    );

    const starterInputs = container.querySelectorAll<HTMLInputElement>(
      'input[type="hidden"][name$="_starter"]'
    );

    const starterMap = new Map<string, string>();
    starterInputs.forEach((input) => {
      const playerId = input.name.replace("_starter", "");
      starterMap.set(playerId, input.value);
    });

    expect(starterMap.get("p1")).toBe("true");
    expect(starterMap.get("p2")).toBe("false");
    expect(starterMap.get("p3")).toBe("false");
  });

  it("reserves get batting_order = 0", () => {
    const players = makePlayers(2);
    const lineup = {
      regulars: [players[0]],
      reserves: [players[1]],
    };

    const { container } = render(
      <StatEntryTable lineup={lineup} {...baseProps} />
    );

    const orderInputs = container.querySelectorAll<HTMLInputElement>(
      'input[type="hidden"][name$="_order"]'
    );

    const orderMap = new Map<string, string>();
    orderInputs.forEach((input) => {
      const playerId = input.name.replace("_order", "");
      orderMap.set(playerId, input.value);
    });

    expect(orderMap.get("p1")).toBe("1");
    expect(orderMap.get("p2")).toBe("0");
  });

  it("renders stat inputs with default value 0", () => {
    const players = makePlayers(1);
    const lineup = { regulars: [players[0]], reserves: [] };

    const { container } = render(
      <StatEntryTable lineup={lineup} {...baseProps} />
    );

    const statInputs = container.querySelectorAll<HTMLInputElement>(
      'input[type="number"]'
    );
    expect(statInputs.length).toBeGreaterThan(0);
    statInputs.forEach((input) => {
      expect(input.defaultValue).toBe("0");
    });
  });

  it("renders stat inputs with existing values when provided", () => {
    const players = makePlayers(1);
    const stats = makeStats(players[0], {
      hits: 3,
      runs: 2,
      home_runs: 1,
    });
    const lineup = { regulars: [players[0]], reserves: [] };

    const { container } = render(
      <StatEntryTable
        lineup={lineup}
        {...baseProps}
        existingStats={[stats]}
      />
    );

    const hitsInput = container.querySelector<HTMLInputElement>(
      'input[name="p1_h"]'
    );
    const runsInput = container.querySelector<HTMLInputElement>(
      'input[name="p1_r"]'
    );
    const hrInput = container.querySelector<HTMLInputElement>(
      'input[name="p1_hr"]'
    );

    expect(hitsInput?.defaultValue).toBe("3");
    expect(runsInput?.defaultValue).toBe("2");
    expect(hrInput?.defaultValue).toBe("1");
  });

  it("includes all player IDs as hidden inputs", () => {
    const players = makePlayers(3);
    const lineup = {
      regulars: [players[0], players[2]],
      reserves: [players[1]],
    };

    const { container } = render(
      <StatEntryTable lineup={lineup} {...baseProps} />
    );

    const playerIdInputs = container.querySelectorAll<HTMLInputElement>(
      'input[name="player_id"]'
    );
    const ids = Array.from(playerIdInputs).map((i) => i.value);
    expect(ids).toContain("p1");
    expect(ids).toContain("p2");
    expect(ids).toContain("p3");
  });

  it("includes game_id and team_id hidden inputs", () => {
    const players = makePlayers(1);
    const lineup = { regulars: [players[0]], reserves: [] };

    const { container } = render(
      <StatEntryTable lineup={lineup} {...baseProps} />
    );

    const gameInput = container.querySelector<HTMLInputElement>(
      'input[name="game_id"]'
    );
    const teamInput = container.querySelector<HTMLInputElement>(
      'input[name="team_id"]'
    );

    expect(gameInput?.value).toBe("game-1");
    expect(teamInput?.value).toBe("team-1");
  });

  // --- PA auto-calculation tests ---

  it("shows PA as 0 by default", () => {
    const players = makePlayers(1);
    const lineup = { regulars: [players[0]], reserves: [] };

    const { container } = render(
      <StatEntryTable lineup={lineup} {...baseProps} />
    );

    const paInput = container.querySelector<HTMLInputElement>(
      'input[name="p1_pa"]'
    );
    expect(paInput?.type).toBe("hidden");
    expect(paInput?.value).toBe("0");
  });

  it("auto-calculates PA from AB + BB + SF", () => {
    const players = makePlayers(1);
    const lineup = { regulars: [players[0]], reserves: [] };

    const { container } = render(
      <StatEntryTable lineup={lineup} {...baseProps} />
    );

    const abInput = container.querySelector<HTMLInputElement>('input[name="p1_ab"]')!;
    const bbInput = container.querySelector<HTMLInputElement>('input[name="p1_bb"]')!;
    const sfInput = container.querySelector<HTMLInputElement>('input[name="p1_sf"]')!;

    fireEvent.change(abInput, { target: { value: "4" } });
    fireEvent.change(bbInput, { target: { value: "1" } });
    fireEvent.change(sfInput, { target: { value: "1" } });

    const paInput = container.querySelector<HTMLInputElement>('input[name="p1_pa"]')!;
    expect(paInput.value).toBe("6"); // 4 + 1 + 1

    // Also check the visible display
    const paDisplay = container.querySelector('[title="PA = AB + BB + SF"]')!;
    expect(paDisplay.textContent).toBe("6");
  });

  it("updates PA when any contributing field changes", () => {
    const players = makePlayers(1);
    const lineup = { regulars: [players[0]], reserves: [] };

    const { container } = render(
      <StatEntryTable lineup={lineup} {...baseProps} />
    );

    const abInput = container.querySelector<HTMLInputElement>('input[name="p1_ab"]')!;
    fireEvent.change(abInput, { target: { value: "3" } });

    let paInput = container.querySelector<HTMLInputElement>('input[name="p1_pa"]')!;
    expect(paInput.value).toBe("3");

    const bbInput = container.querySelector<HTMLInputElement>('input[name="p1_bb"]')!;
    fireEvent.change(bbInput, { target: { value: "2" } });

    paInput = container.querySelector<HTMLInputElement>('input[name="p1_pa"]')!;
    expect(paInput.value).toBe("5"); // 3 + 2
  });

  it("computes PA from existing stats on load", () => {
    const players = makePlayers(1);
    const stats = makeStats(players[0], {
      at_bats: 3,
      walks: 1,
      sacrifice_flies: 1,
    });
    const lineup = { regulars: [players[0]], reserves: [] };

    const { container } = render(
      <StatEntryTable lineup={lineup} {...baseProps} existingStats={[stats]} />
    );

    const paInput = container.querySelector<HTMLInputElement>('input[name="p1_pa"]')!;
    expect(paInput.value).toBe("5"); // 3 + 1 + 1
  });

  it("PA is not an editable number input", () => {
    const players = makePlayers(1);
    const lineup = { regulars: [players[0]], reserves: [] };

    const { container } = render(
      <StatEntryTable lineup={lineup} {...baseProps} />
    );

    // PA should be a hidden input, not a number input
    const paNumberInput = container.querySelector<HTMLInputElement>(
      'input[type="number"][name="p1_pa"]'
    );
    expect(paNumberInput).toBeNull();

    const paHidden = container.querySelector<HTMLInputElement>(
      'input[type="hidden"][name="p1_pa"]'
    );
    expect(paHidden).not.toBeNull();
  });
});
