"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "../admin/admin.css";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.replace(next);
        return;
      }
      const body = await res.json().catch(() => ({}));
      setErrorMsg(body.error ?? "Login failed");
      setState("error");
    } catch {
      setErrorMsg("Network error");
      setState("error");
    }
  }

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)", marginBottom: 18, textTransform: "uppercase", letterSpacing: 0.05 }}>
          AI Incubator · Admin
        </div>
        <h1 style={{ margin: 0, marginBottom: 18, fontSize: 20, fontWeight: 800 }}>Sign in</h1>
        <form onSubmit={onSubmit}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "var(--bg)",
              border: "1px solid var(--line)",
              borderRadius: 10,
              color: "var(--ink)",
              fontSize: 14,
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={state === "sending"}
            className="btn primary"
            style={{ width: "100%", marginTop: 14 }}
          >
            {state === "sending" ? "Signing in…" : "Sign in"}
          </button>
          {errorMsg && (
            <div className="small" style={{ marginTop: 12, color: "var(--danger, #c0392b)" }}>
              {errorMsg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
