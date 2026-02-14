import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LineupSelector } from "@/components/games/lineup-selector";
import { makePlayers, resetCounter } from "./helpers";

beforeEach(() => resetCounter());

function getRegularsList() {
  const heading = screen.getByText(/^Regulares/);
  return heading.closest("div")!;
}

function getRegularRows() {
  return getRegularsList().querySelectorAll("[class*='border-amber']");
}

function getRegularNames() {
  return Array.from(getRegularRows()).map(
    (row) => row.querySelector("span.text-sm")!.textContent!.trim()
  );
}

function getRegularOrders() {
  return Array.from(getRegularRows()).map(
    (row) => row.querySelector("span.text-xs.font-bold")!.textContent!.trim()
  );
}

/** Clicks the first available "Regular" button (re-queries each time) */
async function clickFirstRegular(user: ReturnType<typeof userEvent.setup>) {
  const btn = screen.getAllByRole("button", { name: "Regular" })[0];
  await user.click(btn);
}

/** Clicks the first available "Reserva" button */
async function clickFirstReserva(user: ReturnType<typeof userEvent.setup>) {
  const btn = screen.getAllByRole("button", { name: "Reserva" })[0];
  await user.click(btn);
}

/** Assigns N players as regulars by clicking the first available "Regular" button N times */
async function assignAllAsRegulars(
  user: ReturnType<typeof userEvent.setup>,
  count: number
) {
  for (let i = 0; i < count; i++) {
    await clickFirstRegular(user);
  }
}

