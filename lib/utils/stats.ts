export function calcAvg(hits: number, atBats: number): string {
  if (atBats === 0) return ".000";
  const avg = hits / atBats;
  return avg.toFixed(3).replace(/^0/, "");
}

export function calcSlg(
  singles: number,
  doubles: number,
  triples: number,
  homeRuns: number,
  atBats: number
): string {
  if (atBats === 0) return ".000";
  const totalBases = singles + doubles * 2 + triples * 3 + homeRuns * 4;
  const slg = totalBases / atBats;
  return slg.toFixed(3).replace(/^0/, "");
}

export function calcObp(
  hits: number,
  walks: number,
  hbp: number,
  atBats: number,
  sacrificeFlies: number
): string {
  const denominator = atBats + walks + hbp + sacrificeFlies;
  if (denominator === 0) return ".000";
  const obp = (hits + walks + hbp) / denominator;
  return obp.toFixed(3).replace(/^0/, "");
}

export function calcOps(obp: string, slg: string): string {
  const ops = parseFloat(obp) + parseFloat(slg);
  if (ops >= 1) return ops.toFixed(3);
  return ops.toFixed(3).replace(/^0/, "");
}

export function calcEra(earnedRuns: number, inningsPitched: number): string {
  if (inningsPitched === 0) return "0.00";
  const era = (earnedRuns / inningsPitched) * 7;
  return era.toFixed(2);
}

export function calcWinPct(wins: number, losses: number): string {
  const total = wins + losses;
  if (total === 0) return ".000";
  const pct = wins / total;
  return pct.toFixed(3).replace(/^0/, "");
}
