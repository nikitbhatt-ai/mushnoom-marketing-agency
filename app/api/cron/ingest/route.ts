import { NextResponse } from "next/server";
import { assertCronAuth } from "@/lib/cron-auth";

// GET /api/cron/ingest — wired in Phase 4 (ingestion).
// Cloud Scheduler hits this on a schedule: poll the Drive folder, transcribe new
// media, insert into source_files. The Scheduler job must send
// Authorization: Bearer $CRON_SECRET.
export async function GET(req: Request) {
  const unauthorized = assertCronAuth(req);
  if (unauthorized) return unauthorized;

  return NextResponse.json(
    { error: "Ingestion cron is not wired yet (Phase 4)." },
    { status: 501 }
  );
}
