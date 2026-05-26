import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { nextSession } from "@/lib/session";

export const dynamic = "force-dynamic";

async function loadStats() {
  const upcomingMeeting = nextSession();
  const [subscriberCount, latestSubscribers, unreviewedRsvps, newPitches] = await Promise.all([
    prisma.subscriber.count({ where: { status: "active" } }),
    prisma.subscriber.findMany({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { email: true, createdAt: true, source: true },
    }),
    prisma.rsvp.count({ where: { reviewed: false, meetingDate: { gte: new Date() } } }),
    prisma.pitch.count({ where: { status: "new" } }),
  ]);
  return { subscriberCount, latestSubscribers, upcomingMeeting, unreviewedRsvps, newPitches };
}

export default async function AdminOverview() {
  const s = await loadStats();
  return (
    <>
      <div className="topbar">
        <h1>Overview</h1>
        <button type="button" title="Coming in Stage 3" disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>
          Draft this week&apos;s digest
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <Link href="/admin/subscribers" className="card" style={{ padding: 20, textDecoration: "none", color: "inherit" }}>
          <div className="eyebrow">Subscribers</div>
          <div style={{ fontSize: 32, fontWeight: 800, marginTop: 6 }}>{s.subscriberCount}</div>
          <div className="small" style={{ marginTop: 6, color: "var(--ink-3)" }}>active</div>
        </Link>
        <Link href="/admin/rsvps" className="card" style={{ padding: 20, textDecoration: "none", color: "inherit" }}>
          <div className="eyebrow">Unreviewed RSVPs</div>
          <div style={{ fontSize: 32, fontWeight: 800, marginTop: 6 }}>{s.unreviewedRsvps}</div>
          <div className="small" style={{ marginTop: 6, color: "var(--ink-3)" }}>for upcoming meetings</div>
        </Link>
        <Link href="/admin/pitches" className="card" style={{ padding: 20, textDecoration: "none", color: "inherit" }}>
          <div className="eyebrow">New pitches</div>
          <div style={{ fontSize: 32, fontWeight: 800, marginTop: 6 }}>{s.newPitches}</div>
          <div className="small" style={{ marginTop: 6, color: "var(--ink-3)" }}>awaiting review</div>
        </Link>
      </div>
      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Latest subscribers</h2>
        {s.latestSubscribers.length === 0 ? (
          <p className="small" style={{ color: "var(--ink-3)" }}>No subscribers yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Email</th><th>Source</th><th>Signed up</th></tr>
            </thead>
            <tbody>
              {s.latestSubscribers.map((row) => (
                <tr key={row.email}>
                  <td>{row.email}</td>
                  <td>{row.source ?? "—"}</td>
                  <td>{row.createdAt.toISOString().slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
