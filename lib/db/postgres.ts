import { Pool, type QueryResultRow } from "pg";

/**
 * Cloud SQL for PostgreSQL is the SOLE system of record (Spec §3).
 *
 * We talk to Postgres directly with the `pg` driver — no PostgREST, no
 * service-role key. The app connects as a dedicated database ROLE whose
 * privileges ARE the security boundary, so this whole module is server-only:
 *   - never import it into a client component;
 *   - the connection string lives only in server env (Secret Manager -> Cloud Run).
 *
 * Connecting from Cloud Run: the Cloud SQL connection is attached to the service
 * and Postgres listens on a unix socket at /cloudsql/<INSTANCE_CONNECTION_NAME>.
 * Set DATABASE_URL accordingly, e.g.
 *   postgresql://USER:PASS@/raemy?host=/cloudsql/PROJECT:REGION:INSTANCE
 * For local dev against the Cloud SQL Auth Proxy use host=127.0.0.1:5432.
 *
 * The pool is created lazily so the app still builds/boots when DATABASE_URL
 * isn't set yet — in that case the data layer (lib/db/queries.ts) falls back to
 * mock data, keeping the Phase 1 demo alive until the database is wired.
 */

const connectionString = process.env.DATABASE_URL;

export function isDbConfigured(): boolean {
  return Boolean(connectionString);
}

let cached: Pool | null = null;

/** Server-only Cloud SQL pool. Returns null if DATABASE_URL is unset. */
export function getPool(): Pool | null {
  if (!connectionString) return null;
  if (!cached) {
    cached = new Pool({
      connectionString,
      // Cloud SQL terminates TLS at the proxy/socket, so the app doesn't manage
      // certs itself. Keep the pool small — Cloud Run scales by adding instances.
      max: Number(process.env.DB_POOL_MAX ?? 5),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
    // A pool-level error (e.g. Postgres dropped an idle connection) must not
    // crash the process; pg emits it here instead of throwing.
    cached.on("error", (err) => {
      console.warn("pg pool error:", err.message);
    });
  }
  return cached;
}

/**
 * Run a parameterized query and return the rows. Thin wrapper so callers never
 * touch the pool directly and we always use $1/$2 placeholders (never string
 * interpolation — that's how SQL injection happens).
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const pool = getPool();
  if (!pool) throw new Error("DATABASE_URL is not set; Cloud SQL is unavailable.");
  const result = await pool.query<T>(text, params);
  return result.rows;
}
