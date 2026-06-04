// Canva Brand Template registry — the bridge between generated copy and Canva render.
// These are AUTOFILL-capable brand templates published from Mushnoom designs. Each
// entry pins a stable brand-template ID (the `E…` ID the autofill API expects, NOT
// the `D…` design ID) plus the exact dataset field names Canva exposes for autofill.
//
// Field names here MUST match the template's published dataset exactly — they're the
// keys the autofill API fills. Re-verify with the `get-brand-template-dataset` MCP tool
// if a template is re-published. All current fields are plain text.
//
// Phase 3 render path (the "hands"): fielder maps approved ContentCopy onto a
// template's `fields`, canva.renderTemplate autofills + exports PNG, storage
// rehosts it public, and the asset URLs attach to the content_item.

import type { ContentFormat } from "../types";

/** Stable keys for the templates we generate against. */
export type CanvaTemplateKey =
  | "ingredients_carousel"
  | "poll_carousel"
  | "announcement_static";

export interface CanvaTemplate {
  /** Brand-template ID used by the autofill API (the `E…` ID, not the design `D…` ID). */
  id: string;
  /** Human label, mirrors the title in Canva. */
  title: string;
  format: ContentFormat;
  /** Autofill field names exposed by the template's dataset, all text. */
  fields: readonly string[];
}

export const CANVA_TEMPLATES: Record<CanvaTemplateKey, CanvaTemplate> = {
  ingredients_carousel: {
    id: "EAHLpTtmWhE",
    title: "Mushnoom — Carousel (Ingredients)",
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
  },
  poll_carousel: {
    id: "EAHLpYyjldU",
    title: "Mushnoom — Carousel (Poll)",
    format: "carousel",
    fields: ["hook", "option_1", "option_2", "option_3", "cta"],
  },
  announcement_static: {
    id: "EAHLpXNKZo0",
    title: "Mushnoom — Static (Announcement)",
    format: "static",
    fields: ["hook", "body"],
  },
};
