import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  it("allows up to the configured number of requests", () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit("test:1.2.3.4", { max: 5, windowMs: 60_000 })).toBe(true);
    }
  });

  it("blocks the next request after the cap", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("test:1.2.3.5", { max: 5, windowMs: 60_000 });
    }
    expect(checkRateLimit("test:1.2.3.5", { max: 5, windowMs: 60_000 })).toBe(false);
  });

  it("resets after the window expires", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("test:1.2.3.6", { max: 5, windowMs: 60_000 });
    }
    expect(checkRateLimit("test:1.2.3.6", { max: 5, windowMs: 60_000 })).toBe(false);
    vi.advanceTimersByTime(60_001);
    expect(checkRateLimit("test:1.2.3.6", { max: 5, windowMs: 60_000 })).toBe(true);
  });

  it("tracks different keys independently", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("test:a", { max: 5, windowMs: 60_000 });
    }
    expect(checkRateLimit("test:a", { max: 5, windowMs: 60_000 })).toBe(false);
    expect(checkRateLimit("test:b", { max: 5, windowMs: 60_000 })).toBe(true);
  });
});
