import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __incubatorPgPool: Pool | undefined;
}

export const pool: Pool =
  globalThis.__incubatorPgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__incubatorPgPool = pool;
}
