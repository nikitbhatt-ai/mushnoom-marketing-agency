// Self-hosted renderer: fielded copy -> on-brand PNGs, in IG/FB ratios.
// Satori turns the layout (lib/render/layouts) into SVG; resvg rasterizes it to
// PNG. No third-party render service, no per-client plan — the whole reason we
// moved off the Canva Autofill API.

import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { brandFonts } from "./fonts";
import { buildPages, type RenderOptions } from "./layouts";
import { SIZES, DEFAULT_ASPECT, type AspectKey } from "./sizes";
import type { RenderTemplateKey } from "./templates";
import type { ContentCopy } from "../types";

/**
 * Render every page of a template to a PNG buffer, in order. `copy` drives
 * dynamic templates (one page per slide); `fields` feeds the fixed templates
 * (poll, static) via the fielder. `opts` carries per-render visual choices
 * (maxPages cap, slide numbering, …).
 */
export async function renderTemplatePages(
  templateKey: RenderTemplateKey,
  copy: ContentCopy,
  fields: Record<string, string>,
  aspect: AspectKey = DEFAULT_ASPECT,
  opts: RenderOptions = {}
): Promise<Buffer[]> {
  const { width, height } = SIZES[aspect];
  const fonts = brandFonts();
  const all = buildPages(templateKey, copy, fields, opts);
  const { maxPages } = opts;
  const pages = maxPages && maxPages > 0 ? all.slice(0, maxPages) : all;

  const out: Buffer[] = [];
  for (const page of pages) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const svg = await satori(page as any, { width, height, fonts: fonts as any });
    const png = new Resvg(svg).render().asPng();
    out.push(Buffer.from(png));
  }
  return out;
}
