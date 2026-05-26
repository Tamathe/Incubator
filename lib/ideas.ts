export type IdeaStatus = "pending" | "approved" | "rejected";
export type IdeaTheme =
  | "med_ed"
  | "trauma"
  | "population_health"
  | "ed_tech"
  | "k12"
  | "other";
export type IdeaCommitment = "curious" | "exploring" | "committed";

export interface Idea {
  id: string;
  createdAt: string;
  status: IdeaStatus;
  title: string;
  theme: IdeaTheme;
  commitment: IdeaCommitment;
  problem: string;
  affects: string | null;
  buildFirst: string | null;
  lookingFor: string[];
  submitterName: string;
  submitterRole: string | null;
}

// Human-readable theme labels for chips and cluster anchors.
export const THEME_LABELS: Record<IdeaTheme, string> = {
  med_ed: "Med-Ed",
  trauma: "Trauma",
  population_health: "Population Health",
  ed_tech: "Ed-Tech",
  k12: "K–12",
  other: "Other",
};

export const COMMITMENT_LABELS: Record<IdeaCommitment, string> = {
  curious: "Curious",
  exploring: "Exploring",
  committed: "Committed",
};

// Cluster attractor positions, normalized 0–1 over the map canvas.
// Hexagonal arrangement; "other" sits bottom-right as the quieter bucket.
export function themeToCluster(theme: IdeaTheme): { x: number; y: number } {
  const map: Record<IdeaTheme, { x: number; y: number }> = {
    med_ed: { x: 0.25, y: 0.3 },
    trauma: { x: 0.75, y: 0.3 },
    population_health: { x: 0.5, y: 0.25 },
    ed_tech: { x: 0.25, y: 0.7 },
    k12: { x: 0.75, y: 0.7 },
    other: { x: 0.85, y: 0.85 },
  };
  return map[theme];
}

// Visual encoding for commitment level.
export function commitmentToVisual(commitment: IdeaCommitment): {
  radius: number;
  fillOpacity: number;
  halo: boolean;
} {
  switch (commitment) {
    case "curious":
      return { radius: 9, fillOpacity: 0.5, halo: false };
    case "exploring":
      return { radius: 14, fillOpacity: 0.8, halo: false };
    case "committed":
      return { radius: 20, fillOpacity: 1.0, halo: true };
  }
}

// Parse a row from the ideas_public view (snake_case) into the camelCase Idea shape.
export function parseIdeaRow(row: Record<string, unknown>): Idea {
  return {
    id: String(row.id),
    createdAt: String(row.created_at),
    status: row.status as IdeaStatus,
    title: String(row.title),
    theme: row.theme as IdeaTheme,
    commitment: row.commitment as IdeaCommitment,
    problem: String(row.problem),
    affects: row.affects == null ? null : String(row.affects),
    buildFirst: row.build_first == null ? null : String(row.build_first),
    lookingFor: Array.isArray(row.looking_for) ? (row.looking_for as string[]) : [],
    submitterName: String(row.submitter_name),
    submitterRole: row.submitter_role == null ? null : String(row.submitter_role),
  };
}

// UK email check used by the intake form.
export function isUkEmail(value: string): boolean {
  return /^[^\s@]+@uky\.edu$/i.test(value.trim());
}
