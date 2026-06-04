import { NextResponse } from "next/server";
import {
  amplifierConfig,
  buildAmplifierSystemPrompt,
} from "@/lib/agents/amplifier.config";
import { runAgent } from "@/lib/agents/runAgent";
import { isAnthropicConfigured, QuotaExceededError } from "@/lib/agents/anthropic";
import {
  getClientBrandVoice,
  getDefaultClientId,
  getSourceFileById,
  insertContentDrafts,
  updateContentItemCopy,
  type DraftInput,
} from "@/lib/db/queries";
import type {
  ClaimsFlag,
  ContentFormat,
  Pillar,
  Platform,
} from "@/lib/types";

export const runtime = "nodejs";

// POST /api/generate — Phase 3 (generation).
// Runs the Amplifier (runAgent + amplifier.config + the skill) over a source's
// transcript and inserts real drafts into content_items as `draft`. Nothing here
// can schedule or post — that stays human-approved (hard rules 1 & 3).
//
// When the Anthropic key isn't configured we return 501 so the generator screen
// falls back to its simulated, mock-data preview (same graceful pattern as the
// Supabase data layer).

interface GenerateBody {
  sourceId: string;
  formats: ContentFormat[];
  platform: Platform;
  pillar: Pillar;
  /** Optional freeform steer for THIS batch (e.g. "punchier, lead with energy"). */
  instructions?: string;
  /** When set, re-run a single format INTO this existing draft (regenerate). */
  replaceId?: string;
}

/** Shape the Amplifier returns via its forced tool call. */
interface AmplifierOutput {
  hook: string;
  slides: string[];
  caption: string;
  hashtags: string[];
  claims_flags: ClaimsFlag[];
}

export async function POST(req: Request) {
  if (!isAnthropicConfigured()) {
    return NextResponse.json(
      { error: "Generation needs ANTHROPIC_API_KEY. Using simulated preview." },
      { status: 501 }
    );
  }

  let body: GenerateBody;
  try {
    body = (await req.json()) as GenerateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const { sourceId, formats, platform, pillar, instructions, replaceId } = body;
  if (!sourceId || !formats?.length) {
    return NextResponse.json(
      { error: "sourceId and at least one format are required." },
      { status: 400 }
    );
  }
  if (replaceId && formats.length !== 1) {
    return NextResponse.json(
      { error: "Regenerate expects exactly one format." },
      { status: 400 }
    );
  }

  const clientId = await getDefaultClientId();
  if (!clientId) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 501 }
    );
  }

  const source = await getSourceFileById(sourceId);
  if (!source) {
    return NextResponse.json({ error: "Source not found." }, { status: 404 });
  }
  if (!source.transcript.trim()) {
    return NextResponse.json(
      { error: "This source has no extracted text to draft from." },
      { status: 422 }
    );
  }

  // The client's saved brand voice (the editable "skill"). Falls back to the
  // default voice when none is stored. The per-format craft playbook is composed
  // on top of this inside the loop.
  const brandVoice = await getClientBrandVoice();

  try {
    // One Amplifier call per requested format so each draft is purpose-built —
    // and so the format's craft playbook is injected into the skill per call.
    const drafts: DraftInput[] = [];
    for (const format of formats) {
      const config = {
        ...amplifierConfig,
        systemPrompt: buildAmplifierSystemPrompt({
          guidelines: brandVoice.guidelines,
          format,
        }),
      };
      const { data } = await runAgent<AmplifierOutput>(
        config,
        buildInput({
          format,
          platform,
          pillar,
          transcript: source.transcript,
          instructions,
        }),
        clientId
      );
      const claimsFlags = data.claims_flags ?? [];
      drafts.push({
        clientId,
        sourceFileId: source.id,
        format,
        platform,
        pillar,
        copy: {
          hook: data.hook ?? "",
          slides: data.slides ?? [],
          caption: data.caption ?? "",
          hashtags: data.hashtags ?? [],
        },
        claimsVerdict: claimsFlags.length ? "review_claim" : "ok",
        claimsFlags,
      });
    }

    // Regenerate: write the single fresh draft back into the existing row so we
    // don't accumulate orphan drafts. Otherwise persist the batch as new drafts.
    if (replaceId) {
      const d = drafts[0];
      const updated = await updateContentItemCopy(replaceId, d.copy, {
        verdict: d.claimsVerdict,
        flags: d.claimsFlags,
      });
      return NextResponse.json({ drafts: [updated] });
    }

    const saved = await insertContentDrafts(drafts);
    return NextResponse.json({ drafts: saved });
  } catch (err) {
    if (err instanceof QuotaExceededError) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    const message = err instanceof Error ? err.message : "Generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function buildInput(args: {
  format: ContentFormat;
  platform: Platform;
  pillar: Pillar;
  transcript: string;
  instructions?: string;
}): string {
  // The rich per-format craft now lives in the skill (FORMAT_PLAYBOOKS, injected
  // into the system prompt), so the user turn just states the job and defers to
  // it — one source of truth, no contradictory guidance.
  const lines = [
    `Create one ${args.format} for ${args.platform}.`,
    `Content pillar: ${args.pillar}.`,
    `Follow the ${args.format} playbook in your instructions.`,
    `Draw only from the source material below — do not invent facts or benefits not supported by it.`,
  ];

  const steer = args.instructions?.trim();
  if (steer) {
    // Per-run steering. Stays subordinate to the brand voice and claims rules.
    lines.push(
      ``,
      `EXTRA INSTRUCTIONS FOR THIS PIECE (follow unless they conflict with the brand voice or claims rules):`,
      steer
    );
  }

  lines.push(``, `SOURCE MATERIAL:`, args.transcript);
  return lines.join("\n");
}
