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

/**
 * Compliance rules — NON-NEGOTIABLE (hard rules 1 & 2). These are always
 * included in the prompt regardless of brand-voice edits or per-run
 * instructions, so no amount of in-app tuning can remove the guardrails.
 */
const CLAIMS_RULES = `HARD CLAIMS RULES (never violate):
- Structure/function claims only ("supports focus", "supports a calm evening routine").
- NEVER disease claims ("treats", "cures", "prevents", "diagnoses").
- Include the FDA disclaimer where a benefit is stated: "*These statements have not been evaluated by the FDA. Not intended to diagnose, treat, cure, or prevent any disease."
- Reels: the spoken words in the clip are claims too — hold them to the same rules.`;

/**
 * The default Mushnoom brand voice (the "social-content-creator skill"). This
 * seeds clients.brand_voice and is the fallback when none is stored. The LIVE
 * voice is editable in-app (Generator → Brand voice); edits save to the DB and
 * are injected into every generation. When output is off-brand, fix THIS, not
 * the plumbing.
 */
export const DEFAULT_BRAND_VOICE_GUIDELINES = `Who we are: Mushnoom makes functional-mushroom supplements, founded by a physician. We're the calm, knowledgeable friend who happens to be a doctor — credible health science for everyday wellness, never a supplement hype machine.

Who we're talking to: Health-curious adults (30–55) who are a little skeptical of wellness trends. They want to feel sharper, calmer, and more energized, but they've been burned by overpromising products. They respond to evidence, mechanism, and honesty — not miracle claims.

Tone & feel: Clear, warm, credible, never hypey. Grounded and reassuring. Confident without shouting. We'd rather under-promise and explain than over-promise and dazzle.

How we write:
- Short, plain sentences. One idea per line. Sound like a smart person talking, not a brochure.
- Lead with the human moment or tension (the 3pm crash, the racing-mind bedtime), then bring in the mushroom and the simple mechanism.
- Name the mushroom (lion's mane, reishi, cordyceps) and the function it supports (focus, a calm evening, steady energy). Keep it honest.
- Prefer concrete over abstract: "the foggy hour after lunch" beats "cognitive optimization."
- Emoji: 0–1, sparing. Never emoji-stuff.

Words we use: supports, helps, may support, part of a routine, gentle, steady, clarity, calm, focus, grounded, daily ritual.
Words we avoid: cure, treat, heal, fix, detox, miracle, "boost" as a cure-all, "game-changer," "doctors hate this," superlatives, fearmongering, exclamation-heavy hype.

Claims posture: Evidence-forward and humble. Structure/function only. When the science is early, say "early research suggests" rather than implying certainty.

Format conventions:
- Hook: one specific, scroll-stopping line — a relatable tension or a surprising-but-true fact. No clickbait.
- Carousel slides: one clear idea each, building logically, ending on a soft, non-pushy CTA ("If your evenings feel wired, reishi might be worth a look.").
- Caption: warm and conversational, 2–4 short sentences, then the FDA disclaimer when a benefit is stated.
- Hashtags: 4–8, relevant and unhyped (#functionalmushrooms #lionsmane #focus #wellnessroutine). No spammy walls.

Signature feel: If a post could come from any supplement brand, it's wrong. It should sound like a thoughtful physician-founder who respects the reader's intelligence.`;

/**
 * Compose the Amplifier system prompt from the (editable) brand voice plus the
 * fixed compliance rules and output contract. Per-run `instructions` are NOT
 * placed here — they ride in the user turn so they steer one batch without
 * redefining the brand.
 */
export function buildAmplifierSystemPrompt(opts?: {
  guidelines?: string;
}): string {
  const guidelines =
    (opts?.guidelines ?? "").trim() || DEFAULT_BRAND_VOICE_GUIDELINES;
  return [
    `You are the social-content-creator for Mushnoom, a physician-founded functional-mushroom wellness brand.`,
    ``,
    `BRAND VOICE — write everything in this voice:`,
    guidelines,
    ``,
    CLAIMS_RULES,
    ``,
    `Return ONLY structured JSON matching the provided schema. For every claim you make, also populate claims_flags with anything a compliance reviewer should double-check.`,
  ].join("\n");
}

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
  // Default prompt (default voice). /api/generate overrides systemPrompt with
  // the client's saved brand voice composed via buildAmplifierSystemPrompt().
  systemPrompt: buildAmplifierSystemPrompt(),
  outputSchema: AMPLIFIER_OUTPUT_SCHEMA,
  maxTokens: 2048,
};
