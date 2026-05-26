"use client";

import { useState } from "react";

interface Props {
  /** Identifies where the form is mounted, stored on the Subscriber row. */
  source?: string;
}

export default function SubscribeForm({ source = "footer" }: Props) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [email, setEmail] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const formData = new FormData(e.currentTarget);
    const honeypot = formData.get("website");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, source, website: honeypot ?? "" }),
      });
      if (!res.ok && res.status !== 204) {
        setState("error");
        return;
      }
      setState("done");
      setEmail("");
    } catch {
      setState("error");
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
        disabled={state === "sending" || state === "done"}
      />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ display: "none" }}
      />
      <button className="btn primary sm" type="submit" disabled={state === "sending"}>
        {state === "done" ? "Sent ✓" : state === "sending" ? "Sending…" : "Subscribe"}
      </button>
      {state === "error" && (
        <span className="small" style={{ color: "var(--danger, #c0392b)", marginLeft: 8 }}>
          Something went wrong. Try again.
        </span>
      )}
    </form>
  );
}
