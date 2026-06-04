import { NextResponse } from "next/server";
import { isAnthropicConfigured, QuotaExceededError } from "@/lib/agents/anthropic";
import { fieldCopyForTemplate } from "@/lib/agents/fielder";
import { isCanvaConfigured, renderTemplate } from "@/lib/integrations/canva";
import { rehostImage } from "@/lib/integrations/storage";
import {
  CANVA_TEMPLATES,
  type CanvaTemplateKey,
} from "@/lib/integrations/canva-templates";
import {
  getContentItemById,
  getDefaultClientId,
  updateContentItemAssets,
} from "@/lib/db/queries";

export const runtime = "nodejs";

// POST /api/render — the "hands" (Phase 3). Turns an item's copy into a real
// on-brand asset: copy -> named template fields (fielder) -> Canva autofill + PNG
// export -> rehosted public URLs -> attached to the content_item.
//
// Rendering changes pixels, not copy or status — it never approves, schedules, or
// posts (hard rules 1 & 3). Returns 501 when the model or Canva isn't configured,
// matching the rest of the app's graceful-degradation pattern.

interface RenderBody {
  id: string;
  templateKey: CanvaTemplateKey;
}

export async function POST(req: Request) {
  if (!isAnthropicConfigured() || !isCanvaConfigured()) {
    return NextResponse.json(
      { error: "Rendering needs ANTHROPIC_API_KEY and CANVA_CONNECT_TOKEN." },
      { status: 501 }
    );
  }

  let body: RenderBody;
  try {
    body = (await req.json()) as RenderBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const { id, templateKey } = body;
  if (!id || !templateKey || !CANVA_TEMPLATES[templateKey]) {
    return NextResponse.json(
      { error: "id and a valid templateKey are required." },
      { status: 400 }
    );
  }

  const clientId = await getDefaultClientId();
  if (!clientId) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 501 }
    );
  }

  const item = await getContentItemById(id);
  if (!item) {
    return NextResponse.json({ error: "Content item not found." }, { status: 404 });
  }

  // A template renders one specific format; don't autofill a static into a carousel.
  const template = CANVA_TEMPLATES[templateKey];
  if (item.format !== template.format) {
    return NextResponse.json(
      {
        error: `Template "${templateKey}" is a ${template.format}, but item ${id} is a ${item.format}.`,
      },
      { status: 422 }
    );
  }

  try {
    // 1. Approved copy -> the template's named fields (logged Haiku pass).
    const data = await fieldCopyForTemplate(templateKey, item.copy, clientId);
    // 2. Autofill the brand template and export PNG (Canva owns the pixels).
    const { pageUrls } = await renderTemplate(template.id, data);
    // 3. Rehost each page into the public bucket (Canva's URLs are temporary).
    const hosted = await Promise.all(
      pageUrls.map((url, i) =>
        rehostImage(url, `${clientId}/${id}/${Date.now()}-${i + 1}.png`)
      )
    );
    // 4. Attach to the item (cover + all pages). Status and copy are untouched.
    const updated = await updateContentItemAssets(id, hosted);
    return NextResponse.json({ item: updated });
  } catch (err) {
    if (err instanceof QuotaExceededError) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    const message = err instanceof Error ? err.message : "Render failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
