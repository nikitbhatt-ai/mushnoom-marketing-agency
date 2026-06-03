import { NextResponse } from "next/server";

// POST /api/generate — wired in Phase 3 (generation).
// Runs the Amplifier (runAgent + amplifier.config + the skill) over a source
// file and inserts real drafts into content_items as `draft`.
//
// In Phase 1 the generator screen fakes this client-side with mock data, so this
// route intentionally returns 501 until Phase 3.
export async function POST() {
  return NextResponse.json(
    { error: "Generation is not wired yet (Phase 3). Prototype uses mock data." },
    { status: 501 }
  );
}
