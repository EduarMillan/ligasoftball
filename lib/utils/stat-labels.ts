/** Mapa de abreviaturas de estadísticas → nombre completo en español */
export const statLabels: Record<string, string> = {
  // Batting
  G: "Juegos jugados",
  PA: "Apariciones al plato",
  AB: "Turnos al bate",
  R: "Carreras",
  H: "Hits",
  "1B": "Sencillos",
  "2B": "Dobles",
  "3B": "Triples",
  HR: "Jonrones",
  RBI: "Carreras impulsadas",
  BB: "Bases por bolas",
  SO: "Ponches",
  SB: "Bases robadas",
  CS: "Atrapado robando",
  HBP: "Golpeado por lanzamiento",
  SF: "Sacrifice fly",
  SAC: "Sacrifice bunt",
  GDP: "Doble play",
  LOB: "Dejados en base",
  TB: "Total de bases",
  AVG: "Promedio de bateo",
  OBP: "Porcentaje de embasado",
  SLG: "Slugging",
  OPS: "OBP + SLG",
  BABIP: "Promedio en bolas en juego",
  ISO: "Poder aislado",

  // Pitching
  IP: "Innings lanzados",
  HA: "Hits permitidos",
  ER: "Carreras limpias",
  BBA: "Bases por bolas permitidas",
  KP: "Ponches lanzados",
  ERA: "Efectividad (carreras limpias)",
  WHIP: "Corredores por inning",
  W: "Victorias",
  L: "Derrotas",
  S: "Salvamentos",
  K: "Ponches",

  // Fielding
  PO: "Putouts",
  A: "Asistencias",
  E: "Errores",
  DP: "Doble plays",
  FPCT: "Porcentaje de fildeo",
};

/** Retorna el nombre completo en español o la abreviatura misma si no hay */
export function getStatLabel(abbr: string): string {
  return statLabels[abbr.toUpperCase()] ?? abbr;
}
