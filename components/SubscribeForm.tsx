"use client";

import { useState } from "react";

export default function SubscribeForm() {
  const [done, setDone] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <form
      className="field"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
        setEmail("");
      }}
    >
      <input
        type="email"
        placeholder="name@uky.edu"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="btn primary sm" type="submit">
        {done ? "Sent ✓" : "Subscribe"}
      </button>
    </form>
  );
}