describe("LineupSelector", () => {
  const defaultProps = {
    teamName: "Águilas",
    teamColor: "#f59e0b",
    onConfirm: vi.fn(),
  };

  it("renders all players as available initially", () => {
    const players = makePlayers(5);
    render(<LineupSelector players={players} {...defaultProps} />);

    expect(screen.getByText("Disponibles (5)")).toBeInTheDocument();
    expect(screen.getByText("Player A")).toBeInTheDocument();
    expect(screen.getByText("Player E")).toBeInTheDocument();
    expect(screen.getByText(/^Regulares/)).toHaveTextContent("Regulares (0)");
  });

  it("assigns a player as regular when clicking Regular button", async () => {
    const players = makePlayers(3);
    const user = userEvent.setup();
    render(<LineupSelector players={players} {...defaultProps} />);

    await clickFirstRegular(user);

    expect(screen.getByText(/^Regulares/)).toHaveTextContent("Regulares (1)");
    expect(screen.getByText("Disponibles (2)")).toBeInTheDocument();
  });

  it("assigns a player as reserva when clicking Reserva button", async () => {
    const players = makePlayers(3);
    const user = userEvent.setup();
    render(<LineupSelector players={players} {...defaultProps} />);

    // Click second player's Reserva button
    const reservaBtns = screen.getAllByRole("button", { name: "Reserva" });
    await user.click(reservaBtns[1]);

    expect(screen.getByText(/^Reservas/)).toHaveTextContent("Reservas (1)");
    expect(screen.getByText("Disponibles (2)")).toBeInTheDocument();
  });

  it("preserves insertion order for regulars", async () => {
    const players = makePlayers(4);
    const user = userEvent.setup();
    render(<LineupSelector players={players} {...defaultProps} />);

    // Assign D first (last available), then B, then A
    let btns = screen.getAllByRole("button", { name: "Regular" });
    await user.click(btns[3]); // Player D → regulars

    btns = screen.getAllByRole("button", { name: "Regular" });
    await user.click(btns[1]); // Player B → regulars

    btns = screen.getAllByRole("button", { name: "Regular" });
    await user.click(btns[0]); // Player A → regulars

    expect(getRegularNames()).toEqual(["Player D", "Player B", "Player A"]);
  });

  it("shows correct batting order numbers", async () => {
    const players = makePlayers(3);
    const user = userEvent.setup();
    render(<LineupSelector players={players} {...defaultProps} />);

    // Assign C first, then A
    let btns = screen.getAllByRole("button", { name: "Regular" });
    await user.click(btns[2]); // Player C

    btns = screen.getAllByRole("button", { name: "Regular" });
    await user.click(btns[0]); // Player A

    expect(getRegularOrders()).toEqual(["1", "2"]);
    expect(getRegularNames()).toEqual(["Player C", "Player A"]);
  });

  it("moves a player up in the order", async () => {
    const players = makePlayers(3);
    const user = userEvent.setup();
    render(<LineupSelector players={players} {...defaultProps} />);

    // Assign A, B, C as regulars
    await assignAllAsRegulars(user, 3);
    expect(getRegularNames()).toEqual(["Player A", "Player B", "Player C"]);

    // Move Player C (index 2) up — click the up chevron on 3rd row
    const upBtn = getRegularRows()[2].querySelectorAll("button")[0];
    await user.click(upBtn);

    expect(getRegularNames()).toEqual(["Player A", "Player C", "Player B"]);
    expect(getRegularOrders()).toEqual(["1", "2", "3"]);
  });

  it("moves a player down in the order", async () => {
    const players = makePlayers(3);
    const user = userEvent.setup();
    render(<LineupSelector players={players} {...defaultProps} />);

    await assignAllAsRegulars(user, 3);

    // Move Player A (index 0) down — click the down chevron on 1st row
    const downBtn = getRegularRows()[0].querySelectorAll("button")[1];
    await user.click(downBtn);

    expect(getRegularNames()).toEqual(["Player B", "Player A", "Player C"]);
  });

  it("disables up button for first player", async () => {
    const players = makePlayers(2);
    const user = userEvent.setup();
    render(<LineupSelector players={players} {...defaultProps} />);

    await assignAllAsRegulars(user, 2);

    const upButton = getRegularRows()[0].querySelectorAll("button")[0];
    expect(upButton).toBeDisabled();
  });

  it("disables down button for last player", async () => {
    const players = makePlayers(2);
    const user = userEvent.setup();
    render(<LineupSelector players={players} {...defaultProps} />);

    await assignAllAsRegulars(user, 2);

    const downButton = getRegularRows()[1].querySelectorAll("button")[1];
    expect(downButton).toBeDisabled();
  });

  it("removes a regular and returns them to available", async () => {
    const players = makePlayers(3);
    const user = userEvent.setup();
    render(<LineupSelector players={players} {...defaultProps} />);

    await assignAllAsRegulars(user, 2); // A, B
    expect(getRegularNames()).toEqual(["Player A", "Player B"]);

    // Remove Player A (click X — last button in first row)
    const btns = getRegularRows()[0].querySelectorAll("button");
    await user.click(btns[btns.length - 1]);

    expect(getRegularNames()).toEqual(["Player B"]);
    expect(screen.getByText("Disponibles (2)")).toBeInTheDocument();
  });

  it("assigns all available as regulars with shortcut", async () => {
    const players = makePlayers(4);
    const user = userEvent.setup();
    render(<LineupSelector players={players} {...defaultProps} />);

    await user.click(screen.getByText("Todos como regulares"));

    expect(screen.getByText(/^Regulares/)).toHaveTextContent("Regulares (4)");
    expect(screen.queryByText(/Disponibles/)).not.toBeInTheDocument();
  });

  it("calls onConfirm with correct lineup when confirmed", async () => {
    const players = makePlayers(3);
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(
      <LineupSelector
        players={players}
        teamName="Águilas"
        teamColor="#f59e0b"
        onConfirm={onConfirm}
      />
    );

    // Assign C as regular first
    let regularBtns = screen.getAllByRole("button", { name: "Regular" });
    await user.click(regularBtns[2]); // Player C

    // Assign A as regular second
    regularBtns = screen.getAllByRole("button", { name: "Regular" });
    await user.click(regularBtns[0]); // Player A

    // Assign B as reserva (only one left)
    await clickFirstReserva(user);

    await user.click(screen.getByText("Confirmar Lineup"));

    expect(onConfirm).toHaveBeenCalledOnce();
    const result = onConfirm.mock.calls[0][0];
    expect(result.regulars).toHaveLength(2);
    expect(result.regulars[0].last_name).toBe("C");
    expect(result.regulars[1].last_name).toBe("A");
    expect(result.reserves).toHaveLength(1);
    expect(result.reserves[0].last_name).toBe("B");
  });

  it("confirm button is disabled when no regulars selected", () => {
    const players = makePlayers(2);
    render(<LineupSelector players={players} {...defaultProps} />);

    expect(
      screen.getByText("Confirmar Lineup").closest("button")
    ).toBeDisabled();
  });

  it("preserves order after multiple moves", async () => {
    const players = makePlayers(4);
    const user = userEvent.setup();
    render(<LineupSelector players={players} {...defaultProps} />);

    await user.click(screen.getByText("Todos como regulares"));
    expect(getRegularNames()).toEqual([
      "Player A",
      "Player B",
      "Player C",
      "Player D",
    ]);

    // Move D from index 3 to the top, one step at a time
    await user.click(getRegularRows()[3].querySelectorAll("button")[0]); // D up
    expect(getRegularNames()).toEqual([
      "Player A",
      "Player B",
      "Player D",
      "Player C",
    ]);

    await user.click(getRegularRows()[2].querySelectorAll("button")[0]); // D up
    expect(getRegularNames()).toEqual([
      "Player A",
      "Player D",
      "Player B",
      "Player C",
    ]);

    await user.click(getRegularRows()[1].querySelectorAll("button")[0]); // D up
    expect(getRegularNames()).toEqual([
      "Player D",
      "Player A",
      "Player B",
      "Player C",
    ]);

    expect(getRegularOrders()).toEqual(["1", "2", "3", "4"]);
  });
});
