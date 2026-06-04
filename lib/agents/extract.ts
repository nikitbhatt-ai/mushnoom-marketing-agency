// Source extraction for ingestion (Phase 4 slice feeding Phase 3).
//
// Turns a raw input — an uploaded PDF, or text fetched from a research URL —
// into clean plain-text source material the Amplifier can draft from. We send
// PDFs to Claude as native document blocks (Claude reads PDFs directly), so we
// don't hand-build PDF parsing — orchestrate, don't build (hard rule 5).
//
// Like every model call, this logs tokens + cost and respects the quota.

import { getServiceClient } from "@/lib/db/supabase";
import {
  assertWithinQuota,
  estimateCost,
  getAnthropic,
  logUsage,
} from "./anthropic";

const EXTRACT_MODEL = "claude-haiku-4-5-20251001";

const EXTRACT_SYSTEM = `You extract the substantive content from a document so it can be used as raw source material for social media drafting.

Return ONLY the cleaned text: the key facts, findings, claims, quotes, and ingredient/benefit details. Drop boilerplate, navigation, citations clutter, cookie notices, and ads. Do not summarize away specifics (numbers, study findings, mechanisms) — those are the useful raw material. Do not add commentary of your own.`;

export type ExtractInput =
  | { kind: "pdf"; base64: string }
  | { kind: "text"; text: string };

export interface ExtractResult {
  text: string;
  usage: { tokensIn: number; tokensOut: number; cost: number };
}

/** Extract clean source text from a PDF or raw page text. */
export async function extractSourceText(
  input: ExtractInput,
  clientId: string
): Promise<ExtractResult> {
  const anthropic = getAnthropic();
  const db = getServiceClient();
  if (!anthropic) throw new Error("ANTHROPIC_API_KEY is not set.");
  if (!db) throw new Error("Supabase is not configured; cannot log usage.");

  await assertWithinQuota(db, clientId);

  const content =
    input.kind === "pdf"
      ? [
          {
            type: "document" as const,
            source: {
              type: "base64" as const,
              media_type: "application/pdf" as const,
              data: input.base64,
            },
          },
          {
            type: "text" as const,
            text: "Extract the substantive source text from this document.",
          },
        ]
      : [
          {
            type: "text" as const,
            text: `Extract the substantive source text from this page content:\n\n${input.text.slice(
              0,
              120_000
            )}`,
          },
        ];

  const message = await anthropic.messages.create({
    model: EXTRACT_MODEL,
    max_tokens: 4096,
    system: EXTRACT_SYSTEM,
    messages: [{ role: "user", content }],
  });

  const tokensIn = message.usage.input_tokens;
  const tokensOut = message.usage.output_tokens;
  const cost = estimateCost(EXTRACT_MODEL, tokensIn, tokensOut);
  await logUsage(db, clientId, "extractor", EXTRACT_MODEL, {
    tokensIn,
    tokensOut,
    cost,
  });

  const text = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("\n")
    .trim();

  return { text, usage: { tokensIn, tokensOut, cost } };
}
