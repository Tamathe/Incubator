import { content } from "@/content/site";

/**
 * Compute the next occurrence of the recurring weekly session from "now".
 * If today is the session day and we're past the start time, returns next week.
 */
export function nextSession(now: Date = new Date()): Date {
  const { dayOfWeek, hour, minute } = content.session;
  const d = new Date(now);
  const today = d.getDay();
  let daysUntil = (dayOfWeek - today + 7) % 7;
  d.setHours(hour, minute, 0, 0);
  if (daysUntil === 0 && d <= now) daysUntil = 7;
  d.setDate(d.getDate() + daysUntil);
  return d;
}

export function fmtSessionWhen(d: Date): string {
  const dateStr = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeStr = d
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    .toLowerCase();
  return `${dateStr} · ${timeStr}`;
}

export function fmtCadenceLine(d: Date): string {
  const timeStr = d
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    .toLowerCase();
  return `Fridays · ${timeStr} · ${content.session.venue}`;
}

export function fmtIsoDate(
  iso: string,
  opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
): string {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", opts);
}
