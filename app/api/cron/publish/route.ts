import { NextResponse } from "next/server";

// GET /api/cron/publish — wired in Phase 6 (posting).
// Vercel Cron hits this on a schedule: find approved+scheduled items whose time
// has come, assert canPublish(item) === true, publish via the poster, log to post_log.
export async function GET() {
  return NextResponse.json(
    { error: "Publish cron is not wired yet (Phase 6)." },
    { status: 501 }
  );
}
