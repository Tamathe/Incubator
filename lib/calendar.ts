import { content, type MeetingSession } from "@/content/site";
import type { FridaySlot } from "@/lib/friday-booking";
import { nextSession } from "@/lib/session";

export const FRIDAY_CALENDAR_HORIZON = 12;

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

// ─── ICS serialization (RFC 5545) ─────────────────────────────────────────

export interface IcsEvent {
  /** Stable identifier, e.g. "2026-05-29-pitch-0@aiincubator.uky.edu". */
  uid: string;
  start: Date;
  end: Date;
  summary: string;
  description?: string;
  location?: string;
}

/** Escape a text field per RFC 5545 §3.3.11. */
function escapeIcsText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

/**
 * Fold a content line to 75 octets per RFC 5545 §3.1. Subsequent lines start
 * with a single space. Lines are joined with CRLF.
 */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  let i = 0;
  while (i < line.length) {
    const size = i === 0 ? 75 : 74;
    chunks.push(line.slice(i, i + size));
    i += size;
  }
  return chunks.join("\r\n ");
}

/** Format a Date as a TZID-local string: 20260529T120000 */
function fmtLocal(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${y}${mo}${da}T${h}${mi}${s}`;
}

/** Format a Date as a UTC stamp: 20260526T143015Z */
function fmtUtc(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

const VTIMEZONE_NY = [
  "BEGIN:VTIMEZONE",
  "TZID:America/New_York",
  "BEGIN:STANDARD",
  "DTSTART:19701101T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
  "TZOFFSETFROM:-0400",
  "TZOFFSETTO:-0500",
  "TZNAME:EST",
  "END:STANDARD",
  "BEGIN:DAYLIGHT",
  "DTSTART:19700308T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
  "TZOFFSETFROM:-0500",
  "TZOFFSETTO:-0400",
  "TZNAME:EDT",
  "END:DAYLIGHT",
  "END:VTIMEZONE",
].join("\r\n");

function serializeVevent(e: IcsEvent, stamp: Date): string {
  const lines = [
    "BEGIN:VEVENT",
    `UID:${e.uid}`,
    `DTSTAMP:${fmtUtc(stamp)}`,
    `DTSTART;TZID=America/New_York:${fmtLocal(e.start)}`,
    `DTEND;TZID=America/New_York:${fmtLocal(e.end)}`,
    `SUMMARY:${escapeIcsText(e.summary)}`,
  ];
  if (e.description) lines.push(`DESCRIPTION:${escapeIcsText(e.description)}`);
  if (e.location) lines.push(`LOCATION:${escapeIcsText(e.location)}`);
  lines.push("END:VEVENT");
  return lines.map(foldLine).join("\r\n");
}

function wrapVcalendar(body: string): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AI Incubator UK//Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    VTIMEZONE_NY,
    body,
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Returns a full VCALENDAR string containing one VEVENT. */
export function buildIcsEvent(e: IcsEvent): string {
  return wrapVcalendar(serializeVevent(e, new Date()));
}

/** Returns a full VCALENDAR string containing N VEVENTs. */
export function buildIcsCalendar(events: IcsEvent[]): string {
  const stamp = new Date();
  const body = events.map((e) => serializeVevent(e, stamp)).join("\r\n");
  return wrapVcalendar(body);
}

// ─── Domain mapping ───────────────────────────────────────────────────────

/** Parse an ISO date string into a local noon start and a configurable end. */
function fridayNoonRange(
  isoDate: string,
  durationMinutes = 60,
): { start: Date; end: Date } {
  const [y, m, d] = isoDate.split("-").map(Number);
  const start = new Date(y, m - 1, d, 12, 0, 0, 0);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  return { start, end };
}

export const KIND_LABEL: Record<MeetingSession["kind"], string> = {
  pitch: "Pitch",
  demo: "Demo",
  presentation: "Presentation",
  roundtable: "Roundtable",
  cancelled: "Cancelled",
};

/** Map a published MeetingSession → IcsEvent. */
export function meetingToIcsEvent(m: MeetingSession, indexOnDate: number): IcsEvent {
  const { start, end } = fridayNoonRange(m.date, m.durationMinutes);
  const descParts: string[] = [];
  if (m.blurb) descParts.push(m.blurb);
  if (m.presenters) descParts.push(`Presenters: ${m.presenters}`);
  descParts.push(`Teams: ${content.session.teamsUrl}`);
  return {
    uid: `${m.date}-${m.kind}-${indexOnDate}@aiincubator.uky.edu`,
    start,
    end,
    summary: `[${KIND_LABEL[m.kind]}] ${m.title}`,
    description: descParts.join("\n"),
    location: content.session.venue,
  };
}

/** Synthesize an IcsEvent for a Friday with no MeetingSession entries. */
export function openFridayToIcsEvent(friday: Date): IcsEvent {
  const iso = toIsoDate(friday);
  const { start, end } = fridayNoonRange(iso);
  return {
    uid: `${iso}-open@aiincubator.uky.edu`,
    start,
    end,
    summary: "AI Incubator — Friday meeting",
    description: `Open Friday — topic TBD.\nTeams: ${content.session.teamsUrl}`,
    location: content.session.venue,
  };
}

/** Build a calendar placeholder for a reserved or confirmed Friday. */
export function scheduledFridayToIcsEvent(
  isoDate: string,
  summary: string,
  description: string,
): IcsEvent {
  const { start, end } = fridayNoonRange(isoDate);
  return {
    uid: `${isoDate}-scheduled@aiincubator.uky.edu`,
    start,
    end,
    summary,
    description: `${description}\nTeams: ${content.session.teamsUrl}`,
    location: content.session.venue,
  };
}

/**
 * Build the multi-Friday calendar bundle used by the Fridays page and the
 * public calendar download endpoint.
 */
export function fridaySlotsToIcsEvents(
  slots: FridaySlot[],
  horizon = FRIDAY_CALENDAR_HORIZON,
): IcsEvent[] {
  const events: IcsEvent[] = [];

  for (const slot of slots.slice(0, horizon)) {
    const meetings = meetingsForDate(slot.date);
    if (meetings.length > 0) {
      meetings.forEach((meeting, index) => {
        if (meeting.kind !== "cancelled") {
          events.push(meetingToIcsEvent(meeting, index));
        }
      });
    } else if (slot.state === "available") {
      events.push(openFridayToIcsEvent(new Date(`${slot.date}T12:00:00`)));
    } else if (slot.state === "reserved") {
      events.push(
        scheduledFridayToIcsEvent(
          slot.date,
          "AI Incubator \u2014 reserved Friday",
          "The first Friday of the month is reserved for the Incubator's own session.",
        ),
      );
    } else if (slot.state === "booked") {
      events.push(
        scheduledFridayToIcsEvent(
          slot.date,
          "AI Incubator \u2014 Friday session",
          "This Friday has a confirmed session. Details will be published after review.",
        ),
      );
    }
  }

  return events;
}

// ─── Browser download ─────────────────────────────────────────────────────

/** Trigger a browser download of `.ics` content. Client-only. */
export function downloadIcs(filename: string, contents: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([contents], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
