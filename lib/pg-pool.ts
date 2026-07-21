import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __incubatorPgPool: Pool | undefined;
}

function verifiedConnectionString(value: string | undefined): string | undefined {
  return value?.replace(
    /([?&])sslmode=(?:prefer|require|verify-ca)(?=&|$)/,
    "$1sslmode=verify-full",
  );
}

export const pool: Pool =
  globalThis.__incubatorPgPool ??
  new Pool({
    connectionString: verifiedConnectionString(process.env.DATABASE_URL),
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__incubatorPgPool = pool;
}
