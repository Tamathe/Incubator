/**
 * AI Incubator @ UK - canonical content source.
 *
 * Edit ONLY this file to update what shows on the site. Layout, styles,
 * and components do not need to change to add a project, log an update,
 * or change the agenda.
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
  /** Public-facing ways students can contribute or learn through the project. */
  studentFit?: string[];
  /** Only for status: kickoff - replaces anchors. */
  open?: string;
  /** ISO date */
  updated: string;
}

export interface Session {
  /** 0 = Sunday ... 5 = Friday */
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
  /** ISO date - required when status !== "open" */
  closedAt?: string;
}

export interface Blocker {
  id: string;
  /** project id */
  project: string;
  body: string;
  /**
   * What's needed to unstick - process, document, approval, or capability.
   * NEVER name an individual. Use roles, departments, processes, artifacts.
   * Examples: "DSA legal review", "IRB approval", "Baseline communication rubric"
   */
  waitingOn?: string;
  /** ISO date */
  created: string;
  /** ISO date when no longer blocking */
  resolved?: string;
}

export type DecisionStatus = "queued" | "decided" | "cancelled";

export interface Decision {
  id: string;
  /** optional - cross-cutting decisions have no project */
  project?: string;
  question: string;
  /** ISO date - when the decision was queued */
  created: string;
  /** ISO date of the target Friday session */
  forSession: string;
  status: DecisionStatus;
  /** populated when status === "decided" */
  outcome?: string;
  /** ISO date */
  decidedAt?: string;
}

export type OutcomeKind = "grant" | "paper" | "product" | "student" | "media" | "talk";

export interface Outcome {
  id: string;
  kind: OutcomeKind;
  /** Optional - links to a project in projects[] */
  project?: string;
  title: string;
  /** Free-text. Grants: "$475K". Students: "8 trained". Papers: leave blank. */
  value?: string;
  /** ISO date */
  date: string;
  /** Optional public link */
  link?: string;
  /** Optional one-sentence context */
  note?: string;
}

export interface Partner {
  id: string;
  /** Public name */
  name: string;
  /** "Funder", "Data partner", "Clinical partner", "Home institution" */
  role: string;
  /** Optional - for project-specific partnerships */
  project?: string;
  /** Public-facing one-sentence relationship summary */
  note?: string;
  /** Optional path under public/ for logo image */
  logo?: string;
}

export type ArtifactKind = "live-demo" | "prototype" | "repo" | "paper" | "deck";

export interface Artifact {
  id: string;
  /** project id from projects[] */
  project: string;
  name: string;
  /** Public URL - required */
  url: string;
  kind: ArtifactKind;
  /** Optional path under public/ for a thumbnail */
  thumb?: string;
  /** Short one-liner shown under the card title */
  note?: string;
}

export interface StudentWork {
  id: string;
  title: string;
  person: string;
  format: string;
  summary: string;
  image: string;
  imageAlt: string;
  videoUrl?: string;
  videoLabel?: string;
}

export type SessionKind =
  | "pitch"
  | "demo"
  | "presentation"
  | "roundtable"
  | "cancelled";

export interface MeetingSession {
  /** ISO Friday date, e.g. "2026-05-29". */
  date: string;
  kind: SessionKind;
  /** Short headline. */
  title: string;
  /** 1-2 sentence summary. */
  blurb?: string;
  /** Freeform presenters line, e.g. "Bernard / Bailey". */
  presenters?: string;
  /** Optional link to projects[] by id. */
  projectId?: string;
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
  outcomes: Outcome[];
  partners: Partner[];
  artifacts: Artifact[];
  studentWork: StudentWork[];
  meetings: MeetingSession[];
}

