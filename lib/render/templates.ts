// Render template registry — the in-app, self-hosted replacement for Canva
// brand templates. Each key maps to a layout (lib/render/layouts.tsx) and the
// named fields the fielder fills. No third-party account or per-client plan
// needed: we render the PNGs ourselves (lib/render/renderer.ts).
//
// The field names are unchanged from the old Canva registry, so the fielder and
// the rest of the pipeline carry straight over.

import type { ContentFormat } from "../types";

export type RenderTemplateKey =
  | "ingredients_carousel"
  | "poll_carousel"
  | "announcement_static";

export interface RenderTemplate {
  title: string;
  format: ContentFormat;
  /** Named fields the fielder produces; consumed by the layout. */
  fields: readonly string[];
  /** How many pages/slides this template renders. Ignored when `dynamic`. */
  pages: number;
  /**
   * Dynamic templates render one page per generated slide (hook + every slide in
   * the copy), so the page count follows the copy, not a fixed layout. They skip
   * the fielder — the slide→page mapping is 1:1, no field-splitting needed.
   */
  dynamic?: boolean;
}

export const RENDER_TEMPLATES: Record<RenderTemplateKey, RenderTemplate> = {
  ingredients_carousel: {
    // Key kept for back-compat; this is now the general "render every slide"
    // carousel rather than a fixed 4-slot ingredients layout.
    title: "Carousel (all slides)",
    format: "carousel",
    fields: ["hook"],
    pages: 0, // variable: 1 (hook) + one per slide
    dynamic: true,
  },
  poll_carousel: {
    title: "Poll carousel",
    format: "carousel",
    fields: ["hook", "option_1", "option_2", "option_3", "cta"],
    pages: 3,
  },
  announcement_static: {
    title: "Announcement static",
    format: "static",
    fields: ["hook", "body"],
    pages: 1,
  },
};

export function isRenderTemplateKey(v: unknown): v is RenderTemplateKey {
  return typeof v === "string" && v in RENDER_TEMPLATES;
}
