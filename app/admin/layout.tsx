import type { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import "./admin.css";

async function logoutAction() {
  "use server";
  const store = await cookies();
  store.set("incubator-admin", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  redirect("/admin-login");
}

interface Props {
  children: ReactNode;
}

export default function AdminLayout({ children }: Props) {
  return (
    <div className="admin-shell">
      <aside>
        <div className="brand">AI Incubator</div>
        <Link href="/admin">Overview</Link>
        <Link href="/admin/members">Members</Link>
        <Link href="/admin/subscribers">Subscribers</Link>
        <Link href="/admin/rsvps">RSVPs</Link>
        <Link href="/admin/pitches">Pitches</Link>
        <div style={{ flex: 1 }} />
        <form action={logoutAction}>
          <button type="submit" className="small" style={{ background: "transparent", border: 0, color: "var(--ink-3)", cursor: "pointer", padding: "8px 12px" }}>
            Sign out
          </button>
        </form>
      </aside>
      <main>{children}</main>
    </div>
  );
}
