import type { ActionItem, Blocker, Decision } from "@/content/site";

/**
 * Inbox writeback types — submissions, generated InboxData, and
 * curator-approved structured updates. See:
 * docs/superpowers/specs/2026-05-26-pm-inbox-design.md
 */

export type SubmissionKind = "action" | "blocker" | "decision" | "update";

export interface SubmissionBase {
  kind: SubmissionKind;
  submitter?: { name?: string; email?: string };
  turnstileToken: string;
}

export type Submission =
  | (SubmissionBase & {
      kind: "action";
      project: string;
      owner: string;
      body: string;
      due?: string;
    })
  | (SubmissionBase & {
      kind: "blocker";
      project: string;
      body: string;
      blockedBy?: string;
    })
  | (SubmissionBase & {
      kind: "decision";
      project?: string;
      question: string;
      forSession: string;
    })
  | (SubmissionBase & {
      kind: "update";
      targetId?: string;
      body: string;
    });

/**
 * Field on an existing ActionItem | Blocker | Decision that an approved
 * update may rewrite. Curator picks this in /admin during approval.
 */
export type UpdateField =
  | "status"
  | "resolved"
  | "outcome"
  | "decidedAt"
  | "closedAt";

export interface AppliedUpdate {
  targetId: string;
  field: UpdateField;
  /** Coerced to string in storage. Consumers cast back as needed. */
  value: string;
  /** ISO datetime — when curator approved this update. */
  appliedAt: string;
}

export interface InboxData {
  generatedAt: string;
  actions: ActionItem[];
  blockers: Blocker[];
  decisions: Decision[];
  updates: AppliedUpdate[];
}

export const EMPTY_INBOX: InboxData = {
  generatedAt: new Date(0).toISOString(),
  actions: [],
  blockers: [],
  decisions: [],
  updates: [],
};
