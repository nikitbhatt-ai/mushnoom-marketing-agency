// Shared Anthropic plumbing for every model call (Phase 3).
//
// WHY this lives in one file: hard rule 4 says we log tokens + cost to usage_log
// on EVERY model call and enforce a per-client quota. If each agent did that on
// its own, someone would eventually forget. So the client, the cost math, the
// quota check, and the usage write all live here — runAgent and the ingest
// extractor both go through these helpers and can't skip them.

import Anthropic from "@anthropic-ai/sdk";
import { AnthropicVertex } from "@anthropic-ai/vertex-sdk";
import { query } from "@/lib/db/postgres";

/**
 * Claude client. Two backends, same `.messages.create` surface:
 *
 *  - Vertex AI (GCP): set ANTHROPIC_VERTEX_PROJECT_ID + CLOUD_ML_REGION. Claude
 *    is billed through your Google Cloud invoice and authenticates via the
 *    runtime service account's Application Default Credentials — no API key.
 *    Claude must be enabled in Vertex Model Garden first, and model IDs may take
 *    a Vertex-specific form (override per-agent via env if needed — see below).
 *  - Direct Anthropic API: set ANTHROPIC_API_KEY. Separate Anthropic invoice.
 *
 * Vertex wins when both are set, so flipping to GCP billing is one env var.
 */

// A Vertex client and a direct client expose the same messages API; this union
// lets the rest of the app stay backend-agnostic.
export type ClaudeClient = Anthropic | AnthropicVertex;

const vertexProject = process.env.ANTHROPIC_VERTEX_PROJECT_ID;
const vertexRegion = process.env.CLOUD_ML_REGION ?? process.env.ANTHROPIC_VERTEX_REGION;

/** Lazy singleton. Returns null when neither backend is configured, so callers
 * can fall back to the prototype's simulated path instead of crashing. */
let cached: ClaudeClient | null = null;
export function getAnthropic(): ClaudeClient | null {
  if (!isAnthropicConfigured()) return null;
  if (!cached) {
    if (vertexProject) {
      // ADC is picked up from the environment (the VM/Cloud Run service account).
      cached = new AnthropicVertex({
        projectId: vertexProject,
        region: vertexRegion ?? "us-central1",
      });
    } else {
      cached = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
  }
  return cached;
}

export function isAnthropicConfigured(): boolean {
  // Vertex needs a project (+ ADC, which we can't check here); direct needs a key.
  return Boolean(vertexProject || process.env.ANTHROPIC_API_KEY);
}

/**
 * Map a logical model id to the string the backend expects. Vertex sometimes
 * uses suffixed publisher ids; allow per-model overrides via env
 * (e.g. VERTEX_MODEL_CLAUDE_OPUS_4_8="claude-opus-4-8@20260...") without
 * touching agent configs. Defaults to the logical id on both backends.
 */
export function resolveModel(model: string): string {
  if (!vertexProject) return model;
  const envKey = `VERTEX_MODEL_${model.toUpperCase().replace(/[-.]/g, "_")}`;
  return process.env[envKey] ?? model;
}

/** Per-client monthly spend cap (USD). Override with MONTHLY_COST_QUOTA_USD. */
export const PER_CLIENT_MONTHLY_QUOTA_USD = Number(
  process.env.MONTHLY_COST_QUOTA_USD ?? 50
);

// Approximate list prices, USD per 1M tokens. Used for cost logging + quota
// only — not billing. Keep in sync with the models we actually call.
const PRICING: Record<string, { in: number; out: number }> = {
  "claude-opus-4-8": { in: 15, out: 75 },
  "claude-sonnet-4-6": { in: 3, out: 15 },
  "claude-haiku-4-5-20251001": { in: 1, out: 5 },
};

export function estimateCost(
  model: string,
  tokensIn: number,
  tokensOut: number
): number {
  const p = PRICING[model] ?? PRICING["claude-sonnet-4-6"];
  return (tokensIn * p.in + tokensOut * p.out) / 1_000_000;
}

export class QuotaExceededError extends Error {
  constructor(public spentUsd: number, public capUsd: number) {
    super(
      `Monthly model-cost quota reached for this client ($${spentUsd.toFixed(
        2
      )} of $${capUsd.toFixed(2)}). New generation is paused until next month.`
    );
    this.name = "QuotaExceededError";
  }
}

/** Sum this client's model cost for the current calendar month. */
async function monthlySpend(clientId: string): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);
  try {
    const rows = await query<{ total: string | null }>(
      `select coalesce(sum(cost), 0) as total from usage_log
       where client_id = $1 and created_at >= $2`,
      [clientId, startOfMonth.toISOString()]
    );
    return Number(rows[0]?.total ?? 0);
  } catch {
    return 0;
  }
}

/** Throw QuotaExceededError if the client is already over its monthly cap. */
export async function assertWithinQuota(clientId: string): Promise<void> {
  const spent = await monthlySpend(clientId);
  if (spent >= PER_CLIENT_MONTHLY_QUOTA_USD) {
    throw new QuotaExceededError(spent, PER_CLIENT_MONTHLY_QUOTA_USD);
  }
}

export interface Usage {
  tokensIn: number;
  tokensOut: number;
  cost: number;
}

/** Write one usage_log row (hard rule 4). Best-effort: a logging failure must
 * not lose the work we just paid for, so we swallow and warn. */
export async function logUsage(
  clientId: string,
  agent: string,
  model: string,
  usage: Usage
): Promise<void> {
  try {
    await query(
      `insert into usage_log (client_id, agent, model, tokens_in, tokens_out, cost)
       values ($1, $2, $3, $4, $5, $6)`,
      [clientId, agent, model, usage.tokensIn, usage.tokensOut, usage.cost]
    );
  } catch (err) {
    console.warn("usage_log insert failed:", (err as Error).message);
  }
}
