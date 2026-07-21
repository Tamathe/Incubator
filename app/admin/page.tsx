import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function loadStats() {
  const [
    memberCount,
    latestMembers,
    subscriberCount,
    unreviewedRsvps,
    newPitches,
    bookingHolds,
  ] = await Promise.all([
    prisma.member.count({ where: { status: "active" } }),
    prisma.member.findMany({
      where: { status: "active" },
      orderBy: { lastConfirmedAt: "desc" },
      take: 5,
      select: { email: true, registeredAt: true, lastConfirmedAt: true },
    }),
    prisma.subscriber.count({ where: { status: "active" } }),
    prisma.rsvp.count({
      where: { reviewed: false, meetingDate: { gte: new Date() } },
    }),
    prisma.pitch.count({ where: { status: "new" } }),
    prisma.pitch.count({
      where: {
        bookingStatus: "requested",
        bookingHoldUntil: { gt: new Date() },
      },
    }),
  ]);

  return {
    memberCount,
    latestMembers,
    subscriberCount,
    unreviewedRsvps,
    newPitches,
    bookingHolds,
  };
}

export default async function AdminOverview() {
  const stats = await loadStats();
  return (
    <>
      <div className="topbar">
        <h1>Overview</h1>
        <button
          type="button"
          title="Coming in Stage 3"
          disabled
          style={{ opacity: 0.5, cursor: "not-allowed" }}
        >
          Draft this week&apos;s digest
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
        }}
      >
        <StatCard
          href="/admin/members"
          label="Members"
          count={stats.memberCount}
          detail="active roster"
        />
        <StatCard
          href="/admin/subscribers"
          label="Friday updates"
          count={stats.subscriberCount}
          detail="active"
        />
        <StatCard
          href="/admin/rsvps"
          label="Unreviewed RSVPs"
          count={stats.unreviewedRsvps}
          detail="for upcoming meetings"
        />
        <StatCard
          href="/admin/pitches"
          label="New pitches"
          count={stats.newPitches}
          detail="awaiting review"
        />
        <StatCard
          href="/admin/pitches"
          label="Friday holds"
          count={stats.bookingHolds}
          detail="awaiting confirmation"
        />
      </div>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Latest members</h2>
        {stats.latestMembers.length === 0 ? (
          <p className="small" style={{ color: "var(--ink-3)" }}>
            No one has joined through the website yet.
          </p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Joined</th>
                <th>Last confirmed</th>
              </tr>
            </thead>
            <tbody>
              {stats.latestMembers.map((member) => (
                <tr key={member.email}>
                  <td>{member.email}</td>
                  <td>{member.registeredAt.toISOString().slice(0, 10)}</td>
                  <td>{member.lastConfirmedAt.toISOString().slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}

function StatCard({
  href,
  label,
  count,
  detail,
}: {
  href: string;
  label: string;
  count: number;
  detail: string;
}) {
  return (
    <Link
      href={href}
      className="card"
      style={{ padding: 20, textDecoration: "none", color: "inherit" }}
    >
      <div className="eyebrow">{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, marginTop: 6 }}>{count}</div>
      <div className="small" style={{ marginTop: 6, color: "var(--ink-3)" }}>
        {detail}
      </div>
    </Link>
  );
}
