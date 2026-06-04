import { NextResponse } from "next/server";
import { updateClientBrandVoice } from "@/lib/db/queries";

export const runtime = "nodejs";

// POST /api/brand-voice — save the editable brand voice (the "skill").
// The saved guidelines are injected into every generation by /api/generate.
// Compliance rules live in code and are NOT editable here, by design.
export async function POST(req: Request) {
  let body: { guidelines?: string };
  try {
    body = (await req.json()) as { guidelines?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const guidelines = (body.guidelines ?? "").trim();
  if (!guidelines) {
    return NextResponse.json(
      { error: "Brand voice can't be empty." },
      { status: 400 }
    );
  }

  try {
    const brandVoice = await updateClientBrandVoice(guidelines);
    return NextResponse.json({ brandVoice });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed.";
    // 501 when the DB isn't wired so the UI can show a friendly "configure" note.
    const status = /not configured/i.test(message) ? 501 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
