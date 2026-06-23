import { NextResponse } from "next/server";
import { sendContentItemToReview, updateContentItemCopy } from "@/lib/db/queries";
import { isSupabaseConfigured } from "@/lib/db/supabase";
import type { ContentCopy } from "@/lib/types";

export const runtime = "nodejs";

// PATCH /api/content/[id] — persist a change to a draft. Two shapes:
//   { copy }               -> save a manual edit (clears claims_checked; a human
//                             must re-verify).
//   { status: "in_review" }-> send the draft to the review queue.
// `in_review` is the only status settable here — approval/scheduling/posting
// stay separate, human-gated steps (hard rules 1 & 3). Returns 501 when Supabase
// isn't configured so the UI keeps the change as a local-only preview.
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase not configured; change is local-only." },
      { status: 501 }
    );
  }

  let body: { copy?: ContentCopy; status?: string };
  try {
    body = (await req.json()) as { copy?: ContentCopy; status?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    if (body.status !== undefined) {
      if (body.status !== "in_review") {
        return NextResponse.json(
          { error: "Only 'in_review' may be set here." },
          { status: 400 }
        );
      }
      const updated = await sendContentItemToReview(params.id);
      return NextResponse.json({ item: updated });
    }

    if (!body.copy) {
      return NextResponse.json(
        { error: "copy or status is required." },
        { status: 400 }
      );
    }
    const updated = await updateContentItemCopy(params.id, body.copy);
    return NextResponse.json({ item: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
