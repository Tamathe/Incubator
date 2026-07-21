"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  FridayBookingStatus,
  PitchStatus,
} from "@/app/generated/prisma";
import {
  bookingDateFromIso,
  bookingHoldUntil,
  isFirstFriday,
  isFridayIso,
  validateBookableFriday,
} from "@/lib/friday-booking";

const VALID = new Set<PitchStatus>([
  PitchStatus.new,
  PitchStatus.reviewing,
  PitchStatus.accepted,
  PitchStatus.declined,
  PitchStatus.converted,
]);

const BOOKING_VALID = new Set<FridayBookingStatus>([
  FridayBookingStatus.requested,
  FridayBookingStatus.confirmed,
  FridayBookingStatus.completed,
  FridayBookingStatus.cancelled,
  FridayBookingStatus.expired,
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
      ...(next === PitchStatus.declined
        ? {
            scheduledFriday: null,
            bookingStatus: FridayBookingStatus.cancelled,
            bookingHoldUntil: null,
          }
        : {}),
    },
  });
  revalidatePath("/admin/pitches");
  revalidatePath("/admin");
}

export async function setFridayBooking(
  id: string,
  scheduledFriday: string,
  status: string,
) {
  await requireAdmin();
  if (!BOOKING_VALID.has(status as FridayBookingStatus)) {
    redirect(`/admin/pitches?id=${id}&bookingError=Invalid+booking+status`);
  }

  const next = status as FridayBookingStatus;
  const releasesSlot =
    next === FridayBookingStatus.cancelled ||
    next === FridayBookingStatus.expired;

  if (!releasesSlot) {
    if (!scheduledFriday || !isFridayIso(scheduledFriday)) {
      redirect(`/admin/pitches?id=${id}&bookingError=Choose+a+Friday`);
    }
    if (isFirstFriday(scheduledFriday)) {
      redirect(
        `/admin/pitches?id=${id}&bookingError=The+first+Friday+is+reserved`,
      );
    }
    if (next !== FridayBookingStatus.completed) {
      const validation = validateBookableFriday(scheduledFriday);
      if (validation) {
        redirect(
          `/admin/pitches?id=${id}&bookingError=${encodeURIComponent(validation)}`,
        );
      }
    }
  }

  try {
    await prisma.pitch.update({
      where: { id },
      data: {
        scheduledFriday: releasesSlot
          ? null
          : bookingDateFromIso(scheduledFriday),
        bookingStatus: next,
        bookingHoldUntil:
          next === FridayBookingStatus.requested ? bookingHoldUntil() : null,
        ...(next === FridayBookingStatus.confirmed
          ? { status: PitchStatus.accepted, reviewedAt: new Date() }
          : {}),
      },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      redirect(
        `/admin/pitches?id=${id}&bookingError=That+Friday+is+already+held+or+booked`,
      );
    }
    throw error;
  }

  revalidatePath("/admin/pitches");
  revalidatePath("/admin");
  revalidatePath("/sessions");
  redirect(`/admin/pitches?id=${id}&bookingSaved=1`);
}

export async function setPitchNotes(id: string, notes: string) {
  await requireAdmin();
  await prisma.pitch.update({ where: { id }, data: { notes: notes || null } });
  revalidatePath("/admin/pitches");
}
