import { describe, it, expect } from "vitest";
import {
  deriveActiveBlockers,
  deriveDecisionsForSession,
  deriveOpenCalls,
} from "@/lib/derive";
import type {
  SiteContent,
  Blocker,
  Decision,
  Project,
} from "@/content/site";

function makeContent(overrides: Partial<SiteContent> = {}): SiteContent {
  return {
    lastUpdated: "2026-05-26",
    cohort: "Test",
    session: { dayOfWeek: 5, hour: 12, minute: 0, venue: "T", teamsUrl: "", agenda: [] },
    projects: [],
    log: [],
    leads: [],
    actions: [],
    blockers: [],
    decisions: [],
    outcomes: [],
    partners: [],
    artifacts: [],
    studentWork: [],
    meetings: [],
    ...overrides,
  };
}

describe("deriveActiveBlockers", () => {
  it("returns empty when no blockers", () => {
    expect(deriveActiveBlockers(makeContent())).toEqual([]);
  });

  it("filters out resolved blockers", () => {
    const blockers: Blocker[] = [
      { id: "b1", project: "p", body: "stuck", created: "2026-05-10" },
      { id: "b2", project: "p", body: "done",  created: "2026-05-11", resolved: "2026-05-15" },
    ];
    const result = deriveActiveBlockers(makeContent({ blockers }));
    expect(result.map((b) => b.id)).toEqual(["b1"]);
  });

  it("sorts by created date descending", () => {
    const blockers: Blocker[] = [
      { id: "b1", project: "p", body: "old",   created: "2026-05-10" },
      { id: "b2", project: "p", body: "newer", created: "2026-05-20" },
      { id: "b3", project: "p", body: "mid",   created: "2026-05-15" },
    ];
    const result = deriveActiveBlockers(makeContent({ blockers }));
    expect(result.map((b) => b.id)).toEqual(["b2", "b3", "b1"]);
  });
});

describe("deriveDecisionsForSession", () => {
  const d: (id: string, status: "queued" | "decided", forSession: string, created?: string) => Decision = (
    id, status, forSession, created = "2026-05-20"
  ) => ({ id, project: "p", question: "Q?", created, forSession, status });

  it("returns only queued decisions when no date filter", () => {
    const decisions = [d("a", "queued", "2026-05-29"), d("b", "decided", "2026-05-22")];
    const result = deriveDecisionsForSession(makeContent({ decisions }));
    expect(result.map((x) => x.id)).toEqual(["a"]);
  });

  it("filters by session date when provided", () => {
    const decisions = [
      d("a", "queued", "2026-05-29"),
      d("b", "queued", "2026-06-05"),
    ];
    const result = deriveDecisionsForSession(makeContent({ decisions }), "2026-05-29");
    expect(result.map((x) => x.id)).toEqual(["a"]);
  });

  it("sorts queued items by created date desc", () => {
    const decisions = [
      d("a", "queued", "2026-05-29", "2026-05-22"),
      d("b", "queued", "2026-05-29", "2026-05-24"),
    ];
    const result = deriveDecisionsForSession(makeContent({ decisions }));
    expect(result.map((x) => x.id)).toEqual(["b", "a"]);
  });
});

describe("deriveOpenCalls", () => {
  const p: (id: string, status: Project["status"], open?: string) => Project = (id, status, open) => ({
    id,
    name: id,
    status,
    stage: "",
    area: "",
    leads: "",
    summary: "",
    open,
    updated: "2026-05-20",
  });

  it("returns only kickoff projects with an open line", () => {
    const projects = [
      p("a", "active", "should be excluded"),
      p("b", "kickoff", "looking for help"),
      p("c", "kickoff"),
    ];
    const result = deriveOpenCalls(makeContent({ projects }));
    expect(result.map((x) => x.id)).toEqual(["b"]);
  });
});
