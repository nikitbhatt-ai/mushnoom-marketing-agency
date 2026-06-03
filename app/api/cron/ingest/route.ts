import { NextResponse } from "next/server";

// GET /api/cron/ingest — wired in Phase 4 (ingestion).
// Vercel Cron hits this on a schedule: poll the Drive folder, transcribe new
// media, insert into source_files.
export async function GET() {
  return NextResponse.json(
    { error: "Ingestion cron is not wired yet (Phase 4)." },
    { status: 501 }
  );
}
