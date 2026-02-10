import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";

export function formatDate(date: string | Date, pattern = "d MMM yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "";
  return format(d, pattern, { locale: es });
}

export function formatGameDate(date: string | Date): string {
  return formatDate(date, "EEE d MMM, yyyy");
}

export function formatShortDate(date: string | Date): string {
  return formatDate(date, "d/M");
}

export function formatFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

export function formatInningsPitched(ip: number): string {
  const full = Math.floor(ip);
  const fraction = Math.round((ip - full) * 10);
  if (fraction === 0) return `${full}.0`;
  return `${full}.${fraction}`;
}

export function formatScore(home: number | null, away: number | null): string {
  if (home === null || away === null) return "vs";
  return `${away} - ${home}`;
}
