import { NextResponse } from "next/server";
import { amplifierConfig } from "@/lib/agents/amplifier.config";
import { runAgent } from "@/lib/agents/runAgent";
import { isAnthropicConfigured, QuotaExceededError } from "@/lib/agents/anthropic";
import {
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
  const { sourceId, formats, platform, pillar, replaceId } = body;
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

  try {
    // One Amplifier call per requested format so each draft is purpose-built.
    const drafts: DraftInput[] = [];
    for (const format of formats) {
      const { data } = await runAgent<AmplifierOutput>(
        amplifierConfig,
        buildInput({ format, platform, pillar, transcript: source.transcript }),
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
}): string {
  const formatHint =
    args.format === "carousel"
      ? "A 5–7 slide carousel: a strong hook slide, then one idea per slide, ending on a soft CTA."
      : args.format === "reel"
      ? "A short-form reel: the hook is the on-screen/spoken opener; slides are the shot-by-shot script beats. The spoken words are claims too."
      : "A single static post: put the whole idea in the hook; leave slides empty.";

  return [
    `Create one ${args.format} for ${args.platform}.`,
    `Content pillar: ${args.pillar}.`,
    `Format guidance: ${formatHint}`,
    `Draw only from the source material below — do not invent facts or benefits not supported by it.`,
    ``,
    `SOURCE MATERIAL:`,
    args.transcript,
  ].join("\n");
}
