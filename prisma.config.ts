import "dotenv/config";
import { defineConfig } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    adapter: async (env) =>
      new PrismaPg({
        connectionString: env.DIRECT_URL ?? env.DATABASE_URL,
      }),
  },
});
