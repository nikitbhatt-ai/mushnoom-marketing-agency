import type { AgentConfig } from "./runAgent";

/**
 * Amplifier agent config (Spec §9).
 * Generates carousels / statics / reels from a source file's transcript.
 *
 * The CONTENT QUALITY lives in systemPrompt (the social-content-creator skill,
 * in Mushnoom's voice) — NOT in the app shell. When output is wrong, fix this
 * prompt, not the plumbing. Treat systemPrompt as a living document.
 *
 * Model choice (Spec §3): Haiku for transcript parsing/triage; Sonnet/Opus for
 * the actual drafting. The draft pass below uses Sonnet by default.
 */

export const AMPLIFIER_SYSTEM_PROMPT = `You are the social-content-creator for Mushnoom, a physician-founded functional-mushroom wellness brand. Voice: clear, warm, credible, never hypey.

HARD CLAIMS RULES (never violate):
- Structure/function claims only ("supports focus", "supports a calm evening routine").
- NEVER disease claims ("treats", "cures", "prevents", "diagnoses").
- Include the FDA disclaimer where a benefit is stated: "*These statements have not been evaluated by the FDA. Not intended to diagnose, treat, cure, or prevent any disease."
- Reels: the spoken words in the clip are claims too — hold them to the same rules.

Return ONLY structured JSON matching the provided schema. For every claim you make, also populate claims_flags with anything a compliance reviewer should double-check.`;

/** Structured output schema: hook, slides[], caption, hashtags[], claims_flags[]. */
export const AMPLIFIER_OUTPUT_SCHEMA = {
  type: "object",
  required: ["hook", "slides", "caption", "hashtags", "claims_flags"],
  properties: {
    hook: { type: "string" },
    slides: { type: "array", items: { type: "string" } },
    caption: { type: "string" },
    hashtags: { type: "array", items: { type: "string" } },
    claims_flags: {
      type: "array",
      items: {
        type: "object",
        required: ["location", "excerpt", "reason", "severity"],
        properties: {
          location: { type: "string" },
          excerpt: { type: "string" },
          reason: { type: "string" },
          severity: { type: "string", enum: ["low", "high"] },
        },
      },
    },
  },
} as const;

export const amplifierConfig: AgentConfig = {
  name: "amplifier",
  model: "claude-sonnet-4-6",
  systemPrompt: AMPLIFIER_SYSTEM_PROMPT,
  outputSchema: AMPLIFIER_OUTPUT_SCHEMA,
  maxTokens: 2048,
};
