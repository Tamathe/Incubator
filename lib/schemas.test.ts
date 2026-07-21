import { describe, it, expect } from "vitest";
import {
  subscribeSchema,
  memberRegistrationSchema,
  rsvpSchema,
  pitchSchema,
  loginSchema,
} from "./schemas";

describe("memberRegistrationSchema", () => {
  it("accepts and normalizes an email", () => {
    const r = memberRegistrationSchema.parse({ email: "Tama@UKY.edu" });
    expect(r.email).toBe("tama@uky.edu");
  });

  it("rejects malformed email", () => {
    expect(() => memberRegistrationSchema.parse({ email: "nope" })).toThrow();
  });

  it("rejects extra fields", () => {
    expect(() =>
      memberRegistrationSchema.parse({
        email: "alex@example.com",
        name: "Alex",
      }),
    ).toThrow();
  });
});

describe("subscribeSchema", () => {
  it("accepts a valid email", () => {
    const r = subscribeSchema.parse({ email: "Foo@UKY.edu" });
    expect(r.email).toBe("foo@uky.edu");
  });

  it("rejects malformed email", () => {
    expect(() => subscribeSchema.parse({ email: "nope" })).toThrow();
  });

  it("rejects oversize email", () => {
    const long = "a".repeat(250) + "@uky.edu";
    expect(() => subscribeSchema.parse({ email: long })).toThrow();
  });

  it("accepts optional source", () => {
    const r = subscribeSchema.parse({ email: "x@uky.edu", source: "footer" });
    expect(r.source).toBe("footer");
  });

  it("drops honeypot 'website' from output (it lives at the route level)", () => {
    expect(() =>
      subscribeSchema.parse({ email: "x@uky.edu", website: "bot" }),
    ).toThrow();
  });
});

describe("rsvpSchema", () => {
  it("accepts a complete RSVP", () => {
    const r = rsvpSchema.parse({
      name: "Tama Thé",
      email: "tama@uky.edu",
      role: "Faculty",
      motivations: ["Curious about the group"],
      note: "Excited",
      joinListserv: true,
    });
    expect(r.email).toBe("tama@uky.edu");
    expect(r.motivations).toHaveLength(1);
  });

  it("trims name and note", () => {
    const r = rsvpSchema.parse({
      name: "  Tama  ",
      email: "t@uky.edu",
      motivations: [],
      joinListserv: false,
      note: "  hi  ",
    });
    expect(r.name).toBe("Tama");
    expect(r.note).toBe("hi");
  });

  it("caps motivations at 10", () => {
    const motivations = Array(11).fill("x");
    expect(() =>
      rsvpSchema.parse({
        name: "X",
        email: "x@uky.edu",
        motivations,
        joinListserv: false,
      }),
    ).toThrow();
  });

  it("requires non-empty name", () => {
    expect(() =>
      rsvpSchema.parse({
        name: "",
        email: "x@uky.edu",
        motivations: [],
        joinListserv: false,
      }),
    ).toThrow();
  });
});

describe("pitchSchema", () => {
  it("accepts a complete pitch", () => {
    const r = pitchSchema.parse({
      submitterName: "X",
      submitterEmail: "x@uky.edu",
      problem: "Problem text",
      affected: "Affected group",
      firstBuild: "Build idea",
    });
    expect(r.problem).toBe("Problem text");
  });

  it("requires the proposal and the ask", () => {
    expect(() =>
      pitchSchema.parse({
        submitterName: "X",
        submitterEmail: "x@uky.edu",
        problem: "",
        affected: "Group",
        firstBuild: "Build",
      }),
    ).toThrow();
  });

  it("allows the advance context to be omitted", () => {
    const r = pitchSchema.parse({
      submitterName: "X",
      submitterEmail: "x@uky.edu",
      problem: "A short talk",
      affected: "Questions from the room",
    });
    expect(r.firstBuild).toBeUndefined();
  });

  it("accepts a preferred and alternate Friday", () => {
    const r = pitchSchema.parse({
      submitterName: "Tama",
      submitterEmail: "tama@uky.edu",
      problem: "A session idea",
      affected: "Feedback from the room",
      preferredFriday: "2026-08-14",
      alternateFriday: "2026-08-21",
    });
    expect(r.preferredFriday).toBe("2026-08-14");
    expect(r.alternateFriday).toBe("2026-08-21");
  });

  it("rejects non-Friday and duplicate booking dates", () => {
    expect(() =>
      pitchSchema.parse({
        submitterName: "Tama",
        submitterEmail: "tama@uky.edu",
        problem: "A session idea",
        affected: "Feedback from the room",
        preferredFriday: "2026-08-13",
      }),
    ).toThrow();

    expect(() =>
      pitchSchema.parse({
        submitterName: "Tama",
        submitterEmail: "tama@uky.edu",
        problem: "A session idea",
        affected: "Feedback from the room",
        preferredFriday: "2026-08-14",
        alternateFriday: "2026-08-14",
      }),
    ).toThrow();
  });

  it("caps problem at 2000 chars", () => {
    expect(() =>
      pitchSchema.parse({
        submitterName: "X",
        submitterEmail: "x@uky.edu",
        problem: "a".repeat(2001),
        affected: "Group",
        firstBuild: "Build",
      }),
    ).toThrow();
  });
});

describe("loginSchema", () => {
  it("accepts a string password", () => {
    const r = loginSchema.parse({ password: "hunter2hunter2" });
    expect(r.password).toBe("hunter2hunter2");
  });

  it("rejects missing password", () => {
    expect(() => loginSchema.parse({})).toThrow();
  });
});
