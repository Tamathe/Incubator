/**
 * ─────────────────────────────────────────────────────────────────────
 * AI Incubator @ UK — canonical content source.
 *
 * Edit ONLY this file to update what shows on the site. Layout, styles,
 * and components do not need to change to add a project, log an update,
 * or change the agenda.
 *
 * Schema:
 *   session     The Friday meeting block. Used by the Right Now bar.
 *   projects[]  Cards rendered across the site. status: active | building | kickoff | paused
 *   log[]       Activity feed (newest first). Surfaces in the Right Now bar.
 *   leads[]     Faculty / project leads listed in the People section.
 *   actions[]   Open / closed action items per project.
 *   blockers[]  Active / resolved blockers per project.
 *   decisions[] Queued / decided decisions per session.
 * ─────────────────────────────────────────────────────────────────────
 */

export type ProjectStatus = "active" | "building" | "kickoff" | "paused";

export interface Project {
  id: string;
  name: string;
  tagline?: string;
  status: ProjectStatus;
  stage: string;
  area: string;
  leads: string;
  summary: string;
  anchors?: string[];
  /** Only for status: kickoff — replaces anchors. */
  open?: string;
  /** ISO date */
  updated: string;
}

export interface Session {
  /** 0 = Sunday … 5 = Friday */
  dayOfWeek: number;
  /** 24-hour, local time */
  hour: number;
  minute: number;
  venue: string;
  teamsUrl: string;
  agenda: string[];
}

export interface LogEntry {
  /** ISO date */
  date: string;
  project: string;
  note: string;
}

export interface Lead {
  initials: string;
  name: string;
  role: string;
  areas: string[];
}

export type ActionStatus = "open" | "done" | "cancelled";

export interface ActionItem {
  /** stable slug */
  id: string;
  /** project id from projects[] */
  project: string;
  /** initials (matches Lead.initials) or freeform */
  owner: string;
  body: string;
  /** ISO date */
  created: string;
  /** ISO date */
  due?: string;
  status: ActionStatus;
  /** ISO date — required when status !== "open" */
  closedAt?: string;
}

export interface Blocker {
  id: string;
  /** project id */
  project: string;
  body: string;
  /** free text — e.g. "Bin Huang" */
  blockedBy?: string;
  /** ISO date */
  created: string;
  /** ISO date when no longer blocking */
  resolved?: string;
}

export type DecisionStatus = "queued" | "decided" | "cancelled";

export interface Decision {
  id: string;
  /** optional — cross-cutting decisions have no project */
  project?: string;
  question: string;
  /** ISO date — when the decision was queued */
  created: string;
  /** ISO date of the target Friday session */
  forSession: string;
  status: DecisionStatus;
  /** populated when status === "decided" */
  outcome?: string;
  /** ISO date */
  decidedAt?: string;
}

export interface SiteContent {
  /** ISO date */
  lastUpdated: string;
  cohort: string;
  session: Session;
  projects: Project[];
  log: LogEntry[];
  leads: Lead[];
  actions: ActionItem[];
  blockers: Blocker[];
  decisions: Decision[];
}

