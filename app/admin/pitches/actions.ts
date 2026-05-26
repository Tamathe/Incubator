"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { PitchStatus } from "@/app/generated/prisma";

const VALID = new Set<PitchStatus>([
  PitchStatus.new,
  PitchStatus.reviewing,
  PitchStatus.accepted,
  PitchStatus.declined,
  PitchStatus.converted,
]);

export async function setPitchStatus(id: string, status: string) {
  await requireAdmin();
  if (!VALID.has(status as PitchStatus)) throw new Error("invalid status");
  const next = status as PitchStatus;
  const current = await prisma.pitch.findUnique({ where: { id }, select: { status: true } });
  await prisma.pitch.update({
    where: { id },
    data: {
      status: next,
      reviewedAt:
        current?.status === PitchStatus.new && next !== PitchStatus.new
          ? new Date()
          : undefined,
    },
  });
  revalidatePath("/admin/pitches");
  revalidatePath("/admin");
}

export async function setPitchNotes(id: string, notes: string) {
  await requireAdmin();
  await prisma.pitch.update({ where: { id }, data: { notes: notes || null } });
  revalidatePath("/admin/pitches");
}
