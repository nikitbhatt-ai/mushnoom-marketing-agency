// Self-hosted renderer: fielded copy -> on-brand PNGs, in IG/FB ratios.
// Satori turns the layout (lib/render/layouts) into SVG; resvg rasterizes it to
// PNG. No third-party render service, no per-client plan — the whole reason we
// moved off the Canva Autofill API.

import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { brandFonts } from "./fonts";
import { buildPages } from "./layouts";
import { SIZES, DEFAULT_ASPECT, type AspectKey } from "./sizes";
import type { RenderTemplateKey } from "./templates";

/** Render every page of a template to a PNG buffer, in order. */
export async function renderTemplatePages(
  templateKey: RenderTemplateKey,
  fields: Record<string, string>,
  aspect: AspectKey = DEFAULT_ASPECT
): Promise<Buffer[]> {
  const { width, height } = SIZES[aspect];
  const fonts = brandFonts();
  const pages = buildPages(templateKey, fields);

  const out: Buffer[] = [];
  for (const page of pages) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const svg = await satori(page as any, { width, height, fonts: fonts as any });
    const png = new Resvg(svg).render().asPng();
    out.push(Buffer.from(png));
  }
  return out;
}
