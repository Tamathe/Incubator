import { describe, expect, it } from "vitest";
import type { MeetingSession } from "@/content/site";
import { meetingToIcsEvent } from "./calendar";

function session(durationMinutes?: number): MeetingSession {
  return {
    date: "2026-07-31",
    kind: "presentation",
    title: "AI for Knowledge Work",
    durationMinutes,
  };
}

describe("meeting calendar duration", () => {
  it("uses a published session duration when one is provided", () => {
    const event = meetingToIcsEvent(session(45), 0);

    expect(event.end.getTime() - event.start.getTime()).toBe(45 * 60_000);
  });

  it("keeps the one-hour default for other Friday sessions", () => {
    const event = meetingToIcsEvent(session(), 0);

    expect(event.end.getTime() - event.start.getTime()).toBe(60 * 60_000);
  });
});
