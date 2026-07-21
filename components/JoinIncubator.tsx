"use client";

import { useState } from "react";

type JoinState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "done" }
  | { kind: "error"; mailtoHref: string };

function buildJoinEmail(email: string) {
  return `mailto:incubator@uky.edu?subject=${encodeURIComponent(
    "Join the AI Incubator",
  )}&body=${encodeURIComponent(`Please add ${email} to the AI Incubator.`)}`;
}

export default function JoinIncubator() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<JoinState>({ kind: "idle" });

  async function join(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const mailtoHref = buildJoinEmail(email);

    setState({ kind: "sending" });
    try {
      const response = await fetch("/api/members/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          website: formData.get("website") ?? "",
        }),
      });

      if (!response.ok && response.status !== 204) {
        setState({ kind: "error", mailtoHref });
        return;
      }

      setEmail("");
      setState({ kind: "done" });
    } catch {
      setState({ kind: "error", mailtoHref });
    }
  }

  if (state.kind === "done") {
    return (
      <div className="join-incubator-success" role="status">
        <span aria-hidden="true">&#10003;</span>
        <div>
          <strong>You&apos;re in.</strong>
          <p>We&apos;ll send you the Friday details and ways to get involved.</p>
        </div>
      </div>
    );
  }

  return (
    <form className="join-incubator-action" onSubmit={join}>
      <label className="sr-only" htmlFor="join-incubator-email">
        Email address
      </label>
      <input
        id="join-incubator-email"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="you@uky.edu"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={state.kind === "sending"}
      />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="form-honeypot"
      />
      <button
        className="studio-button studio-button-primary"
        type="submit"
        disabled={state.kind === "sending"}
      >
        {state.kind === "sending" ? "Joining..." : "Join the Incubator ->"}
      </button>
      {state.kind === "error" && (
        <p className="join-incubator-error" role="alert">
          We couldn&apos;t add you just now. {" "}
          <a href={state.mailtoHref}>Email us instead</a>.
        </p>
      )}
    </form>
  );
}
