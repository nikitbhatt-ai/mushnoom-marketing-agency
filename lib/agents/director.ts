// Art director — turns a free-text styling request into structured render
// options (Phase 3). The renderer is template-driven, not generative, so we
// can't hand it a prose prompt; this small Haiku pass maps natural language like
// "punchier, left-aligned, add a shop-now CTA, keep it to 5 slides" onto the
// finite set of knobs the layouts actually support (RenderOptions).
//
// It rides runAgent, so the call is logged to usage_log and counts against the
// per-client quota like every other model call (hard rule 4). It only ever sets
// layout/styling fields — it cannot touch copy or the claims gate.

import { runAgent, type AgentConfig } from "./runAgent";
import type { RenderOptions } from "../render/layouts";

const DIRECTOR_MODEL = "claude-haiku-4-5-20251001";

const directorConfig: AgentConfig = {
  name: "director",
  model: DIRECTOR_MODEL,
  systemPrompt: `You are an art director for a social-media carousel renderer. Translate a brand's free-text styling request into the renderer's available options. Output ONLY the options the request clearly implies — omit everything else so it keeps its current value.

Available options (all optional):
- align: "center" | "left" — overall text alignment.
- textSize: "small" | "normal" | "large" — overall text size.
- showSwipe: boolean — whether the cover shows a "Swipe »" prompt.
- numbered: boolean — whether slides show 01/02… index labels.
- cta: boolean — whether to append a closing call-to-action slide.
- ctaText: string — the words on that CTA slide (only if cta is true). Keep it short (2–5 words).
- maxPages: integer 1–8 — cap on total pages including the cover.

Rules:
- Map intent, don't invent. "punchy/bold/bigger" → textSize "large"; "minimal/subtle/smaller" → textSize "small". "left aligned/editorial" → align "left". "no swipe" → showSwipe false. "number the slides" → numbered true. "add a CTA/end with shop now" → cta true (+ ctaText). "keep it to N" → maxPages N.
- Do NOT rewrite the post copy. You only set styling options.
- If the request implies nothing about an option, leave it out.`,
  outputSchema: {
    type: "object",
    properties: {
      align: { type: "string", enum: ["center", "left"] },
      textSize: { type: "string", enum: ["small", "normal", "large"] },
      showSwipe: { type: "boolean" },
      numbered: { type: "boolean" },
      cta: { type: "boolean" },
      ctaText: { type: "string" },
      maxPages: { type: "integer", minimum: 1, maximum: 8 },
    },
    required: [],
    additionalProperties: false,
  },
  maxTokens: 512,
};

/**
 * Interpret a free-text art-direction note into a partial RenderOptions. Returns
 * only the fields the note implies; callers merge it over their explicit options.
 */
export async function directRenderOptions(
  instruction: string,
  clientId: string
): Promise<Partial<RenderOptions>> {
  const { data } = await runAgent<Partial<RenderOptions>>(
    directorConfig,
    `Styling request:\n${instruction}`,
    clientId
  );
  return data ?? {};
}
