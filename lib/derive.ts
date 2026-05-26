import type {
  ActionItem,
  Blocker,
  Decision,
  LogEntry,
  Project,
  ProjectStatus,
  SiteContent,
} from "@/content/site";
import { nextSession } from "@/lib/session";

/**
 * Pure derivation helpers over SiteContent.
 *
 * Sub-project 1 of the PM surface: actions/blockers/decisions are the
 * source of truth; LogEntry / agenda / staleness are computed at build
 * time from them. Manual log[] entries always pass through unchanged.
 */

export interface DerivedLogEntry extends LogEntry {
  /** Synthetic rows get a kind for keying + (optional) future styling. */
  kind:
    | "manual"
    | "action-opened"
    | "action-done"
    | "action-cancelled"
    | "blocker-opened"
    | "blocker-resolved"
    | "decision-queued"
    | "decision-decided";
  /** Stable id for React keys — synthesized from source record + lifecycle. */
  id: string;
}

/** ISO yyyy-mm-dd comparator (lexicographic == chronological for ISO). */
function compareIsoDesc(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? 1 : -1;
}

/** True if two ISO date strings (YYYY-MM-DD prefix) describe the same day. */
function sameIsoDay(iso: string, d: Date): boolean {
  const y = d.getFullYear().toString().padStart(4, "0");
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return iso.slice(0, 10) === `${y}-${m}-${day}`;
}

function projectDisplayName(
  projects: Project[],
  projectId: string | undefined
): string {
  if (!projectId) return "—";
  const p = projects.find((x) => x.id === projectId);
  return p?.name ?? "—";
}

/**
 * Combine manual log entries with synthesized lifecycle entries derived
 * from actions / blockers / decisions. Newest first.
 *
 * Manual entries pass through unchanged (kind: "manual"). Synthesized
 * entries are NOT persisted back into log[]; they are recomputed every
 * build from the underlying records.
 */
export function deriveActivityLog(content: SiteContent): DerivedLogEntry[] {
  const out: DerivedLogEntry[] = [];

  for (let i = 0; i < content.log.length; i++) {
    const e = content.log[i];
    out.push({
      ...e,
      kind: "manual",
      id: `manual-${i}-${e.date}`,
    });
  }

  for (const a of content.actions) {
    const proj = projectDisplayName(content.projects, a.project);
    out.push({
      date: a.created,
      project: proj,
      note: `Action: ${a.owner} — ${a.body}${a.due ? ` (due ${a.due})` : ""}`,
      kind: "action-opened",
      id: `action-${a.id}-opened`,
    });
    if (a.status === "done" && a.closedAt) {
      out.push({
        date: a.closedAt,
        project: proj,
        note: `Done: ${a.body}`,
        kind: "action-done",
        id: `action-${a.id}-done`,
      });
    }
    if (a.status === "cancelled" && a.closedAt) {
      out.push({
        date: a.closedAt,
        project: proj,
        note: `Cancelled: ${a.body}`,
        kind: "action-cancelled",
        id: `action-${a.id}-cancelled`,
      });
    }
  }

  for (const b of content.blockers) {
    const proj = projectDisplayName(content.projects, b.project);
    out.push({
      date: b.created,
      project: proj,
      note: `Blocker: ${b.body}${b.blockedBy ? ` (${b.blockedBy})` : ""}`,
      kind: "blocker-opened",
      id: `blocker-${b.id}-opened`,
    });
    if (b.resolved) {
      out.push({
        date: b.resolved,
        project: proj,
        note: `Unblocked: ${b.body}`,
        kind: "blocker-resolved",
        id: `blocker-${b.id}-resolved`,
      });
    }
  }

  for (const d of content.decisions) {
    const proj = projectDisplayName(content.projects, d.project);
    out.push({
      date: d.created,
      project: proj,
      note: `For Friday: ${d.question}`,
      kind: "decision-queued",
      id: `decision-${d.id}-queued`,
    });
    if (d.status === "decided" && d.decidedAt && d.outcome) {
      out.push({
        date: d.decidedAt,
        project: proj,
        note: `Decided: ${d.outcome}`,
        kind: "decision-decided",
        id: `decision-${d.id}-decided`,
      });
    }
  }

  return out.sort((a, b) => compareIsoDesc(a.date, b.date));
}

/**
 * Merge the manual session.agenda with queued decisions targeted at the
 * next Friday session. Returns a flat list of agenda strings.
 */
export function deriveAgenda(
  content: SiteContent,
  now: Date = new Date()
): string[] {
  const upcoming = nextSession(now);
  const queued = content.decisions.filter(
    (d) => d.status === "queued" && sameIsoDay(d.forSession, upcoming)
  );
  return [
    ...content.session.agenda,
    ...queued.map((d) => `Decision: ${d.question}`),
  ];
}

/** Staleness thresholds. Adjust here if the cadence changes. */
const STALENESS_RULES: Record<
  ProjectStatus,
  { warn: number; alert: number } | null
> = {
  active:   { warn: 8,  alert: 15 },
  building: { warn: 8,  alert: 15 },
  kickoff:  { warn: 7,  alert: 14 },
  paused:   null,
};

export type StalenessLevel = "muted" | "warn" | "alert" | "paused";

export interface Staleness {
  text: string;
  level: StalenessLevel;
}

function daysSince(iso: string, now: Date): number {
  if (!iso) return 0;
  const then = new Date(`${iso}T12:00:00`);
  const ms = now.getTime() - then.getTime();
  if (ms <= 0) return 0;
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/**
 * Compute the staleness chip text + level for a project's `updated` date.
 * "Paused" projects show a muted "paused" label regardless of date.
 */
export function stalenessLabel(
  updated: string,
  status: ProjectStatus,
  now: Date = new Date()
): Staleness {
  if (status === "paused") {
    return { text: "paused", level: "paused" };
  }
  const rules = STALENESS_RULES[status];
  if (!rules) {
    return { text: "", level: "muted" };
  }
  const d = daysSince(updated, now);
  if (d >= rules.alert) return { text: `STALE ${d}d`, level: "alert" };
  if (d >= rules.warn)  return { text: `STALE ${d}d`, level: "warn" };
  return { text: `${d}d`, level: "muted" };
}