export const content: SiteContent = {
  lastUpdated: "2026-07-15",
  cohort: "Cohort 03 - Summer 2026",
  session: {
    dayOfWeek: 5,
    hour: 12,
    minute: 0,
    venue: "Microsoft Teams",
    teamsUrl: "https://teams.microsoft.com/l/meetup-join/19%3ameeting_MzZhMTNiNjYtODcwNy00MjBhLTg3MmQtNmZhNDU4MGVlMjM1%40thread.v2/0?context=%7b%22Tid%22%3a%222b30530b-69b6-4457-b818-481cb53d42ae%22%2c%22Oid%22%3a%22e5e67874-0b35-4528-b862-6b2d1a6b1fc2%22%7d",
    agenda: [
      "KY-AHEAD - planning a human-reviewed cancer-screening workflow",
      "Rural diabetic retinopathy - planning a proposed AI-supported eye-screening pilot",
      "Whole-blood drone delivery - planning the first nonclinical feasibility study",
    ],
  },
  projects: [
    {
      id: "ky-ahead",
      name: "KY-AHEAD",
      tagline: "Human-reviewed cancer-screening support",
      status: "active",
      stage: "Planning a cancer-screening workflow",
      area: "Population Health / Oncology",
      leads: "Emergency Medicine / Markey / state data collaborators",
      summary:
        "KY-AHEAD is designing a human-reviewed workflow to help care teams find people who may be due for colorectal, cervical, or lung cancer screening. Testing uses synthetic data while the team works through the required approvals.",
      anchors: [
        "Many screenings are missed because the right patient is hard to find at the right time",
        "AI-assisted review could help surface people who may be due",
        "Clinical scope, outreach, and follow-through remain human-owned",
        "Software testing stays synthetic until approvals permit otherwise",
      ],
      studentFit: [
        "Workflow and literature mapping",
        "Outreach language review",
        "Evaluation support",
      ],
      updated: "2026-07-04",
    },
    {
      id: "dr-retinopathy-rural-ky",
      name: "Rural Diabetic Retinopathy Screening",
      tagline: "A proposed rural eye-screening pilot",
      status: "active",
      stage: "Planning a rural screening pilot",
      area: "Rural Health / Ophthalmology",
      leads: "Ophthalmology / Telehealth / rural health planning",
      summary:
        "The team is planning a rural pilot that would pair UK's human-read tele-ophthalmology network with AI-supported screening. The pilot would also address referrals and follow-up care.",
      anchors: [
        "Builds on UK's existing human-read tele-ophthalmology network",
        "The proposed pilot would test whether AI-supported screening can help find disease earlier",
        "Clinicians remain responsible for care decisions",
        "Referral, navigation, and follow-up are part of the pilot design",
      ],
      studentFit: [
        "Referral-workflow mapping",
        "Pilot dashboard sketches",
        "Rural health literature scan",
      ],
      updated: "2026-07-01",
    },
    {
      id: "whole-blood-drone",
      name: "Whole-Blood Drone Delivery",
      tagline: "Cold-chain transport research for rural trauma care",
      status: "building",
      stage: "Planning the first nonclinical study",
      area: "Trauma / Aerospace",
      leads: "Trauma Surgery / Aerospace Engineering / Emergency Medicine",
      summary:
        "Researchers are planning a controlled, nonclinical study of whether whole blood stays within temperature and handling limits during drone flight. The first phase focuses on the protocol and test materials.",
      anchors: [
        "Begins with controlled, nonclinical feasibility work",
        "Focuses on temperature control and product integrity during flight",
        "Clinical delivery and rural field simulations are outside Phase 1",
        "Combines trauma, blood-bank, emergency medicine, aerospace, and student expertise",
      ],
      studentFit: [
        "Cold-chain protocol review",
        "Flight-test documentation",
        "Poster and pilot materials",
      ],
      updated: "2026-06-23",
    },
    {
      id: "virtual-clinic",
      name: "Virtual Clinic",
      tagline: "AI communication and reasoning practice",
      status: "building",
      stage: "Developing research prototypes",
      area: "Med-Ed / Simulation",
      leads: "Curriculum / Clinical Skills / AI education",
      summary:
        "Faculty-authored simulated patients would let learners practice clinical conversations, handoffs, and reasoning. The prototypes support formative practice, not autonomous grading.",
      anchors: [
        "Designed to let students practice before seeing real patients",
        "Cases and rubrics would be written and reviewed by faculty",
        "AI-assisted simulated patients and handoffs are under study",
        "The work is intended for formative practice, not autonomous grading",
      ],
      studentFit: [
        "Case-script testing",
        "Rubric and feedback review",
        "Learner experience notes",
      ],
      updated: "2026-06-15",
    },
    {
      id: "markey-hpv-pap",
      name: "HPV/Pap Patient Education",
      tagline: "Plain-language follow-up support",
      status: "building",
      stage: "Drafting a patient-education prototype",
      area: "Oncology / Patient Education",
      leads: "Markey / Community health / Internal Medicine",
      summary:
        "A patient-education prototype would explain abnormal HPV and Pap results, likely follow-up, and questions to ask a care team. English and Spanish content would require clinical review.",
      anchors: [
        "Abnormal HPV/Pap results can be stressful and confusing",
        "The design would offer plain-language guidance on follow-up questions",
        "English and Spanish support are part of the proposed work",
        "Clinical review would be required before any patient use",
      ],
      studentFit: [
        "Plain-language copy review",
        "English/Spanish content QA",
        "Usability-test notes",
      ],
      updated: "2026-05-26",
    },
    {
      id: "hrsa-rural-learning",
      name: "AI-Guided Rural Health Learning Collaborative",
      tagline: "Practice and support for rural care teams",
      status: "building",
      stage: "Developing a grant proposal",
      area: "Rural Health / Workforce",
      leads: "College of Nursing / College of Medicine / UK HealthCare",
      summary:
        "A proposed collaborative would connect rural care teams for case consultation, tele-mentoring, and AI-supported simulation. Clinicians would keep all clinical decisions.",
      anchors: [
        "Rural clinicians often manage complex needs with fewer local supports",
        "The proposed simulation would let teams practice difficult cases",
        "Tele-mentoring would connect teams across distance",
        "Clinicians would retain all clinical decision-making",
      ],
      studentFit: [
        "Learning-session design",
        "Rural workforce literature scan",
        "Simulation scenario review",
      ],
      updated: "2026-06-30",
    },
    {
      id: "ai-clinical-reasoning",
      name: "AI Assessment & Clinical Reasoning Research",
      tagline: "Human oversight for AI-assisted assessment",
      status: "active",
      stage: "Studying how clinicians use AI",
      area: "Med-Ed / Clinical Reasoning",
      leads: "Emergency Medicine / medical education collaborators",
      summary:
        "Researchers are studying how clinicians and learners use generative AI under uncertainty. Surveys, interviews, and simulations focus on reasoning and formative feedback; faculty review all formative assessments.",
      anchors: [
        "Asks where AI helps and where it can mislead",
        "Faculty review all formative assessments",
        "Uses surveys, interviews, and simulation research",
        "No autonomous grading is used",
      ],
      studentFit: [
        "Survey and interview synthesis",
        "Assessment-policy scan",
        "Manuscript support",
      ],
      updated: "2026-06-17",
    },
    {
      id: "hep-c-smart-bottles",
      name: "Hep C Smart Pill Bottle Pilot",
      tagline: "A proposed smart-pill-bottle pilot",
      status: "building",
      stage: "Proposed pilot under review",
      area: "Infectious Disease / Medication Adherence",
      leads: "UK HealthCare / device partner",
      summary:
        "A proposed pilot would test whether smart pill-bottle signals help care teams notice adherence problems sooner. The team would study privacy, clinical workflow, and whether the signals are useful.",
      anchors: [
        "Treatment only works when follow-up stays on track",
        "Smart bottles may flag adherence barriers earlier",
        "Care teams would review adherence signals and decide how to respond",
        "The proposed work would examine privacy, clinical workflow, and signal usefulness",
      ],
      studentFit: [
        "Adherence-workflow mapping",
        "Pilot materials QA",
        "Patient-facing language review",
      ],
      updated: "2026-06-30",
    },
  ],
  log: [
    {
      date: "2026-07-04",
      project: "KY-AHEAD",
      note: "KY-AHEAD is planning a human-reviewed workflow for colorectal, cervical, and lung cancer screening.",
    },
    {
      date: "2026-07-01",
      project: "Rural diabetic retinopathy",
      note: "The team is planning rural retinal imaging, AI-assisted triage, specialist review, and follow-up navigation.",
    },
    {
      date: "2026-06-30",
      project: "AI-guided rural health learning collaborative",
      note: "The grant proposal includes tele-mentoring, case consultation, and AI-supported simulation for rural clinicians.",
    },
    {
      date: "2026-06-23",
      project: "Whole-blood drone delivery",
      note: "The team is writing the first protocol for testing whole-blood temperature and condition during drone flight.",
    },
    {
      date: "2026-06-17",
      project: "AI assessment and clinical reasoning",
      note: "Researchers are studying how generative AI use relates to clinical reasoning, feedback, and formative assessment.",
    },
    {
      date: "2026-05-26",
      project: "HPV/Pap patient education",
      note: "The team is considering a prototype for explaining abnormal HPV and Pap results and common follow-up steps in plain language.",
    },
  ],
  leads: [
    {
      initials: "AI",
      name: "AI Incubator",
      role: "Helps teams plan and test prototypes",
      areas: ["Med-Ed", "Population Health", "Workflow Support"],
    },
    {
      initials: "PH",
      name: "Population Health Collaborators",
      role: "Cancer screening, registry, outreach, and navigation",
      areas: ["Population Health", "Oncology", "Data"],
    },
    {
      initials: "RH",
      name: "Rural Health Collaborators",
      role: "Rural screening, telehealth, and workforce development",
      areas: ["Rural Health", "Workforce", "Telehealth"],
    },
    {
      initials: "TR",
      name: "Trauma & Aerospace Team",
      role: "Rural logistics and emergency care research",
      areas: ["Trauma", "Aerospace", "Logistics"],
    },
    {
      initials: "ME",
      name: "Medical Education Collaborators",
      role: "Simulation, communication, and assessment research",
      areas: ["Med-Ed", "Simulation", "Clinical Reasoning"],
    },
  ],
  actions: [],
  blockers: [],
  decisions: [],
  outcomes: [],
  partners: [
    {
      id: "chfs",
      name: "Kentucky Cabinet for Health & Family Services",
      role: "State project counterpart",
      project: "ky-ahead",
      note: "Pre-launch alignment around the proposed State University Partnership work.",
    },
    {
      id: "kcr",
      name: "Kentucky Cancer Registry",
      role: "Planned data collaborator",
      project: "ky-ahead",
      note: "Cancer-registry and data-linkage planning remain subject to the required approvals.",
    },
    {
      id: "markey",
      name: "Markey Cancer Center",
      role: "Clinical and research partner",
      note: "Cancer screening, patient education, and population-health collaborations.",
    },
    {
      id: "microsoft",
      name: "Microsoft",
      role: "Strategic connection",
      project: "dr-retinopathy-rural-ky",
      note: "Strategic conversations about possible platform, expertise, and connection support; no scoped deliverable is confirmed.",
    },
    {
      id: "cerh",
      name: "UK Center of Excellence in Rural Health",
      role: "Possible partner in a later phase",
      project: "whole-blood-drone",
      note: "Intended partner for a possible later Appalachian field simulation, beyond the current Phase 1 design work.",
    },
    {
      id: "ukcom",
      name: "UK College of Medicine",
      role: "Home institution",
      note: "Home for the AI Incubator community and several health AI collaborations.",
    },
    {
      id: "ukcon",
      name: "UK College of Nursing",
      role: "Learning collaborative partner",
      project: "hrsa-rural-learning",
      note: "Partner in the AI-guided rural health learning collaborative proposal.",
    },
  ],
  artifacts: [],
  studentWork: [
    {
      id: "philanthropy-outreach-site",
      title: "Philanthropy outreach site",
      person: "Chaelyn McGuire",
      format: "Student build",
      summary:
        "Chaelyn built a working site to help her sorority organize outreach and raise money for survivors of domestic abuse.",
      image: "/media/studio-reel/03-chaelyn.jpg",
      imageAlt:
        "Students discussing a philanthropy website around a table with their laptops",
      videoUrl:
        "https://play.vidyard.com/KJM4GjGYMsrekARSQb18wP?autoplay=1&second=124",
      videoLabel: "Watch the philanthropy story",
    },
    {
      id: "socratic-tutor",
      title: "Socratic Tutor",
      person: "Hunter Colson, Matthew Bernard, and Alex Dripchak",
      format: "Prototype",
      summary:
        "Hunter, Matthew, and Alex built a tutor that answers with questions and asks students to explain their reasoning.",
      image: "/media/studio-reel/05-hunter.jpg",
      imageAlt: "Hunter Colson discussing the Socratic Tutor prototype",
      videoUrl:
        "https://play.vidyard.com/KJM4GjGYMsrekARSQb18wP?autoplay=1&second=94",
      videoLabel: "Watch the Socratic Tutor story",
    },
    {
      id: "vibe-coding-workshop",
      title: "Vibe coding workshop",
      person: "Alex Dripchak",
      format: "Learning session",
      summary:
        "Alex led a hands-on session where participants built a small app with AI-assisted coding tools.",
      image: "/media/student-work/alex-vibe-coding.jpg",
      imageAlt: "Vibe coding workshop presentation with Alex Dripchak",
      videoUrl: "https://youtu.be/ni40Z1JOAXQ",
      videoLabel: "Watch the full workshop",
    },
  ],
  meetings: [
    {
      date: "2026-07-10",
      kind: "roundtable",
      title: "Featured-build portfolio check-in",
      blurb:
        "KY-AHEAD, rural diabetic retinopathy screening, and whole-blood drone delivery as the public story for the site.",
    },
    {
      date: "2026-07-17",
      kind: "roundtable",
      title: "Review the other projects",
      blurb:
        "Review which project-board entries are ready to share publicly, including results and partner updates.",
    },
  ],
};
