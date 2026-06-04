import { NextResponse } from "next/server";
import { updateContentItemCopy } from "@/lib/db/queries";
import { isSupabaseConfigured } from "@/lib/db/supabase";
import type { ContentCopy } from "@/lib/types";

export const runtime = "nodejs";

// PATCH /api/content/[id] — persist a manual edit to a draft's copy.
// Editing copy clears claims_checked (a human must re-verify). Used by the
// generator's inline "Edit". Returns 501 when Supabase isn't configured so the
// UI keeps the edit as a local-only preview.
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase not configured; edit is local-only." },
      { status: 501 }
    );
  }

  let body: { copy?: ContentCopy };
  try {
    body = (await req.json()) as { copy?: ContentCopy };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!body.copy) {
    return NextResponse.json({ error: "copy is required." }, { status: 400 });
  }

  try {
    const updated = await updateContentItemCopy(params.id, body.copy);
    return NextResponse.json({ item: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