export const content: SiteContent = {
  lastUpdated: "2026-05-25",
  cohort: "Cohort 03 · Spring 2026",
  session: {
    dayOfWeek: 5,
    hour: 12,
    minute: 0,
    venue: "Microsoft Teams",
    teamsUrl: "#teams-link",
    agenda: [
      "DROME — Bernard & Bailey on initial scope",
      "KY-AHEAD — KCR data-linkage status",
      "Open pitches (~15 min)",
    ],
  },
  projects: [
    {
      id: "socratic-tutor",
      name: "Socratic Tutor",
      status: "active",
      stage: "Pilot",
      area: "Med-Ed",
      leads: "Bernard · Colson · Thé",
      summary:
        "AI tutor trained on the UKCOM Foundations curriculum. Generates USMLE-style cases and tracks where students get stuck.",
      anchors: [
        "300+ tutor sessions logged",
        "v1.4 reasoning-trace pass",
        "Pilot inside UKCOM Foundations",
      ],
      updated: "2026-05-10",
    },
    {
      id: "ahead",
      name: "KY-AHEAD",
      tagline: "AI for Health Engagement And Detection",
      status: "active",
      stage: "Phase 1 — data linkage",
      area: "Population Health",
      leads: "Thé · Huang (KCR)",
      summary:
        "Identifies Medicaid patients overdue for colorectal, cervical, and lung cancer screening, then uses AI-assisted outreach to bring them in for care.",
      anchors: [
        "$475K SUP grant · KY Cabinet for Health & Family Services",
        "CHFS kickoff Apr 13 · KCR/Markey kickoff May 15",
        "Patient identification in motion",
        "DSA paperwork in parallel with protocol",
      ],
      updated: "2026-05-15",
    },
    {
      id: "ncipp",
      name: "NCIPP",
      tagline: "Inclusive PD Platform Prototype",
      status: "building",
      stage: "Phase 2 shipped",
      area: "Ed-Tech",
      leads: "Thé",
      summary:
        "Prototype of a professional-development platform for K–2 teachers. Role-specific views for Teacher, Coach, Admin, and Family.",
      anchors: [
        "15 screens across 4 roles",
        "React + Babel-standalone · no build step",
        "Render blueprint configured",
        "Live → ncipp-prototype.onrender.com",
      ],
      updated: "2026-05-02",
    },
    {
      id: "drome",
      name: "DROME",
      tagline: "Whole Blood Drone Delivery in Rural Kentucky",
      status: "kickoff",
      stage: "Just kicked off",
      area: "Trauma · Aerospace",
      leads: "Bernard · Bailey",
      summary:
        "Drone-based delivery of whole blood for rural and emergency trauma care.",
      open:
        "Looking for collaborators in EMS workflow, logistics, and the FAA path.",
      updated: "2026-05-20",
    },
    {
      id: "virtual-clinic",
      name: "Virtual Clinic",
      tagline: "AI Communication Tools for Health Professions Students",
      status: "kickoff",
      stage: "Just kicked off",
      area: "Med-Ed",
      leads: "Hall · Ayers",
      summary:
        "AI-simulated patients for communication-skills training in health-professions education.",
      open:
        "Looking for collaborators with prompt-engineering, OSCE rubric design, or simulation-center experience.",
      updated: "2026-05-18",
    },
    {
      id: "markey-hpv",
      name: "Markey · Patient Ed",
      tagline: "HPV / Pap result explanation",
      status: "kickoff",
      stage: "Just kicked off",
      area: "Oncology · Patient Ed",
      leads: "Hull · Canedo",
      summary:
        "AI chatbot that explains abnormal HPV and Pap results to patients, to support timely follow-up such as colposcopy.",
      open:
        "Looking for collaborators in patient comms, multilingual content review, and EHR integration.",
      updated: "2026-05-22",
    },
  ],
  log: [
    { date: "2026-05-22", project: "Markey · HPV/Pap", note: "Kickoff — Pam Hull & Jose Canedo committed" },
    { date: "2026-05-20", project: "DROME",            note: "Andrew Bernard & Sean Bailey aligned on co-lead structure" },
    { date: "2026-05-18", project: "Virtual Clinic",   note: "Alan Hall & Clint Ayers signed on" },
    { date: "2026-05-15", project: "KY-AHEAD",         note: "KCR/Markey kickoff — DSA path opened with Bin Huang" },
    { date: "2026-05-10", project: "Socratic Tutor",   note: "v1.4 reasoning-trace pass — 300+ sessions logged" },
    { date: "2026-05-02", project: "NCIPP",            note: "Phase 2 shipped — 15 screens, 4 roles, live on Render" },
    { date: "2026-04-13", project: "KY-AHEAD",         note: "CHFS kickoff — $475K SUP grant signed" },
  ],
  leads: [
    { initials: "TT", name: "Tama Thé, MD",       role: "Founder · Emergency Medicine",                areas: ["Med-Ed", "Population Health"] },
    { initials: "AB", name: "Andrew Bernard, MD", role: "Chief of Trauma Surgery",                     areas: ["Trauma", "Med-Ed"] },
    { initials: "PH", name: "Pamela Hull, PhD",   role: "Associate Director · Markey / Chandler",      areas: ["Oncology", "Patient Ed"] },
    { initials: "AH", name: "Alan Hall, MD",      role: "Assistant Dean · Curriculum Integration",     areas: ["Med-Ed", "Sim"] },
    { initials: "SB", name: "Sean Bailey, PhD",   role: "Aerospace Engineering",                       areas: ["Aerospace", "Logistics"] },
    { initials: "BH", name: "Bin Huang, PhD",     role: "Kentucky Cancer Registry · Data linkage POC", areas: ["Data", "Oncology"] },
  ],
  actions: [
    {
      id: "ahead-dsa-draft",
      project: "ahead",
      owner: "TT",
      body: "Send DSA draft to Bin Huang",
      created: "2026-05-23",
      due: "2026-05-29",
      status: "open",
    },
    {
      id: "ahead-irb-path",
      project: "ahead",
      owner: "TT",
      body: "Confirm IRB protocol path with Markey",
      created: "2026-05-20",
      status: "open",
    },
    {
      id: "drome-faa-call",
      project: "drome",
      owner: "SB",
      body: "Schedule FAA exploratory call",
      created: "2026-05-22",
      due: "2026-06-02",
      status: "open",
    },
    {
      id: "drome-ems-intro",
      project: "drome",
      owner: "AB",
      body: "Intro Bernard ↔ regional EMS director",
      created: "2026-05-24",
      status: "open",
    },
    {
      id: "tutor-v14-analytics",
      project: "socratic-tutor",
      owner: "TT",
      body: "Pull v1.4 stuck-step heatmap",
      created: "2026-05-18",
      due: "2026-05-30",
      status: "open",
    },
    {
      id: "markey-hpv-draft",
      project: "markey-hpv",
      owner: "PH",
      body: "First content draft for Canedo review",
      created: "2026-05-24",
      due: "2026-06-05",
      status: "open",
    },
    {
      id: "vc-rubric-intake",
      project: "virtual-clinic",
      owner: "AH",
      body: "Collect existing OSCE rubrics from Sim center",
      created: "2026-05-19",
      status: "open",
    },
    {
      id: "ncipp-render-handoff",
      project: "ncipp",
      owner: "TT",
      body: "Write Render deploy runbook",
      created: "2026-05-12",
      status: "done",
      closedAt: "2026-05-22",
    },
  ],
  blockers: [
    {
      id: "ahead-dsa-review",
      project: "ahead",
      body: "DSA stuck in KCR legal review",
      blockedBy: "KCR legal",
      created: "2026-05-16",
    },
    {
      id: "vc-rubric-template",
      project: "virtual-clinic",
      body: "Need a baseline communication rubric to anchor scenarios",
      blockedBy: "Sim center",
      created: "2026-05-19",
    },
  ],
  decisions: [
    {
      id: "ahead-ems-scope",
      project: "ahead",
      question: "Scope colorectal-only for Phase 1 or include cervical now?",
      created: "2026-05-22",
      forSession: "2026-05-29",
      status: "queued",
    },
    {
      id: "publish-cohort-retro",
      question: "Publish spring cohort retro before or after IRB submission?",
      created: "2026-05-24",
      forSession: "2026-05-29",
      status: "queued",
    },
    {
      id: "ncipp-phase3-go",
      project: "ncipp",
      question: "Move NCIPP to Phase 3 (Family role expansion) now or hold?",
      created: "2026-05-08",
      forSession: "2026-05-15",
      status: "decided",
      outcome: "Hold Phase 3 — focus on cohort schools first",
      decidedAt: "2026-05-15",
    },
  ],
};
