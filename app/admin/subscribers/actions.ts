"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { subscribeSchema } from "@/lib/schemas";

export async function addSubscriber(formData: FormData) {
  await requireAdmin();
  const parsed = subscribeSchema.safeParse({
    email: formData.get("email"),
    source: "manual",
  });
  if (!parsed.success) {
    return { error: "Invalid email" };
  }
  await prisma.subscriber.upsert({
    where: { email: parsed.data.email },
    create: {
      email: parsed.data.email,
      source: "manual",
      status: "active",
    },
    update: { status: "active", unsubscribedAt: null },
  });
  revalidatePath("/admin/subscribers");
  revalidatePath("/admin");
  return { ok: true };
}

export async function setSubscriberStatus(id: string, status: "active" | "unsubscribed") {
  await requireAdmin();
  await prisma.subscriber.update({
    where: { id },
    data: {
      status,
      unsubscribedAt: status === "unsubscribed" ? new Date() : null,
    },
  });
  revalidatePath("/admin/subscribers");
  revalidatePath("/admin");
}
