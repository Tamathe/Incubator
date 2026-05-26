import { PrismaClient } from "@/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { pool } from "./pg-pool";

declare global {
  // eslint-disable-next-line no-var
  var __incubatorPrisma: PrismaClient | undefined;
}

const adapter = new PrismaPg(pool);

export const prisma: PrismaClient =
  globalThis.__incubatorPrisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalThis.__incubatorPrisma = prisma;
}
