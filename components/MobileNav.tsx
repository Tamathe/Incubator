"use client";

import Link from "next/link";
import { useRef, type KeyboardEvent } from "react";

export default function MobileNav({
  active,
}: {
  active?: "overview" | "fridays" | "projects";
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
          href="/#work"
          className={
            active === "overview" || active === "projects" ? "active" : undefined
          }
          onClick={closeMenu}
        >
          Work
        </Link>
        <Link
          href="/fridays"
          className={active === "fridays" ? "active" : undefined}
          onClick={closeMenu}
        >
          Fridays
        </Link>
        <Link
          href="/fridays#join"
          className="nav-mobile-cta"
          onClick={closeMenu}
        >
          Join the Incubator <span aria-hidden="true">-&gt;</span>
        </Link>
      </div>
    </details>
  );
}
