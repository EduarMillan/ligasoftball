import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Linescore } from "@/components/games/linescore";
import type { Team, GameInning } from "@/lib/types";

function makeTeam(id: string, shortName: string): Team {
  return {
    id,
    name: shortName,
    short_name: shortName,
    primary_color: "#ffffff",
    secondary_color: "#000000",
    logo_url: null,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
  } as Team;
}

function makeInning(
  teamId: string,
  inning: number,
  runs: number,
  hits: number,
  errors: number
): GameInning {
  return {
    id: `${teamId}-inn${inning}`,
    game_id: "game-1",
    team_id: teamId,
    inning,
    runs,
    hits,
    errors,
  } as GameInning;
}

const awayTeam = makeTeam("away-1", "VIS");
const homeTeam = makeTeam("home-1", "LOC");

describe("Linescore", () => {
  it("renders team short names", () => {
    render(
      <Linescore
        innings={[]}
        awayTeam={awayTeam}
        homeTeam={homeTeam}
        awayScore={0}
        homeScore={0}
        totalInnings={7}
      />
    );

    expect(screen.getByText("VIS")).toBeInTheDocument();
    expect(screen.getByText("LOC")).toBeInTheDocument();
  });

  it("shows dash for innings with no data", () => {
    render(
      <Linescore
        innings={[makeInning("away-1", 1, 2, 3, 0)]}
        awayTeam={awayTeam}
        homeTeam={homeTeam}
        awayScore={2}
        homeScore={0}
        totalInnings={3}
      />
    );

    // Home team has no innings data — all should be "-"
    const rows = screen.getAllByRole("row");
    const homeRow = rows[2]; // header, away, home
    expect(homeRow).toHaveTextContent("-");
  });

  it("displays runs per inning correctly", () => {
    const innings = [
      makeInning("away-1", 1, 2, 3, 0),
      makeInning("away-1", 2, 1, 2, 0),
      makeInning("away-1", 3, 0, 1, 0),
      makeInning("home-1", 1, 1, 2, 0),
      makeInning("home-1", 2, 0, 1, 0),
      makeInning("home-1", 3, 2, 2, 0),
    ];

    render(
      <Linescore
        innings={innings}
        awayTeam={awayTeam}
        homeTeam={homeTeam}
        awayScore={3}
        homeScore={3}
        totalInnings={3}
      />
    );

    const rows = screen.getAllByRole("row");
    const awayRow = rows[1];
    const homeRow = rows[2];

    // Away: 2, 1, 0 | 3
    expect(awayRow).toHaveTextContent("2");
    expect(awayRow).toHaveTextContent("1");
    expect(awayRow).toHaveTextContent("0");

    // Home: 1, 0, 2 | 3
    expect(homeRow).toHaveTextContent("1");
    expect(homeRow).toHaveTextContent("2");
  });

  it("displays H totals correctly", () => {
    const innings = [
      makeInning("away-1", 1, 2, 3, 0),
      makeInning("away-1", 2, 1, 2, 0),
      makeInning("home-1", 1, 0, 1, 0),
      makeInning("home-1", 2, 1, 3, 0),
    ];

    const { container } = render(
      <Linescore
        innings={innings}
        awayTeam={awayTeam}
        homeTeam={homeTeam}
        awayScore={3}
        homeScore={1}
        totalInnings={2}
      />
    );

    const rows = container.querySelectorAll("tr");
    const awayCells = rows[1].querySelectorAll("td");
    const homeCells = rows[2].querySelectorAll("td");

    // H is the second-to-last column (team, inn1, inn2, R, H, E)
    // Away H = 3 + 2 = 5
    const awayH = awayCells[awayCells.length - 2];
    expect(awayH.textContent).toBe("5");

    // Home H = 1 + 3 = 4
    const homeH = homeCells[homeCells.length - 2];
    expect(homeH.textContent).toBe("4");
  });

  it("swaps E so each row shows that team's OWN errors", () => {
    // Convention: away entries store HOME's fielding errors,
    //             home entries store AWAY's fielding errors.
    // Display should swap so each row shows OWN errors.
    const innings = [
      // Away entry: E=2 means HOME committed 2 errors during top halves
      makeInning("away-1", 1, 1, 1, 2),
      // Home entry: E=1 means AWAY committed 1 error during bottom halves
      makeInning("home-1", 1, 0, 0, 1),
    ];

    const { container } = render(
      <Linescore
        innings={innings}
        awayTeam={awayTeam}
        homeTeam={homeTeam}
        awayScore={1}
        homeScore={0}
        totalInnings={1}
      />
    );

    const rows = container.querySelectorAll("tr");
    const awayCells = rows[1].querySelectorAll("td");
    const homeCells = rows[2].querySelectorAll("td");

    // Away row E (last column) should show AWAY's own errors
    // = sum of HOME entries' errors = 1
    const awayE = awayCells[awayCells.length - 1];
    expect(awayE.textContent).toBe("1");

    // Home row E (last column) should show HOME's own errors
    // = sum of AWAY entries' errors = 2
    const homeE = homeCells[homeCells.length - 1];
    expect(homeE.textContent).toBe("2");
  });

  it("E totals are 0 when no errors exist", () => {
    const innings = [
      makeInning("away-1", 1, 2, 3, 0),
      makeInning("home-1", 1, 1, 2, 0),
    ];

    const { container } = render(
      <Linescore
        innings={innings}
        awayTeam={awayTeam}
        homeTeam={homeTeam}
        awayScore={2}
        homeScore={1}
        totalInnings={1}
      />
    );

    const rows = container.querySelectorAll("tr");
    const awayE = rows[1].querySelectorAll("td");
    const homeE = rows[2].querySelectorAll("td");

    expect(awayE[awayE.length - 1].textContent).toBe("0");
    expect(homeE[homeE.length - 1].textContent).toBe("0");
  });

  it("accumulates E across multiple innings with swap", () => {
    const innings = [
      // Away entries: home errors during top halves
      makeInning("away-1", 1, 2, 2, 0), // home: 0 errors in top 1
      makeInning("away-1", 2, 1, 2, 1), // home: 1 error in top 2
      makeInning("away-1", 3, 0, 1, 0), // home: 0 errors in top 3
      // Home entries: away errors during bottom halves
      makeInning("home-1", 1, 1, 2, 0), // away: 0 errors in bot 1
      makeInning("home-1", 2, 0, 1, 0), // away: 0 errors in bot 2
      makeInning("home-1", 3, 2, 2, 1), // away: 1 error in bot 3
    ];

    const { container } = render(
      <Linescore
        innings={innings}
        awayTeam={awayTeam}
        homeTeam={homeTeam}
        awayScore={3}
        homeScore={3}
        totalInnings={3}
      />
    );

    const rows = container.querySelectorAll("tr");
    const awayCells = rows[1].querySelectorAll("td");
    const homeCells = rows[2].querySelectorAll("td");

    // Away own errors = sum of HOME entries' errors = 0+0+1 = 1
    expect(awayCells[awayCells.length - 1].textContent).toBe("1");

    // Home own errors = sum of AWAY entries' errors = 0+1+0 = 1
    expect(homeCells[homeCells.length - 1].textContent).toBe("1");
  });
});
