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
  meetings: MeetingSession[];
}

export const content: SiteContent = {
  lastUpdated: "2026-07-13",
  cohort: "Cohort 03 - Summer 2026",
  session: {
    dayOfWeek: 5,
    hour: 12,
    minute: 0,
    venue: "Microsoft Teams",
    teamsUrl: "https://teams.microsoft.com/l/meetup-join/19%3ameeting_MzZhMTNiNjYtODcwNy00MjBhLTg3MmQtNmZhNDU4MGVlMjM1%40thread.v2/0?context=%7b%22Tid%22%3a%222b30530b-69b6-4457-b818-481cb53d42ae%22%2c%22Oid%22%3a%22e5e67874-0b35-4528-b862-6b2d1a6b1fc2%22%7d",
    agenda: [
      "KY-AHEAD - finding people due for cancer screening",
      "Rural diabetic retinopathy - catching preventable vision loss earlier",
      "Whole-blood drone delivery - testing blood transport for rural trauma care",
    ],
  },
  projects: [
    {
      id: "ky-ahead",
      name: "KY-AHEAD",
      tagline: "AI-assisted cancer screening outreach",
      status: "active",
      stage: "Finding overdue patients",
      area: "Population Health / Oncology",
      leads: "Emergency Medicine / Markey / state data collaborators",
      summary:
        "KY-AHEAD uses data and AI-assisted review to identify Kentuckians who may be due for colorectal, cervical, or lung cancer screening. Care teams handle outreach, navigation, and scheduling.",
      anchors: [
        "Many screenings are missed because the right patient is hard to find at the right time",
        "AI helps surface people who may be overdue for screening",
        "Outreach and scheduling support stay human-reviewed",
        "Focused on colorectal, cervical, and lung cancer screening",
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
      tagline: "Finding preventable vision loss earlier",
      status: "active",
      stage: "Screening closer to home",
      area: "Rural Health / Ophthalmology",
      leads: "Ophthalmology / Telehealth / Microsoft collaborators",
      summary:
        "Diabetic retinopathy is a leading cause of blindness among working-age adults. Early detection and treatment can prevent most diabetes-related vision loss. The project is testing retinal cameras, AI-assisted triage, specialist review, and patient navigation in rural Kentucky.",
      anchors: [
        "Kentucky has hundreds of thousands of adults living with diabetes",
        "Many patients never get the yearly eye exam that could catch disease early",
        "AI can flag images for review while clinicians make care decisions",
        "Screening includes a plan for follow-up care",
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
      stage: "Testing rural trauma logistics",
      area: "Trauma / Aerospace",
      leads: "Trauma Surgery / Aerospace Engineering / Emergency Medicine",
      summary:
        "In rural trauma care, access to blood can be limited by distance and time. This pre-clinical project tests whether drones can carry whole-blood units while preserving temperature and lab integrity before any clinical use.",
      anchors: [
        "Designed for rural places where distance slows access to blood",
        "Tests temperature control before any patient-facing use",
        "Initial testing focuses on temperature, packaging, and drop conditions",
        "Pairs trauma, emergency medicine, and aerospace expertise",
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
      stage: "Practicing hard conversations safely",
      area: "Med-Ed / Simulation",
      leads: "Curriculum / Clinical Skills / AI education",
      summary:
        "Virtual Clinic lets learners practice clinical conversations, handoffs, and reasoning with AI-assisted simulated patients. Faculty write the cases and review performance against explicit rubrics.",
      anchors: [
        "Students can practice before seeing real patients",
        "Faculty write and review every case",
        "AI supports simulated patients and handoffs",
        "Faculty use explicit rubrics to review learner performance",
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
      stage: "Explaining results in plain language",
      area: "Oncology / Patient Education",
      leads: "Markey / Community health / Internal Medicine",
      summary:
        "This prototype helps patients understand abnormal HPV and Pap results in plain language, including what follow-up may look like and what questions to bring back to their care team.",
      anchors: [
        "Abnormal HPV/Pap results can be stressful and confusing",
        "Patients receive plain-language guidance on follow-up questions",
        "English and Spanish support are part of the build",
        "Clinicians review all content before patient use",
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
      status: "active",
      stage: "Training rural health teams",
      area: "Rural Health / Workforce",
      leads: "College of Nursing / College of Medicine / UK HealthCare",
      summary:
        "Rural and underserved healthcare teams meet for tele-mentoring, case consultation, and AI-supported simulation. Clinicians practice difficult scenarios with faculty and peer feedback.",
      anchors: [
        "Rural clinicians often manage complex needs with fewer local supports",
        "Simulation lets teams practice difficult cases",
        "Tele-mentoring connects teams across distance",
        "Clinicians retain all clinical decision-making",
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
        "Researchers are studying how clinicians and learners use generative AI under uncertainty. Surveys, interviews, and simulations examine its effects on reasoning, feedback, and formative assessment.",
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
      tagline: "Medication-adherence workflow support",
      status: "building",
      stage: "Supporting medication follow-through",
      area: "Infectious Disease / Medication Adherence",
      leads: "UK HealthCare / device partner",
      summary:
        "This pilot tests whether smart pill bottles and AI/device-supported signals help care teams identify adherence barriers earlier during Hepatitis C treatment.",
      anchors: [
        "Treatment only works when follow-up stays on track",
        "Smart bottles may flag adherence barriers earlier",
        "Care teams review adherence signals and decide how to respond",
        "The pilot evaluates privacy, clinical workflow, and signal usefulness",
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
      note: "KY-AHEAD is developing AI-assisted, human-reviewed outreach for colorectal, cervical, and lung cancer screening.",
    },
    {
      date: "2026-07-01",
      project: "Rural diabetic retinopathy",
      note: "The team is planning rural retinal imaging, AI-assisted triage, specialist review, and follow-up navigation.",
    },
    {
      date: "2026-06-30",
      project: "AI-guided rural health learning collaborative",
      note: "The learning collaborative is developing tele-mentoring, case consultation, and AI-supported simulation for rural clinicians.",
    },
    {
      date: "2026-06-23",
      project: "Whole-blood drone delivery",
      note: "The team is testing temperature, packaging, and lab integrity during drone transport of whole blood.",
    },
    {
      date: "2026-06-17",
      project: "AI assessment and clinical reasoning",
      note: "Researchers are studying how generative AI affects clinical reasoning, feedback, and formative assessment.",
    },
    {
      date: "2026-05-26",
      project: "HPV/Pap patient education",
      note: "The prototype explains abnormal HPV and Pap results and common follow-up steps in plain language.",
    },
  ],
  leads: [
    {
      initials: "AI",
      name: "AI Incubator",
      role: "Project studio and prototype support",
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
  outcomes: [
    {
      id: "ky-ahead-sup-grant-2026",
      kind: "grant",
      project: "ky-ahead",
      title: "KY-AHEAD State University Partnership launch",
      value: "$475K",
      date: "2026-04-13",
      note: "Supports work to find Kentuckians who may be due for cancer screening and connect them with outreach and navigation.",
    },
  ],
  partners: [
    {
      id: "chfs",
      name: "Kentucky Cabinet for Health & Family Services",
      role: "Funder",
      project: "ky-ahead",
      note: "State University Partnership support for KY-AHEAD.",
    },
    {
      id: "kcr",
      name: "Kentucky Cancer Registry",
      role: "Data partner",
      project: "ky-ahead",
      note: "Cancer registry and data-linkage collaboration.",
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
      role: "Technology collaborator",
      project: "dr-retinopathy-rural-ky",
      note: "Rural health and ophthalmology screening strategy collaboration.",
    },
    {
      id: "cerh",
      name: "UK Center of Excellence in Rural Health",
      role: "Rural health partner",
      project: "whole-blood-drone",
      note: "Rural logistics and drone-delivery context for the whole-blood pilot.",
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
      title: "Broader portfolio review",
      blurb:
        "Review which project-board entries are ready for public artifacts, outcomes, or partner updates.",
    },
  ],
};
