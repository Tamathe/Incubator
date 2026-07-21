import { describe, expect, it } from "vitest";
import {
  buildFridaySlots,
  formatFridayLabel,
  isFirstFriday,
  nextBookableFridaySeries,
  validateBookableFriday,
} from "./friday-booking";

const TUESDAY = new Date("2026-07-21T14:00:00.000Z");

describe("Friday booking rules", () => {
  it("generates Friday dates in Eastern time", () => {
    expect(nextBookableFridaySeries(3, TUESDAY)).toEqual([
      "2026-07-24",
      "2026-07-31",
      "2026-08-07",
    ]);
  });

  it("moves to the following week after Friday's session begins", () => {
    const fridayAfternoon = new Date("2026-07-24T17:00:00.000Z");
    expect(nextBookableFridaySeries(1, fridayAfternoon)).toEqual([
      "2026-07-31",
    ]);
  });

  it("reserves the first Friday of every month", () => {
    expect(isFirstFriday("2026-08-07")).toBe(true);
    expect(isFirstFriday("2026-08-14")).toBe(false);
    expect(validateBookableFriday("2026-08-07", TUESDAY)).toMatch(
      /first Friday/i,
    );
  });

  it("marks published meetings, holds, and open Fridays", () => {
    const slots = buildFridaySlots(
      [
        {
          scheduledFriday: new Date("2026-08-14T00:00:00.000Z"),
          bookingStatus: "requested",
          bookingHoldUntil: new Date("2026-07-25T00:00:00.000Z"),
        },
      ],
      [
        {
          date: "2026-07-31",
          kind: "presentation",
          title: "AI for knowledge work",
        },
      ],
      TUESDAY,
      5,
    );

    expect(slots.map((slot) => [slot.date, slot.state])).toEqual([
      ["2026-07-24", "available"],
      ["2026-07-31", "booked"],
      ["2026-08-07", "reserved"],
      ["2026-08-14", "held"],
      ["2026-08-21", "available"],
    ]);
  });

  it("formats dates without depending on the server timezone", () => {
    expect(formatFridayLabel("2026-08-14")).toBe("Friday, August 14, 2026");
  });
});
