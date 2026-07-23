"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { FridaySlot } from "@/lib/friday-booking";
import FridayCalendarPicker from "./FridayCalendarPicker";
import styles from "./PitchForm.module.css";

const ROLES = [
  "Undergraduate student",
  "Graduate student",
  "Faculty",
  "Staff",
  "Researcher",
  "Community partner",
  "Campus leader",
];

type PitchBody = {
  submitterName: string;
  submitterEmail: string;
  role?: string;
  problem: string;
  affected: string;
  firstBuild: string;
  preferredFriday?: string;
  alternateFriday?: string;
  website: string;
};

type FormState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "done"; heldLabel?: string }
  | { kind: "error"; message: string; mailtoHref?: string };

function buildPitchEmail(body: PitchBody) {
  const subject = `AI Incubator Friday proposal: ${body.problem.slice(0, 72)}`;
  const message = [
    `Name: ${body.submitterName}`,
    `Email: ${body.submitterEmail}`,
    `Role: ${body.role || "Not specified"}`,
    "",
    "What I want to bring:",
    body.problem,
    "",
    "What I want from the room:",
    body.affected,
    "",
    "What the group should know first:",
    body.firstBuild || "Nothing else yet.",
    "",
    `Preferred Friday: ${body.preferredFriday || "No date requested"}`,
    `Alternate Friday: ${body.alternateFriday || "None"}`,
  ].join("\n");

  return `mailto:incubator@uky.edu?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(message)}`;
}

