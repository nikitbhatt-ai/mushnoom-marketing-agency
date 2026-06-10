import { NextResponse } from "next/server";

/**
 * Cron auth for Cloud Scheduler.
 *
 * On Vercel, Cron jobs were called from trusted infrastructure. On Cloud Run the
 * route is a public HTTPS endpoint, so Cloud Scheduler must prove it's the
 * caller. We use a shared secret: the Scheduler job is configured to send
 * `Authorization: Bearer $CRON_SECRET` and we reject anything else.
 *
 * (A stronger option is an OIDC token + IAM "run.invoker" on the job's service
 * account — see MIGRATION.md. The shared secret is the simplest first step.)
 *
 * Returns null when the request is authorized, or a 401 response to return.
 */
export function assertCronAuth(req: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  // If no secret is configured we fail closed — better a dead cron than an open
  // one that anyone on the internet can trigger.
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured." },
      { status: 401 }
    );
  }
  const header = req.headers.get("authorization");
  if (header !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return null;
}
