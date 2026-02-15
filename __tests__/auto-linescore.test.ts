import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/cache and auth
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth", () => ({
  requireAdmin: vi.fn().mockResolvedValue({ user: { id: "admin" } }),
}));

// Mutable mock data — changed per test
let mockGame = { home_team_id: "home-1", away_team_id: "away-1" };
let mockPlayerStats: {
  team_id: string;
  runs: number;
  hits: number;
  putouts: number;
  errors: number;
}[] = [];
let mockInnings: {
  team_id: string;
  inning: number;
  runs: number;
  hits: number;
  errors: number;
}[] = [];

const mockUpsertStats = vi.fn().mockResolvedValue({ error: null });
const mockUpsertInnings = vi.fn().mockResolvedValue({ error: null });

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    from: (table: string) => {
      if (table === "games") {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: mockGame }),
            }),
          }),
        };
      }
      if (table === "player_game_stats") {
        return {
          upsert: mockUpsertStats,
          select: () => ({
            eq: () => Promise.resolve({ data: mockPlayerStats }),
          }),
        };
      }
      if (table === "game_innings") {
        return {
          upsert: mockUpsertInnings,
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({ data: mockInnings }),
            }),
          }),
        };
      }
    },
  }),
}));

const { saveBulkStats } = await import("@/lib/actions/stats");

beforeEach(() => {
  vi.clearAllMocks();
  mockUpsertStats.mockResolvedValue({ error: null });
  mockUpsertInnings.mockResolvedValue({ error: null });
  mockPlayerStats = [];
  mockInnings = [];
});

// Minimal stat record for saveBulkStats
const dummyStats = [
  { player_id: "p1", game_id: "game-1", team_id: "away-1" },
];

// Helper to build player stat mock entries
function stat(
  teamId: string,
  o: Partial<{ runs: number; hits: number; putouts: number; errors: number }> = {}
) {
  return {
    team_id: teamId,
    runs: o.runs ?? 0,
    hits: o.hits ?? 0,
    putouts: o.putouts ?? 0,
    errors: o.errors ?? 0,
  };
}

