import { prisma } from "@/lib/prisma";
import { setMemberStatus } from "./actions";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const members = await prisma.member.findMany({
    orderBy: { lastConfirmedAt: "desc" },
  });

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Members</h1>
          <p className="small" style={{ color: "var(--ink-3)", marginTop: 5 }}>
            The active roster created through the website.
          </p>
        </div>
        <a href="/api/admin/members.csv" className="btn sm" download>
          Export CSV
        </a>
      </div>

      {members.length === 0 ? (
        <p className="small" style={{ color: "var(--ink-3)" }}>
          No one has joined through the website yet.
        </p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Last confirmed</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td>{member.email}</td>
                <td>
                  <span
                    style={{
                      color:
                        member.status === "active"
                          ? "var(--signal, #2ecc71)"
                          : "var(--ink-3)",
                    }}
                  >
                    {member.status}
                  </span>
                </td>
                <td>{member.registeredAt.toISOString().slice(0, 10)}</td>
                <td>{member.lastConfirmedAt.toISOString().slice(0, 10)}</td>
                <td>
                  <ToggleMemberStatus
                    id={member.id}
                    current={member.status}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

function ToggleMemberStatus({
  id,
  current,
}: {
  id: string;
  current: "active" | "inactive";
}) {
  const next = current === "active" ? "inactive" : "active";
  return (
    <form
      action={async () => {
        "use server";
        await setMemberStatus(id, next);
      }}
    >
      <button
        type="submit"
        className="small"
        style={{
          background: "transparent",
          border: "1px solid var(--line)",
          borderRadius: 6,
          padding: "4px 10px",
          cursor: "pointer",
          color: "var(--ink-2)",
        }}
      >
        {current === "active" ? "Mark inactive" : "Reactivate"}
      </button>
    </form>
  );
}
