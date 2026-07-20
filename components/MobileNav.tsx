"use client";

import Link from "next/link";
import { useRef, type KeyboardEvent } from "react";

export default function MobileNav({
  projectsActive = false,
}: {
  projectsActive?: boolean;
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
        <Link href="/#fridays" onClick={closeMenu}>
          Fridays
        </Link>
        <Link
          href="/projects"
          className={projectsActive ? "active" : undefined}
          onClick={closeMenu}
        >
          Projects
        </Link>
        <Link
          className="nav-student-work"
          href="/#student-work"
          onClick={closeMenu}
        >
          <span>Student work</span>
          <small>(page in development)</small>
        </Link>
        <Link href="/join" className="nav-mobile-cta" onClick={closeMenu}>
          Join us <span aria-hidden="true">-&gt;</span>
        </Link>
      </div>
    </details>
  );
}
