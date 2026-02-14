import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/cache and auth before importing
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({
  requireAdmin: vi.fn().mockResolvedValue({ user: { id: "admin" } }),
}));

const mockUpsert = vi.fn().mockResolvedValue({ error: null });
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    from: () => ({
      upsert: mockUpsert,
    }),
  }),
}));

// Import after mocks
const { saveGameStats } = await import("@/lib/actions/stats");

beforeEach(() => {
  vi.clearAllMocks();
  mockUpsert.mockResolvedValue({ error: null });
});

function buildFormData(
  players: { id: string; starter: boolean; order: number; stats?: Record<string, number> }[]
): FormData {
  const fd = new FormData();
  fd.set("game_id", "game-1");
  fd.set("team_id", "team-1");

  for (const p of players) {
    fd.append("player_id", p.id);
    fd.set(`${p.id}_starter`, p.starter ? "true" : "false");
    fd.set(`${p.id}_order`, String(p.order));

    // Default all stat fields to 0
    const statKeys = [
      "pa", "ab", "r", "h", "2b", "3b", "hr", "rbi", "bb", "so",
      "sb", "cs", "hbp", "sf", "sac", "po", "a", "e",
    ];
    for (const key of statKeys) {
      fd.set(`${p.id}_${key}`, String(p.stats?.[key] ?? 0));
    }
    // Pitching defaults
    fd.set(`${p.id}_ip`, "0");
    fd.set(`${p.id}_ha`, "0");
    fd.set(`${p.id}_er`, "0");
    fd.set(`${p.id}_bba`, "0");
    fd.set(`${p.id}_kp`, "0");
    fd.set(`${p.id}_dec`, "");
  }

  return fd;
}

describe("saveGameStats", () => {
  it("parses FormData and calls upsert with correct player data", async () => {
    const fd = buildFormData([
      { id: "p1", starter: true, order: 1, stats: { h: 3, r: 2, hr: 1, ab: 4, pa: 4, rbi: 2 } },
      { id: "p2", starter: true, order: 2, stats: { h: 1, ab: 3, pa: 4, bb: 1 } },
      { id: "p3", starter: false, order: 0 },
    ]);

    await saveGameStats(fd);

    expect(mockUpsert).toHaveBeenCalledOnce();
    const [stats, options] = mockUpsert.mock.calls[0];

    expect(options).toEqual({ onConflict: "player_id,game_id" });
    expect(stats).toHaveLength(3);

    // Player 1
    const s1 = stats.find((s: { player_id: string }) => s.player_id === "p1");
    expect(s1.game_id).toBe("game-1");
    expect(s1.team_id).toBe("team-1");
    expect(s1.is_starter).toBe(true);
    expect(s1.batting_order).toBe(1);
    expect(s1.hits).toBe(3);
    expect(s1.runs).toBe(2);
    expect(s1.home_runs).toBe(1);
    expect(s1.at_bats).toBe(4);
    expect(s1.rbi).toBe(2);

    // Player 2
    const s2 = stats.find((s: { player_id: string }) => s.player_id === "p2");
    expect(s2.is_starter).toBe(true);
    expect(s2.batting_order).toBe(2);
    expect(s2.hits).toBe(1);
    expect(s2.walks).toBe(1);

    // Player 3 — reserve
    const s3 = stats.find((s: { player_id: string }) => s.player_id === "p3");
    expect(s3.is_starter).toBe(false);
    expect(s3.batting_order).toBeNull(); // 0 parses to null via `|| null`
  });

  it("returns error when upsert fails", async () => {
    mockUpsert.mockResolvedValueOnce({ error: { message: "DB error" } });

    const fd = buildFormData([
      { id: "p1", starter: true, order: 1 },
    ]);

    const result = await saveGameStats(fd);
    expect(result).toEqual({ error: "Error al guardar estadísticas: DB error" });
  });

  it("maps all batting stat fields correctly", async () => {
    const fd = buildFormData([
      {
        id: "p1",
        starter: true,
        order: 1,
        stats: {
          pa: 5, ab: 4, r: 2, h: 3, "2b": 1, "3b": 0, hr: 1,
          rbi: 3, bb: 1, so: 0, sb: 2, cs: 0, hbp: 0, sf: 0, sac: 0,
          po: 7, a: 1, e: 0,
        },
      },
    ]);

    await saveGameStats(fd);

    const stats = mockUpsert.mock.calls[0][0];
    const s = stats[0];

    expect(s.plate_appearances).toBe(5);
    expect(s.at_bats).toBe(4);
    expect(s.runs).toBe(2);
    expect(s.hits).toBe(3);
    expect(s.doubles).toBe(1);
    expect(s.triples).toBe(0);
    expect(s.home_runs).toBe(1);
    expect(s.rbi).toBe(3);
    expect(s.walks).toBe(1);
    expect(s.strikeouts).toBe(0);
    expect(s.stolen_bases).toBe(2);
    expect(s.caught_stealing).toBe(0);
    expect(s.hit_by_pitch).toBe(0);
    expect(s.sacrifice_flies).toBe(0);
    expect(s.sacrifice_bunts).toBe(0);
    expect(s.putouts).toBe(7);
    expect(s.assists).toBe(1);
    expect(s.errors).toBe(0);
  });

  it("preserves batting order from form data", async () => {
    // Simulate a reordered lineup: p3=1st, p1=2nd, p2=3rd
    const fd = buildFormData([
      { id: "p3", starter: true, order: 1 },
      { id: "p1", starter: true, order: 2 },
      { id: "p2", starter: true, order: 3 },
    ]);

    await saveGameStats(fd);

    const stats = mockUpsert.mock.calls[0][0];
    const p3 = stats.find((s: { player_id: string }) => s.player_id === "p3");
    const p1 = stats.find((s: { player_id: string }) => s.player_id === "p1");
    const p2 = stats.find((s: { player_id: string }) => s.player_id === "p2");

    expect(p3.batting_order).toBe(1);
    expect(p1.batting_order).toBe(2);
    expect(p2.batting_order).toBe(3);
  });
});
