import type { MeetingSession } from "@/content/site";
import { content } from "@/content/site";

export const BOOKING_TIME_ZONE = "America/New_York";
export const BOOKING_HORIZON_WEEKS = 27;
export const BOOKING_HOLD_DAYS = 7;

export type FridaySlotState =
  | "available"
  | "reserved"
  | "held"
  | "booked"
  | "unavailable";

export interface FridaySlot {
  date: string;
  label: string;
  state: FridaySlotState;
  detail: string;
}

interface BookingRecord {
  scheduledFriday: Date;
  bookingStatus: string | null;
  bookingHoldUntil: Date | null;
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function isoToUtcDate(iso: string): Date | null {
  const match = ISO_DATE.exec(iso);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

function utcDateToIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(iso: string, days: number): string {
  const date = isoToUtcDate(iso);
  if (!date) throw new Error("invalid ISO date");
  date.setUTCDate(date.getUTCDate() + days);
  return utcDateToIso(date);
}

function easternNowParts(now: Date): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BOOKING_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

export function nextBookableFridaySeries(
  weeks = BOOKING_HORIZON_WEEKS,
  now: Date = new Date(),
): string[] {
  const parts = easternNowParts(now);
  const today = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  const todayIso = utcDateToIso(today);
  let daysUntilFriday = (5 - today.getUTCDay() + 7) % 7;
  if (
    daysUntilFriday === 0 &&
    (parts.hour > content.session.hour ||
      (parts.hour === content.session.hour && parts.minute >= content.session.minute))
  ) {
    daysUntilFriday = 7;
  }
  const first = addUtcDays(todayIso, daysUntilFriday);
  return Array.from({ length: weeks }, (_, index) =>
    addUtcDays(first, index * 7),
  );
}

export function isFridayIso(iso: string): boolean {
  return isoToUtcDate(iso)?.getUTCDay() === 5;
}

export function isFirstFriday(iso: string): boolean {
  const date = isoToUtcDate(iso);
  return date?.getUTCDay() === 5 && date.getUTCDate() <= 7;
}

export function bookingDateFromIso(iso: string): Date {
  const date = isoToUtcDate(iso);
  if (!date) throw new Error("invalid ISO date");
  return date;
}

export function bookingDateToIso(date: Date): string {
  return utcDateToIso(date);
}

export function formatFridayLabel(iso: string): string {
  const date = isoToUtcDate(iso);
  if (!date) return iso;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function validateBookableFriday(
  iso: string,
  now: Date = new Date(),
): string | null {
  if (!isFridayIso(iso)) return "Choose a Friday.";
  if (isFirstFriday(iso)) {
    return "The first Friday of every month is reserved for the Incubator.";
  }
  if (!nextBookableFridaySeries(BOOKING_HORIZON_WEEKS, now).includes(iso)) {
    return "Choose a Friday within the current booking window.";
  }
  const meetings = content.meetings.filter((meeting) => meeting.date === iso);
  if (meetings.length > 0) return "That Friday is already on the calendar.";
  return null;
}

export function buildFridaySlots(
  bookings: BookingRecord[],
  meetings: MeetingSession[] = content.meetings,
  now: Date = new Date(),
  weeks = BOOKING_HORIZON_WEEKS,
): FridaySlot[] {
  const bookingByDate = new Map(
    bookings.map((booking) => [
      bookingDateToIso(booking.scheduledFriday),
      booking,
    ]),
  );

  return nextBookableFridaySeries(weeks, now).map((date) => {
    const label = formatFridayLabel(date);
    if (isFirstFriday(date)) {
      return {
        date,
        label,
        state: "reserved",
        detail: "Reserved for the Incubator",
      };
    }

    const scheduled = meetings.filter((meeting) => meeting.date === date);
    if (scheduled.length > 0) {
      const cancelled = scheduled.every(
        (meeting) => meeting.kind === "cancelled",
      );
      return {
        date,
        label,
        state: cancelled ? "unavailable" : "booked",
        detail: cancelled
          ? "No meeting"
          : scheduled.map((meeting) => meeting.title).join(" / "),
      };
    }

    const booking = bookingByDate.get(date);
    if (booking) {
      const activeHold =
        booking.bookingStatus === "requested" &&
        booking.bookingHoldUntil !== null &&
        booking.bookingHoldUntil > now;
      if (activeHold) {
        return { date, label, state: "held", detail: "On hold" };
      }
      if (
        booking.bookingStatus === "confirmed" ||
        booking.bookingStatus === "completed"
      ) {
        return { date, label, state: "booked", detail: "Booked" };
      }
    }

    return { date, label, state: "available", detail: "Open" };
  });
}

export async function loadFridaySlots(
  now: Date = new Date(),
  weeks = BOOKING_HORIZON_WEEKS,
): Promise<FridaySlot[]> {
  if (!process.env.DATABASE_URL) return buildFridaySlots([], content.meetings, now, weeks);

  try {
    const { prisma } = await import("@/lib/prisma");
    const bookings = await prisma.pitch.findMany({
      where: {
        scheduledFriday: { not: null },
        OR: [
          { bookingStatus: "confirmed" },
          { bookingStatus: "completed" },
          {
            bookingStatus: "requested",
            bookingHoldUntil: { gt: now },
          },
        ],
      },
      select: {
        scheduledFriday: true,
        bookingStatus: true,
        bookingHoldUntil: true,
      },
    });
    const bookingRecords: BookingRecord[] = bookings.flatMap((booking) =>
      booking.scheduledFriday
        ? [{ ...booking, scheduledFriday: booking.scheduledFriday }]
        : [],
    );
    return buildFridaySlots(bookingRecords, content.meetings, now, weeks);
  } catch (error) {
    console.error("Friday booking availability failed", error);
    return buildFridaySlots([], content.meetings, now, weeks);
  }
}

export function bookingHoldUntil(now: Date = new Date()): Date {
  return new Date(now.getTime() + BOOKING_HOLD_DAYS * 24 * 60 * 60 * 1000);
}
