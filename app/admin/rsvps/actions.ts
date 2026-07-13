"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function setRsvpReviewed(id: string, reviewed: boolean) {
  await requireAdmin();
  await prisma.rsvp.update({ where: { id }, data: { reviewed } });
  revalidatePath("/admin/rsvps");
  revalidatePath("/admin");
}
