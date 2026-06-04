// Fielder — maps approved copy onto a Canva template's named fields (Phase 3).
//
// The skill outputs a generic ContentCopy ({ hook, slides[], caption, hashtags }) —
// stable, human-reviewable, format-agnostic. But each Canva template wants NAMED
// fields (ingredient_1, benefit_1, option_2, body, ...). The fielder is the small
// translator between the two: a cheap Haiku pass that reads the approved copy and
// emits exactly the fields a given template needs.
//
// WHY a model and not string-splitting: a slide like "Lion's mane supports focus"
// has to become ingredient_1="Lion's mane", benefit_1="supports focus" — that's
// language understanding, not substring math. It rides runAgent, so the call is
// logged to usage_log and counts against the quota like every other (hard rule 4).
//
// It does NOT invent or rewrite — it only redistributes copy a human already
// approved, so the upstream claims check still holds for what gets rendered.

import type { ContentCopy } from "../types";
import { runAgent, type AgentConfig } from "./runAgent";
import {
  CANVA_TEMPLATES,
  type CanvaTemplateKey,
} from "../integrations/canva-templates";
import type { AutofillData } from "../integrations/canva";

const FIELDER_MODEL = "claude-haiku-4-5-20251001";

/** Build the fielder config for one template: its output schema IS the template's fields. */
function fielderConfig(templateKey: CanvaTemplateKey): AgentConfig {
  const { fields } = CANVA_TEMPLATES[templateKey];
  const properties: Record<string, unknown> = {};
  for (const f of fields) properties[f] = { type: "string" };
  return {
    name: "fielder",
    model: FIELDER_MODEL,
    systemPrompt: `You place already-approved social copy into a fixed set of template fields.

Rules:
- Use ONLY the words and meaning from the provided copy. Do not invent, embellish, or change any claim — a human already approved this exact copy.
- Fill EVERY field. Keep each one tight and self-contained: it sits in a small slot in a layout, not a paragraph.
- Where the field names ask for parts of a line, split it (e.g. an ingredient name in one field, the function it supports in another).
- Match the copy's tone. Add no new emoji and no new hashtags.`,
    outputSchema: {
      type: "object",
      required: [...fields],
      properties,
      additionalProperties: false,
    },
    maxTokens: 1024,
  };
}

/**
 * Translate approved copy into a specific template's named autofill fields, ready
 * to hand straight to canva.renderTemplate.
 */
export async function fieldCopyForTemplate(
  templateKey: CanvaTemplateKey,
  copy: ContentCopy,
  clientId: string
): Promise<AutofillData> {
  const template = CANVA_TEMPLATES[templateKey];
  const input = [
    `Target template: ${template.title}`,
    `Fields to fill: ${template.fields.join(", ")}`,
    ``,
    `APPROVED COPY:`,
    `Hook: ${copy.hook}`,
    `Slides:`,
    ...copy.slides.map((s, i) => `  ${i + 1}. ${s}`),
    `Caption: ${copy.caption}`,
  ].join("\n");

  const { data } = await runAgent<Record<string, string>>(
    fielderConfig(templateKey),
    input,
    clientId
  );

  const out: AutofillData = {};
  for (const f of template.fields) {
    out[f] = { type: "text", text: data[f] ?? "" };
  }
  return out;
}