export default function PitchForm() {
  const [state, setState] = useState<FormState>({ kind: "idle" });
  const [slots, setSlots] = useState<FridaySlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [preferredFriday, setPreferredFriday] = useState("");
  const [alternateFriday, setAlternateFriday] = useState("");

  const refreshSlots = useCallback(async () => {
    setSlotsLoading(true);
    try {
      const response = await fetch("/api/fridays", { cache: "no-store" });
      if (!response.ok) throw new Error("availability request failed");
      const payload = (await response.json()) as { slots: FridaySlot[] };
      setSlots(payload.slots);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSlots();
  }, [refreshSlots]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body: PitchBody = {
      submitterName: String(fd.get("submitterName") ?? ""),
      submitterEmail: String(fd.get("submitterEmail") ?? ""),
      role: String(fd.get("role") ?? "") || undefined,
      problem: String(fd.get("problem") ?? ""),
      affected: String(fd.get("affected") ?? ""),
      firstBuild: String(fd.get("firstBuild") ?? ""),
      preferredFriday:
        String(fd.get("preferredFriday") ?? "") || undefined,
      alternateFriday:
        String(fd.get("alternateFriday") ?? "") || undefined,
      website: String(fd.get("website") ?? ""),
    };
    const mailtoHref = buildPitchEmail(body);

    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/pitch", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 409) {
        const payload = (await res.json()) as { error?: string };
        setState({
          kind: "error",
          message:
            payload.error ?? "That date is no longer available. Choose another.",
        });
        setPreferredFriday("");
        setAlternateFriday("");
        await refreshSlots();
        return;
      }
      if (!res.ok && res.status !== 204) {
        setState({
          kind: "error",
          message: "The site could not save the proposal just now.",
          mailtoHref,
        });
        return;
      }
      setState({
        kind: "done",
        heldLabel: body.preferredFriday
          ? slots.find((slot) => slot.date === body.preferredFriday)?.label
          : undefined,
      });
    } catch {
      setState({
        kind: "error",
        message: "The site could not save the proposal just now.",
        mailtoHref,
      });
    }
  }

  const submitted = state.kind === "done";
  const sending = state.kind === "sending";
  return (
    <div className={`card ${styles.card}`}>
      <form onSubmit={handleSubmit}>
        <div className={styles.fields}>
          <div className={`form-two-grid ${styles.twoColumn}`}>
            <div>
              <label
                htmlFor="pitch-name"
                className={`eyebrow ${styles.label}`}
              >
                Your name
              </label>
              <div className={`field ${styles.field}`}>
                <input
                  id="pitch-name"
                  name="submitterName"
                  placeholder="First Last"
                  required
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="pitch-role"
                className={`eyebrow ${styles.label}`}
              >
                Role (optional)
              </label>
              <div className={`field ${styles.field}`}>
                <input
                  id="pitch-role"
                  name="role"
                  list="pitch-roles"
                  placeholder="Student, faculty, staff, or partner"
                />
                <datalist id="pitch-roles">
                  {ROLES.map((role) => (
                    <option key={role}>{role}</option>
                  ))}
                </datalist>
              </div>
            </div>
          </div>
          <div>
            <label
              htmlFor="pitch-email"
              className={`eyebrow ${styles.label}`}
            >
              Email
            </label>
            <div className={`field ${styles.field}`}>
              <input
                id="pitch-email"
                name="submitterEmail"
                type="email"
                placeholder="name@uky.edu"
                required
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="pitch-problem"
              className={`eyebrow ${styles.label}`}
            >
              What are you bringing?
            </label>
            <textarea
              id="pitch-problem"
              name="problem"
              rows={3}
              required
              maxLength={2000}
              className={styles.textarea}
              placeholder="An idea, talk, demo, collaborator request, or problem for the group."
            />
          </div>
          <div>
            <label
              htmlFor="pitch-affected"
              className={`eyebrow ${styles.label}`}
            >
              What do you want from the room?
            </label>
            <textarea
              id="pitch-affected"
              name="affected"
              rows={2}
              required
              maxLength={1000}
              className={styles.textarea}
              placeholder="Feedback, collaborators, questions, or help building a first prototype."
            />
          </div>
          <div>
            <label
              htmlFor="pitch-first-build"
              className={`eyebrow ${styles.label}`}
            >
              What should we know before we meet? (optional)
            </label>
            <textarea
              id="pitch-first-build"
              name="firstBuild"
              rows={3}
              maxLength={2000}
              className={styles.textarea}
              placeholder="What exists already, what you have tried, or anything useful to read or see."
            />
          </div>
          <fieldset className={styles.booking}>
            <legend className={`eyebrow ${styles.bookingLegend}`}>
              Choose a date <span>(optional)</span>
            </legend>
            <p className={styles.bookingCopy}>
              Choose an open date and add an alternate if you want one. We&apos;ll
              hold your preferred date for seven days while we review.
            </p>
            <FridayCalendarPicker
              slots={slots}
              loading={slotsLoading}
              preferredFriday={preferredFriday}
              alternateFriday={alternateFriday}
              onPreferredChange={setPreferredFriday}
              onAlternateChange={setAlternateFriday}
              onRetry={refreshSlots}
            />
            <div className={styles.bookingFooter}>
              <span>No date in mind? Leave the calendar blank.</span>
              <Link className={styles.calendarLink} href="/fridays#schedule">
                See the full schedule <span aria-hidden="true">-&gt;</span>
              </Link>
            </div>
          </fieldset>
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ display: "none" }}
          />
          <div className={styles.submitRow}>
            <button
              type="submit"
              disabled={sending || submitted}
              className={`btn lg ${submitted ? "" : "primary"}`}
              style={
                submitted
                  ? {
                      background: "var(--signal)",
                      color: "var(--bg)",
                      borderColor: "var(--signal)",
                    }
                  : undefined
              }
            >
              {submitted
                ? "Submitted"
                : sending
                  ? "Submitting..."
                  : (
                      <>
                        Send proposal <span className="arrow">-&gt;</span>
                      </>
                    )}
            </button>
          </div>
          {submitted && (
            <p className={styles.success} role="status">
              {state.heldLabel
                ? `Thanks. We have held ${state.heldLabel} while we review the proposal. We will confirm it by email.`
                : "Thanks. We will review it and follow up by email."}
            </p>
          )}
          {state.kind === "error" && (
            <div
              className="small"
              role="alert"
              style={{ color: "var(--danger, #c0392b)", lineHeight: 1.6 }}
            >
              {state.message}{" "}
              {state.mailtoHref && (
                <a href={state.mailtoHref}>Open an email draft instead</a>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
