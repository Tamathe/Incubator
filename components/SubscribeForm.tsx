"use client";

import { useState } from "react";

interface Props {
  /** Identifies where the form is mounted, stored on the Subscriber row. */
  source?: string;
}

type SubscribeState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "done" }
  | { kind: "error"; mailtoHref: string };

function buildSubscribeEmail(email: string) {
  return `mailto:incubator@uky.edu?subject=${encodeURIComponent(
    "Join the AI Incubator listserv",
  )}&body=${encodeURIComponent(
    `Please add ${email} to the AI Incubator listserv.`,
  )}`;
}

export default function SubscribeForm({ source = "footer" }: Props) {
  const [state, setState] = useState<SubscribeState>({ kind: "idle" });
  const [email, setEmail] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState({ kind: "sending" });
    const formData = new FormData(e.currentTarget);
    const honeypot = formData.get("website");
    const mailtoHref = buildSubscribeEmail(email);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, source, website: honeypot ?? "" }),
      });
      if (!res.ok && res.status !== 204) {
        setState({ kind: "error", mailtoHref });
        return;
      }
      setState({ kind: "done" });
      setEmail("");
    } catch {
      setState({ kind: "error", mailtoHref });
    }
  }

  return (
    <form className="field" onSubmit={onSubmit}>
      <input
        type="email"
        placeholder="name@uky.edu"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={state.kind === "sending" || state.kind === "done"}
      />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ display: "none" }}
      />
      <button
        className="btn primary sm"
        type="submit"
        disabled={state.kind === "sending"}
      >
        {state.kind === "done"
          ? "Sent"
          : state.kind === "sending"
            ? "Sending..."
            : "Subscribe"}
      </button>
      {state.kind === "error" && (
        <span
          className="small"
          style={{ color: "var(--danger, #c0392b)", marginLeft: 8 }}
        >
          Could not save. <a href={state.mailtoHref}>Email us instead</a>.
        </span>
      )}
    </form>
  );
}
