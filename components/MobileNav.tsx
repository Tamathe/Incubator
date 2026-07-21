"use client";

import Link from "next/link";
import { useRef, type KeyboardEvent } from "react";

export default function MobileNav({
  active,
}: {
  active?:
    | "overview"
    | "sessions"
    | "projects"
    | "ideas"
    | "team"
    | "open-problems"
    | "outcomes"
    | "built"
    | "join";
}) {
  const menuRef = useRef<HTMLDetailsElement>(null);

  function closeMenu() {
    if (menuRef.current) menuRef.current.open = false;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDetailsElement>) {
    if (event.key !== "Escape" || !menuRef.current?.open) return;
    closeMenu();
    menuRef.current.querySelector("summary")?.focus();
  }

  return (
    <details ref={menuRef} className="nav-mobile" onKeyDown={handleKeyDown}>
      <summary aria-label="Open site navigation">Menu</summary>
      <div className="nav-mobile-panel">
        <Link
          href="/sessions"
          className={active === "sessions" ? "active" : undefined}
          onClick={closeMenu}
        >
          Fridays
        </Link>
        <Link
          href="/projects"
          className={active === "projects" ? "active" : undefined}
          onClick={closeMenu}
        >
          Projects
        </Link>
        <Link href="/#student-work" onClick={closeMenu}>Student work</Link>
        <Link
          href="/join"
          className={`nav-mobile-cta${active === "join" ? " active" : ""}`}
          onClick={closeMenu}
        >
          Join the Incubator <span aria-hidden="true">-&gt;</span>
        </Link>
      </div>
    </details>
  );
}
