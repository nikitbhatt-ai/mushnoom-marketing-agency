// Shared Anthropic plumbing for every model call (Phase 3).
//
// WHY this lives in one file: hard rule 4 says we log tokens + cost to usage_log
// on EVERY model call and enforce a per-client quota. If each agent did that on
// its own, someone would eventually forget. So the client, the cost math, the
// quota check, and the usage write all live here — runAgent and the ingest
// extractor both go through these helpers and can't skip them.

import Anthropic from "@anthropic-ai/sdk";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Lazy singleton. Returns null when ANTHROPIC_API_KEY isn't set, so callers can
 * fall back to the prototype's simulated path instead of crashing. */
let cached: Anthropic | null = null;
export function getAnthropic(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  if (!cached) cached = new Anthropic({ apiKey });
  return cached;
}

export function isAnthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
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
async function monthlySpend(
  db: SupabaseClient,
  clientId: string
): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);
  const { data, error } = await db
    .from("usage_log")
    .select("cost")
    .eq("client_id", clientId)
    .gte("created_at", startOfMonth.toISOString());
  if (error || !data) return 0;
  return data.reduce((sum, r) => sum + Number(r.cost ?? 0), 0);
}

/** Throw QuotaExceededError if the client is already over its monthly cap. */
export async function assertWithinQuota(
  db: SupabaseClient,
  clientId: string
): Promise<void> {
  const spent = await monthlySpend(db, clientId);
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
  db: SupabaseClient,
  clientId: string,
  agent: string,
  model: string,
  usage: Usage
): Promise<void> {
  const { error } = await db.from("usage_log").insert({
    client_id: clientId,
    agent,
    model,
    tokens_in: usage.tokensIn,
    tokens_out: usage.tokensOut,
    cost: usage.cost,
  });
  if (error) console.warn("usage_log insert failed:", error.message);
}
