import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase is the SOLE system of record (Spec §3).
 *
 * Every table has Row Level Security ON with NO public policies, so the anon /
 * publishable key can't read anything. All app DB access happens SERVER-SIDE
 * using the service-role key, which bypasses RLS. That means:
 *   - never import this file into a client component;
 *   - the service-role key lives only in server env (Vercel project settings).
 *
 * The client is created lazily so the app still builds/boots when the env isn't
 * set yet — in that case the data layer (lib/db/queries.ts) falls back to mock
 * data, keeping the Phase 1 demo alive until the keys are added.
 */

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(url && serviceKey);
}

let cached: SupabaseClient | null = null;

/** Server-only Supabase client (service role). Returns null if env is unset. */
export function getServiceClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!cached) {
    cached = createClient(url!, serviceKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
