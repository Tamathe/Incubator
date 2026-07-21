import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvEscape(value: string | null | undefined): string {
  if (value == null) return "";
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET() {
  await requireAdmin();
  const members = await prisma.member.findMany({
    orderBy: { lastConfirmedAt: "desc" },
  });

  const header = [
    "id",
    "email",
    "status",
    "registeredAt",
    "lastConfirmedAt",
  ].join(",");
  const lines = members.map((member) =>
    [
      member.id,
      member.email,
      member.status,
      member.registeredAt.toISOString(),
      member.lastConfirmedAt.toISOString(),
    ]
      .map(csvEscape)
      .join(","),
  );

  return new Response([header, ...lines].join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="members.csv"',
    },
  });
}
