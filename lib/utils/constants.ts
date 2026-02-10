export const POSITIONS = [
  "P",
  "C",
  "1B",
  "2B",
  "3B",
  "SS",
  "LF",
  "CF",
  "RF",
  "DH",
  "UT",
] as const;

export type Position = (typeof POSITIONS)[number];

export const BAT_SIDES = ["R", "L", "S"] as const;
export type BatSide = (typeof BAT_SIDES)[number];

export const THROW_SIDES = ["R", "L"] as const;
export type ThrowSide = (typeof THROW_SIDES)[number];

export const GAME_STATUSES = [
  "scheduled",
  "in_progress",
  "final",
  "postponed",
  "cancelled",
] as const;
export type GameStatus = (typeof GAME_STATUSES)[number];

export const PITCH_DECISIONS = ["W", "L", "S", null] as const;
export type PitchDecision = (typeof PITCH_DECISIONS)[number];

export const DEFAULT_INNINGS = 7;

export const NAV_ITEMS = [
  { label: "Inicio", href: "/", icon: "Home" as const },
  { label: "Equipos", href: "/equipos", icon: "Users" as const },
  { label: "Jugadores", href: "/jugadores", icon: "User" as const },
  { label: "Juegos", href: "/juegos", icon: "Calendar" as const },
] as const;

export const ADMIN_NAV_ITEM = {
  label: "Admin",
  href: "/admin",
  icon: "Settings" as const,
} as const;

export const GAME_STATUS_LABELS: Record<GameStatus, string> = {
  scheduled: "Programado",
  in_progress: "En Progreso",
  final: "Final",
  postponed: "Pospuesto",
  cancelled: "Cancelado",
};

export const GAME_STATUS_COLORS: Record<GameStatus, string> = {
  scheduled: "bg-blue-500/20 text-blue-400",
  in_progress: "bg-amber-500/20 text-amber-400",
  final: "bg-zinc-500/20 text-zinc-400",
  postponed: "bg-orange-500/20 text-orange-400",
  cancelled: "bg-red-500/20 text-red-400",
};
