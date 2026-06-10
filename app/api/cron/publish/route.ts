import { NextResponse } from "next/server";
import { assertCronAuth } from "@/lib/cron-auth";

// GET /api/cron/publish — wired in Phase 6 (posting).
// Cloud Scheduler hits this on a schedule: find approved+scheduled items whose
// time has come, assert canPublish(item) === true, publish via the poster, log
// to post_log. The Scheduler job must send Authorization: Bearer $CRON_SECRET.
export async function GET(req: Request) {
  const unauthorized = assertCronAuth(req);
  if (unauthorized) return unauthorized;

  return NextResponse.json(
    { error: "Publish cron is not wired yet (Phase 6)." },
    { status: 501 }
  );
}
