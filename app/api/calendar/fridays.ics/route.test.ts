import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FridaySlot } from "@/lib/friday-booking";

const loadFridaySlotsMock = vi.fn();

vi.mock("@/lib/friday-booking", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/friday-booking")>();
  return {
    ...actual,
    loadFridaySlots: loadFridaySlotsMock,
  };
});

function slot(date: string, state: FridaySlot["state"]): FridaySlot {
  return { date, state, label: date, detail: state };
}

beforeEach(() => {
  loadFridaySlotsMock.mockReset().mockResolvedValue([
    slot("2026-07-31", "booked"),
    slot("2026-08-07", "reserved"),
    slot("2026-08-14", "booked"),
    slot("2026-08-21", "available"),
    slot("2026-08-28", "booked"),
    slot("2026-09-04", "reserved"),
    slot("2026-09-11", "booked"),
    slot("2026-09-18", "available"),
    slot("2026-09-25", "booked"),
    slot("2026-10-02", "reserved"),
    slot("2026-10-09", "available"),
    slot("2026-10-16", "available"),
  ]);
});

describe("GET /api/calendar/fridays.ics", () => {
  it("downloads the next 12 Friday slots as an Outlook-compatible calendar", async () => {
    const { GET } = await import("./route");
    const response = await GET();
    const body = await response.text();

    expect(loadFridaySlotsMock).toHaveBeenCalledWith(expect.any(Date), 12);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "text/calendar; charset=utf-8",
    );
    expect(response.headers.get("content-disposition")).toBe(
      'attachment; filename="aiincubator-fridays.ics"',
    );
    expect(body).toContain("BEGIN:VCALENDAR\r\nVERSION:2.0");
    expect(body).toContain("METHOD:PUBLISH");
    expect(body).toContain("TZID:America/New_York");
    expect(body).toContain(
      "SUMMARY:[Presentation] Copilot Cowork for Knowledge Work",
    );
    expect(body).toContain(
      "DTSTART;TZID=America/New_York:20260731T120000",
    );
    expect(body).toContain("DTEND;TZID=America/New_York:20260731T124500");
    expect(body).toContain("SUMMARY:AI Incubator \u2014 reserved Friday");
    expect(body).toContain("SUMMARY:AI Incubator \u2014 Friday meeting");
    expect(body.match(/BEGIN:VEVENT/g)).toHaveLength(12);
    expect(body.endsWith("END:VCALENDAR")).toBe(true);
  });
});
