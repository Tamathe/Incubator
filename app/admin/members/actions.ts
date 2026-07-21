"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function setMemberStatus(
  id: string,
  status: "active" | "inactive",
) {
  await requireAdmin();
  await prisma.member.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/admin/members");
  revalidatePath("/admin");
}
