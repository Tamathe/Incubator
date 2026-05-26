import { content, type MeetingSession } from "@/content/site";
import { nextSession } from "@/lib/session";

/**
 * Returns the next `n` Friday Date objects starting from the next upcoming
 * session occurrence. Each Date is the Friday at session start time (noon ET
 * in local interpretation; see lib/session.ts).
 */
export function upcomingFridays(n: number, now: Date = new Date()): Date[] {
  const first = nextSession(now);
  const fridays: Date[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(first);
    d.setDate(d.getDate() + i * 7);
    fridays.push(d);
  }
  return fridays;
}

/**
 * Convert a Friday `Date` to an ISO date string (YYYY-MM-DD) in local time.
 * Used for matching against MeetingSession.date.
 */
export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * All `MeetingSession` entries for the given ISO date, in insertion order.
 * Returns an empty array if the date has no entries.
 */
export function meetingsForDate(isoDate: string): MeetingSession[] {
  return content.meetings.filter((m) => m.date === isoDate);
}
