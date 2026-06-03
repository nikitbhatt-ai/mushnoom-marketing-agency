// Supabase client — wired in Phase 2 (data layer).
// Supabase is the SOLE system of record (Spec §3).
//
// TODO(Phase 2): instantiate the client and replace mock reads/writes.
// We export two clients deliberately:
//   - browserClient: anon key, respects row-level security, safe in the browser.
//   - serviceClient: service-role key, server-only (API routes / cron), bypasses RLS.
//
// import { createClient } from "@supabase/supabase-js";
//
// export const browserClient = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );
//
// // Server-only. NEVER import this into a client component.
// export const serviceClient = createClient(
//   process.env.SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

export const SUPABASE_NOT_WIRED =
  "Supabase is not wired yet — Phase 1 runs on mock data (lib/mock/data.ts).";
