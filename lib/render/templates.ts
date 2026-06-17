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
  /** How many pages/slides this template renders. */
  pages: number;
}

export const RENDER_TEMPLATES: Record<RenderTemplateKey, RenderTemplate> = {
  ingredients_carousel: {
    title: "Ingredients carousel",
    format: "carousel",
    fields: [
      "hook",
      "ingredient_1",
      "benefit_1",
      "ingredient_2",
      "benefit_2",
      "ingredient_3",
      "benefit_3",
    ],
    pages: 4,
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
