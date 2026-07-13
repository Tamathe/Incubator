import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Soft-fail at module load so a missing env var doesn't crash the static build.
  // Callers should handle a null client.
  console.warn(
    "Supabase env vars missing — /ideas page features will be disabled."
  );
}

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;
