import { NextResponse } from "next/server";
import { isAnthropicConfigured, QuotaExceededError } from "@/lib/agents/anthropic";
import { fieldCopyForTemplate } from "@/lib/agents/fielder";
import { directRenderOptions } from "@/lib/agents/director";
import { renderTemplatePages } from "@/lib/render/renderer";
import type { RenderOptions } from "@/lib/render/layouts";
import {
  RENDER_TEMPLATES,
  isRenderTemplateKey,
  type RenderTemplateKey,
} from "@/lib/render/templates";
import { DEFAULT_ASPECT, isAspectKey, type AspectKey } from "@/lib/render/sizes";
import { uploadImage } from "@/lib/integrations/storage";
import {
  getContentItemById,
  getDefaultClientId,
  updateContentItemAssets,
} from "@/lib/db/queries";

export const runtime = "nodejs";

// POST /api/render — the "hands" (Phase 3). Turns an item's copy into a real
// on-brand asset, rendered IN-APP: copy -> named fields (fielder) -> Satori/resvg
// PNGs in IG/FB ratios -> public Storage URLs -> attached to the content_item.
//
// Self-hosted: no third-party render account, no per-client plan. Rendering
// changes pixels, not copy or status — it never approves, schedules, or posts
// (hard rules 1 & 3).

interface RenderBody {
  id: string;
  templateKey: RenderTemplateKey;
  aspect?: AspectKey;
  /** Structured styling chosen via UI controls. */
  options?: RenderOptions;
  /** Free-text styling request; interpreted by the director into options. */
  artDirection?: string;
}

// Hard ceiling on rendered pages — IG carousels stay readable, and it bounds
// cost/time. The UI lets a user pick fewer, never more.
const MAX_PAGES = 8;

// Trust nothing from the client or the director: keep only known fields with
// valid values, so a bad value can never reach the layout.
function sanitizeOptions(o: Partial<RenderOptions> | undefined): RenderOptions {
  if (!o || typeof o !== "object") return {};
  const out: RenderOptions = {};
  if (o.align === "left" || o.align === "center") out.align = o.align;
  if (o.textSize === "small" || o.textSize === "normal" || o.textSize === "large")
    out.textSize = o.textSize;
  if (typeof o.showSwipe === "boolean") out.showSwipe = o.showSwipe;
  if (typeof o.numbered === "boolean") out.numbered = o.numbered;
  if (typeof o.cta === "boolean") out.cta = o.cta;
  if (typeof o.ctaText === "string") out.ctaText = o.ctaText.slice(0, 60);
  if (Number.isFinite(o.maxPages))
    out.maxPages = Math.min(MAX_PAGES, Math.max(1, Math.floor(o.maxPages as number)));
  return out;
}

export async function POST(req: Request) {
  if (!isAnthropicConfigured()) {
    return NextResponse.json(
      { error: "Rendering needs ANTHROPIC_API_KEY (for the field mapping)." },
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
  const aspect = isAspectKey(body.aspect) ? body.aspect : DEFAULT_ASPECT;
  if (!id || !isRenderTemplateKey(templateKey)) {
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

  // A template renders one specific format; don't render a static into a carousel.
  const template = RENDER_TEMPLATES[templateKey];
  if (item.format !== template.format) {
    return NextResponse.json(
      {
        error: `Template "${templateKey}" is a ${template.format}, but item ${id} is a ${item.format}.`,
      },
      { status: 422 }
    );
  }

  try {
    // 1. Resolve styling: UI controls form the base; a free-text art-direction
    //    note (interpreted by the logged director pass) overrides the fields it
    //    mentions. Then enforce the page ceiling.
    const explicit = sanitizeOptions(body.options);
    const directed = body.artDirection?.trim()
      ? sanitizeOptions(await directRenderOptions(body.artDirection.trim(), clientId))
      : {};
    const options: RenderOptions = { ...explicit, ...directed };
    options.maxPages = Number.isFinite(options.maxPages) ? options.maxPages : MAX_PAGES;

    // 2. Map copy onto the template. Dynamic templates render one page per slide
    //    straight from the copy (no field-splitting), so they skip the fielder;
    //    fixed templates (poll, static) still get the logged Haiku pass.
    const fields = template.dynamic
      ? {}
      : await fieldCopyForTemplate(templateKey, item.copy, clientId);
    // 3. Render each page to a PNG in the requested IG/FB ratio (self-hosted).
    const pages = await renderTemplatePages(templateKey, item.copy, fields, aspect, options);
    // 4. Upload each page to the public bucket -> durable URLs.
    const stamp = Date.now();
    const urls = await Promise.all(
      pages.map((buf, i) =>
        uploadImage(buf, `${clientId}/${id}/${stamp}-${aspect}-${i + 1}.png`)
      )
    );
    // 5. Attach to the item (cover + all pages). Status and copy are untouched.
    const updated = await updateContentItemAssets(id, urls);
    return NextResponse.json({ item: updated });
  } catch (err) {
    if (err instanceof QuotaExceededError) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    const message = err instanceof Error ? err.message : "Render failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