describe("autoCalculateLinescore", () => {
  it("creates away inning 1 when home POs reach 3", async () => {
    mockPlayerStats = [
      stat("away-1", { runs: 2, hits: 2 }),
      stat("home-1", { putouts: 3 }),
    ];

    await saveBulkStats("game-1", dummyStats);

    expect(mockUpsertInnings).toHaveBeenCalledOnce();
    const [innings, options] = mockUpsertInnings.mock.calls[0];

    expect(options).toEqual({ onConflict: "game_id,team_id,inning" });

    const awayInn = innings.find(
      (i: { team_id: string }) => i.team_id === "away-1"
    );
    expect(awayInn).toBeDefined();
    expect(awayInn.inning).toBe(1);
    expect(awayInn.runs).toBe(2);
    expect(awayInn.hits).toBe(2);
  });

  it("creates home inning 1 when away POs reach 3", async () => {
    mockPlayerStats = [
      stat("away-1", { runs: 2, hits: 2, putouts: 3 }),
      stat("home-1", { runs: 1, hits: 2, putouts: 3 }),
    ];
    mockInnings = [
      { team_id: "away-1", inning: 1, runs: 2, hits: 2, errors: 0 },
    ];

    await saveBulkStats("game-1", dummyStats);

    expect(mockUpsertInnings).toHaveBeenCalledOnce();
    const [innings] = mockUpsertInnings.mock.calls[0];

    const homeInn = innings.find(
      (i: { team_id: string }) => i.team_id === "home-1"
    );
    expect(homeInn).toBeDefined();
    expect(homeInn.inning).toBe(1);
    expect(homeInn.runs).toBe(1);
    expect(homeInn.hits).toBe(2);
  });

  it("calculates inning 2 as delta from inning 1", async () => {
    mockPlayerStats = [
      stat("away-1", { runs: 3, hits: 4 }),
      stat("home-1", { putouts: 6 }),
    ];
    mockInnings = [
      { team_id: "away-1", inning: 1, runs: 2, hits: 2, errors: 0 },
    ];

    await saveBulkStats("game-1", dummyStats);

    const [innings] = mockUpsertInnings.mock.calls[0];
    const awayInn2 = innings.find(
      (i: { team_id: string; inning: number }) =>
        i.team_id === "away-1" && i.inning === 2
    );
    expect(awayInn2).toBeDefined();
    expect(awayInn2.runs).toBe(1); // 3 - 2
    expect(awayInn2.hits).toBe(2); // 4 - 2
  });

  it("stores fielding team errors in batting team entry", async () => {
    mockPlayerStats = [
      stat("away-1", { runs: 2, hits: 2 }),
      stat("home-1", { putouts: 3, errors: 1 }), // home committed 1 error
    ];

    await saveBulkStats("game-1", dummyStats);

    const [innings] = mockUpsertInnings.mock.calls[0];
    const awayInn = innings.find(
      (i: { team_id: string }) => i.team_id === "away-1"
    );
    // Home's fielding error stored in away (batting) entry
    expect(awayInn.errors).toBe(1);
  });

  it("stores away fielding errors in home batting entry", async () => {
    mockPlayerStats = [
      stat("away-1", { putouts: 3, errors: 2 }), // away committed 2 errors while fielding
      stat("home-1", { runs: 3, hits: 3, putouts: 3 }),
    ];
    mockInnings = [
      { team_id: "away-1", inning: 1, runs: 0, hits: 0, errors: 0 },
    ];

    await saveBulkStats("game-1", dummyStats);

    const [innings] = mockUpsertInnings.mock.calls[0];
    const homeInn = innings.find(
      (i: { team_id: string }) => i.team_id === "home-1"
    );
    // Away's fielding errors stored in home (batting) entry
    expect(homeInn.errors).toBe(2);
  });

  it("does not overwrite existing non-empty innings", async () => {
    mockPlayerStats = [
      stat("away-1", { runs: 5, hits: 6 }), // inflated totals
      stat("home-1", { putouts: 3 }), // still only 1 top half complete
    ];
    mockInnings = [
      { team_id: "away-1", inning: 1, runs: 2, hits: 2, errors: 0 },
    ];

    await saveBulkStats("game-1", dummyStats);

    // Inning 1 already has data (R=2, H=2) — should NOT be recalculated
    expect(mockUpsertInnings).not.toHaveBeenCalled();
  });

  it("recalculates empty innings (created by stale data)", async () => {
    mockPlayerStats = [
      stat("away-1", { runs: 2, hits: 3 }),
      stat("home-1", { putouts: 3 }),
    ];
    // Inning 1 was created empty (fielding saved before batting)
    mockInnings = [
      { team_id: "away-1", inning: 1, runs: 0, hits: 0, errors: 0 },
    ];

    await saveBulkStats("game-1", dummyStats);

    expect(mockUpsertInnings).toHaveBeenCalledOnce();
    const [innings] = mockUpsertInnings.mock.calls[0];
    const awayInn = innings.find(
      (i: { team_id: string }) => i.team_id === "away-1"
    );
    expect(awayInn.runs).toBe(2);
    expect(awayInn.hits).toBe(3);
  });

  it("does not create innings when both teams have 0 POs", async () => {
    mockPlayerStats = [
      stat("away-1", { runs: 1, hits: 1, putouts: 0 }),
      stat("home-1", { runs: 0, hits: 0, putouts: 0 }),
    ];

    await saveBulkStats("game-1", dummyStats);

    expect(mockUpsertInnings).not.toHaveBeenCalled();
  });

  it("does not create innings when POs < 3", async () => {
    mockPlayerStats = [
      stat("away-1", { putouts: 2 }),
      stat("home-1", { putouts: 1 }),
    ];

    await saveBulkStats("game-1", dummyStats);

    expect(mockUpsertInnings).not.toHaveBeenCalled();
  });

  it("creates both team innings when both have 3+ POs", async () => {
    mockPlayerStats = [
      stat("away-1", { runs: 2, hits: 2, putouts: 3 }),
      stat("home-1", { runs: 1, hits: 1, putouts: 3 }),
    ];

    await saveBulkStats("game-1", dummyStats);

    expect(mockUpsertInnings).toHaveBeenCalledOnce();
    const [innings] = mockUpsertInnings.mock.calls[0];
    expect(innings).toHaveLength(2);

    const awayInn = innings.find(
      (i: { team_id: string }) => i.team_id === "away-1"
    );
    const homeInn = innings.find(
      (i: { team_id: string }) => i.team_id === "home-1"
    );

    expect(awayInn.runs).toBe(2);
    expect(homeInn.runs).toBe(1);
  });

  it("handles 3-inning game with correct deltas", async () => {
    mockPlayerStats = [
      stat("away-1", { runs: 3, hits: 5 }),
      stat("home-1", { putouts: 9, errors: 1 }),
    ];
    mockInnings = [
      { team_id: "away-1", inning: 1, runs: 2, hits: 2, errors: 0 },
      { team_id: "away-1", inning: 2, runs: 1, hits: 2, errors: 1 },
    ];

    await saveBulkStats("game-1", dummyStats);

    const [innings] = mockUpsertInnings.mock.calls[0];
    const awayInn3 = innings.find(
      (i: { team_id: string; inning: number }) =>
        i.team_id === "away-1" && i.inning === 3
    );
    expect(awayInn3).toBeDefined();
    expect(awayInn3.runs).toBe(0); // 3 - 2 - 1
    expect(awayInn3.hits).toBe(1); // 5 - 2 - 2
    expect(awayInn3.errors).toBe(0); // 1 - 0 - 1
  });

  it("clamps negative values to 0", async () => {
    mockPlayerStats = [
      stat("away-1", { runs: 1, hits: 1 }),
      stat("home-1", { putouts: 6 }),
    ];
    // Previous inning already has more than current totals (data correction scenario)
    mockInnings = [
      { team_id: "away-1", inning: 1, runs: 3, hits: 3, errors: 0 },
    ];

    await saveBulkStats("game-1", dummyStats);

    const [innings] = mockUpsertInnings.mock.calls[0];
    const awayInn2 = innings.find(
      (i: { team_id: string; inning: number }) =>
        i.team_id === "away-1" && i.inning === 2
    );
    expect(awayInn2.runs).toBe(0); // Math.max(0, 1-3)
    expect(awayInn2.hits).toBe(0); // Math.max(0, 1-3)
  });
});
