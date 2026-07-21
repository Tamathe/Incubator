-- CreateEnum
DO $$
BEGIN
    CREATE TYPE "FridayBookingStatus" AS ENUM ('requested', 'confirmed', 'completed', 'cancelled', 'expired');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable
ALTER TABLE "Pitch"
ADD COLUMN "preferredFriday" DATE,
ADD COLUMN "alternateFriday" DATE,
ADD COLUMN "scheduledFriday" DATE,
ADD COLUMN "bookingStatus" "FridayBookingStatus",
ADD COLUMN "bookingHoldUntil" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Pitch_scheduledFriday_key" ON "Pitch"("scheduledFriday");

-- CreateIndex
CREATE INDEX "Pitch_bookingStatus_scheduledFriday_idx" ON "Pitch"("bookingStatus", "scheduledFriday");
