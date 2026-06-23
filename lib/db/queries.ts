import { getServiceClient, isSupabaseConfigured } from "./supabase";
import { DEFAULT_BRAND_VOICE_GUIDELINES } from "@/lib/agents/amplifier.config";
import {
  CONTENT_ITEMS as MOCK_CONTENT,
  DECISIONS as MOCK_DECISIONS,
  METRIC_CARDS as MOCK_METRICS,
  SOURCE_FILES as MOCK_SOURCES,
  THIS_WEEK as MOCK_WEEK,
} from "@/lib/mock/data";
import type {
  BrandVoice,
  ContentItem,
  Decision,
  MetricCardData,
  SourceFile,
} from "@/lib/types";

/**
 * The data layer (Phase 2). Server-side reads from Supabase (the system of
 * record). When SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY aren't set, every
 * function falls back to lib/mock/data so the Phase 1 demo keeps working and the
 * build never breaks. Add the env vars and the same screens render live data.
 *
 * The UI is written against lib/types.ts, so mapping happens HERE and nowhere
 * else — the screens don't know or care whether data came from Postgres or mock.
 */

// --- row -> app type mappers -------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToContentItem(r: any): ContentItem {
  const copy = r.copy ?? {};
  return {
    id: r.id,
    clientId: r.client_id,
    sourceFileId: r.source_file_id,
    sourceFileName: r.source_files?.drive_file_id
      ? driveNameFor(r.source_files.drive_file_id)
      : undefined,
    format: r.format,
    platform: r.platform,
    pillar: copy.pillar ?? "education",
    copy: {
      hook: copy.hook ?? "",
      slides: copy.slides ?? [],
      caption: copy.caption ?? "",
      hashtags: copy.hashtags ?? [],
    },
    assetUrl: r.asset_url,
    assetUrls: copy.asset_urls ?? (r.asset_url ? [r.asset_url] : []),
    status: r.status,
    scheduledFor: r.scheduled_for,
    postedAt: r.posted_at,
    claimsChecked: r.claims_checked,
    claimsVerdict: copy.claims_verdict ?? "ok",
    claimsFlags: copy.claims_flags ?? [],
    approvedBy: r.approved_by,
    createdAt: r.created_at,
  };
}

// Friendly file names for the seeded Drive IDs (cosmetic until real Drive names land).
function driveNameFor(driveId: string): string {
  const map: Record<string, string> = {
    drive_abc123: "founder-lions-mane-morning.mp4",
    drive_def456: "reishi-evening-routine.mp4",
    drive_ghi789: "cordyceps-pre-workout.mp4",
    drive_jkl012: "ingredient-sourcing-doc.pdf",
  };
  return map[driveId] ?? driveId;
}

function rowToSourceFile(r: any): SourceFile {
  return {
    id: r.id,
    clientId: r.client_id,
    // Uploads/links carry a real name; seeded Drive rows derive a friendly one.
    name: r.name ?? driveNameFor(r.drive_file_id),
    type: r.type,
    driveFileId: r.drive_file_id ?? "",
    transcript: r.transcript ?? "",
    ingestedAt: r.ingested_at,
  };
}

function rowToDecision(r: any): Decision {
  return {
    id: r.id,
    date: r.date,
    lever: r.lever,
    rationale: r.rationale ?? "",
    predicted: r.predicted ?? "",
    actual: r.actual,
    status: r.status ?? "pending",
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// --- reads -------------------------------------------------------------------

export async function getContentItems(): Promise<ContentItem[]> {
  const db = getServiceClient();
  if (!db) return MOCK_CONTENT;
  const { data, error } = await db
    .from("content_items")
    .select("*, source_files(drive_file_id)")
    .order("created_at", { ascending: false });
  if (error || !data) return MOCK_CONTENT;
  return data.map(rowToContentItem);
}

/** Fetch a single content item by id (live only — render needs the real row). */
export async function getContentItemById(
  id: string
): Promise<ContentItem | null> {
  const db = getServiceClient();
  if (!db) return null;
  const { data, error } = await db
    .from("content_items")
    .select("*, source_files(drive_file_id)")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return rowToContentItem(data);
}

export async function getSourceFiles(): Promise<SourceFile[]> {
  const db = getServiceClient();
  if (!db) return MOCK_SOURCES;
  const { data, error } = await db
    .from("source_files")
    .select("*")
    .order("ingested_at", { ascending: false });
  if (error || !data) return MOCK_SOURCES;
  return data.map(rowToSourceFile);
}

export async function getSourceFileById(id: string): Promise<SourceFile | null> {
  const db = getServiceClient();
  if (!db) return null;
  const { data, error } = await db
    .from("source_files")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return rowToSourceFile(data);
}

export async function getDecisions(): Promise<Decision[]> {
  const db = getServiceClient();
  if (!db) return MOCK_DECISIONS;
  const { data, error } = await db
    .from("decisions")
    .select("*")
    .order("date", { ascending: false });
  if (error || !data) return MOCK_DECISIONS;
  return data.map(rowToDecision);
}

// --- metric cards: computed honestly from the metrics_log time series --------

interface MetricMeta {
  label: string;
  caption: string;
  goodDirection: "up" | "down";
  /** how to render the headline value */
  valueFmt: "percent" | "currency" | "currency2";
  /** how to render the delta */
  deltaFmt: "points" | "percent";
}

const METRIC_META: Record<string, MetricMeta> = {
  repeat_rate: {
    label: "Repeat purchase rate",
    caption: "60-day window vs prior 60 days",
    goodDirection: "up",
    valueFmt: "percent",
    deltaFmt: "points",
  },
  subscription_rate: {
    label: "Subscription rate",
    caption: "Subscribe-and-save on new orders",
    goodDirection: "up",
    valueFmt: "percent",
    deltaFmt: "points",
  },
  email_revenue: {
    label: "Email-attributed revenue",
    caption: "Klaviyo, last 30 days",
    goodDirection: "up",
    valueFmt: "currency",
    deltaFmt: "percent",
  },
  blended_cac: {
    label: "Blended CAC",
    caption: "All paid + organic, last 30 days",
    goodDirection: "down",
    valueFmt: "currency2",
    deltaFmt: "percent",
  },
};

const METRIC_ORDER = [
  "repeat_rate",
  "subscription_rate",
  "email_revenue",
  "blended_cac",
];

export async function getMetricCards(): Promise<MetricCardData[]> {
  const db = getServiceClient();
  if (!db) return MOCK_METRICS;

  const { data, error } = await db
    .from("metrics_log")
    .select("metric, value, captured_at")
    .order("captured_at", { ascending: false });
  if (error || !data) return MOCK_METRICS;

  // Group by metric, newest first; [0] is current, [1] is the prior snapshot.
  const byMetric: Record<string, { value: number }[]> = {};
  for (const row of data) {
    (byMetric[row.metric] ??= []).push({ value: Number(row.value) });
  }

  const cards: MetricCardData[] = [];
  for (const key of METRIC_ORDER) {
    const series = byMetric[key];
    const meta = METRIC_META[key];
    if (!series || !meta || series.length === 0) continue;

    const current = series[0].value;
    const prior = series[1]?.value ?? current;
    const diff = current - prior;
    const direction = diff > 0 ? "up" : diff < 0 ? "down" : "flat";

    cards.push({
      key,
      label: meta.label,
      value: formatValue(current, meta.valueFmt),
      delta: formatDelta(diff, prior, meta.deltaFmt),
      direction,
      goodDirection: meta.goodDirection,
      caption: meta.caption,
    });
  }
  return cards.length ? cards : MOCK_METRICS;
}

function formatValue(v: number, fmt: MetricMeta["valueFmt"]): string {
  if (fmt === "percent") return `${v.toFixed(1)}%`;
  if (fmt === "currency") return `$${Math.round(v).toLocaleString("en-US")}`;
  return `$${v.toFixed(2)}`; // currency2
}

function formatDelta(diff: number, prior: number, fmt: MetricMeta["deltaFmt"]): string {
  const sign = diff > 0 ? "+" : "";
  if (fmt === "points") return `${sign}${diff.toFixed(1)}pts`;
  const pct = prior !== 0 ? (diff / prior) * 100 : 0;
  return `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`;
}

// --- dashboard "this week" counts -------------------------------------------

export async function getDashboardCounts(): Promise<typeof MOCK_WEEK> {
  const items = await getContentItems();
  if (!isSupabaseConfigured()) return MOCK_WEEK;

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 864e5);
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const published = items.filter(
    (i) => i.status === "posted" && i.postedAt && new Date(i.postedAt) >= weekAgo
  ).length;
  const awaitingReview = items.filter((i) => i.status === "in_review").length;
  const scheduled = items.filter((i) => i.status === "scheduled").length;
  const generatedToday = items.filter(
    (i) => new Date(i.createdAt) >= startOfDay
  ).length;

  return { published, awaitingReview, scheduled, generatedToday };
}

// --- writes (Phase 3+) -------------------------------------------------------

/**
 * Resolve the client we operate for. Today there is exactly one (Mushnoom), so
 * we take the first row. When we run multiple brands this becomes a real lookup.
 * Returns null if Supabase isn't configured (callers should bail to the demo).
 */
export async function getDefaultClientId(): Promise<string | null> {
  const db = getServiceClient();
  if (!db) return null;
  const { data, error } = await db
    .from("clients")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data.id;
}

/**
 * Read the operating client's brand voice (the editable "skill"). Falls back to
 * the default Mushnoom voice when nothing is stored or Supabase isn't configured,
 * so generation and the editor always have something to work with.
 */
export async function getClientBrandVoice(): Promise<BrandVoice> {
  const db = getServiceClient();
  if (!db) return { guidelines: DEFAULT_BRAND_VOICE_GUIDELINES };
  const { data, error } = await db
    .from("clients")
    .select("brand_voice")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  const bv = (data?.brand_voice as Partial<BrandVoice> | null) ?? null;
  if (error || !bv) return { guidelines: DEFAULT_BRAND_VOICE_GUIDELINES };
  return {
    tone: bv.tone,
    claims: bv.claims,
    guidelines: (bv.guidelines ?? "").trim() || DEFAULT_BRAND_VOICE_GUIDELINES,
  };
}

/**
 * Save an edited brand voice to the operating client. Preserves the legacy
 * tone/claims summary fields and only replaces `guidelines`.
 */
export async function updateClientBrandVoice(
  guidelines: string
): Promise<BrandVoice> {
  const db = getServiceClient();
  if (!db) throw new Error("Supabase is not configured.");
  const clientId = await getDefaultClientId();
  if (!clientId) throw new Error("No client to update.");
  const { data: existing } = await db
    .from("clients")
    .select("brand_voice")
    .eq("id", clientId)
    .maybeSingle();
  const prev = (existing?.brand_voice as Record<string, unknown>) ?? {};
  const next = { ...prev, guidelines };
  const { error } = await db
    .from("clients")
    .update({ brand_voice: next })
    .eq("id", clientId);
  if (error) throw new Error(error.message);
  return {
    tone: prev.tone as string | undefined,
    claims: prev.claims as string | undefined,
    guidelines,
  };
}

/** Insert an ingested source (uploaded PDF or research link) and return it. */
export async function createSourceFile(input: {
  clientId: string;
  name: string;
  source: string; // 'upload' | 'url'
  transcript: string;
}): Promise<SourceFile> {
  const db = getServiceClient();
  if (!db) throw new Error("Supabase is not configured.");
  const { data, error } = await db
    .from("source_files")
    .insert({
      client_id: input.clientId,
      name: input.name,
      source: input.source,
      type: "doc",
      transcript: input.transcript,
    })
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message ?? "insert failed");
  return rowToSourceFile(data);
}

/**
 * Update an existing draft's copy in place. Used by manual edits and by
 * "regenerate" (which re-runs the Amplifier into the same row instead of leaving
 * an orphan draft behind). Preserves the pillar and any claims fields not passed.
 */
export async function updateContentItemCopy(
  id: string,
  copy: ContentItem["copy"],
  claims?: {
    verdict: ContentItem["claimsVerdict"];
    flags: ContentItem["claimsFlags"];
  }
): Promise<ContentItem> {
  const db = getServiceClient();
  if (!db) throw new Error("Supabase is not configured.");
  const { data: existing } = await db
    .from("content_items")
    .select("copy")
    .eq("id", id)
    .maybeSingle();
  const prevCopy = (existing?.copy as Record<string, unknown>) ?? {};
  const nextCopy: Record<string, unknown> = {
    ...prevCopy,
    hook: copy.hook,
    slides: copy.slides,
    caption: copy.caption,
    hashtags: copy.hashtags,
  };
  if (claims) {
    nextCopy.claims_verdict = claims.verdict;
    nextCopy.claims_flags = claims.flags;
  }
  // Editing copy can change claims, so it must be re-checked by a human.
  const { data, error } = await db
    .from("content_items")
    .update({ copy: nextCopy, claims_checked: false })
    .eq("id", id)
    .select("*, source_files(drive_file_id)")
    .single();
  if (error || !data) throw new Error(error?.message ?? "update failed");
  return rowToContentItem(data);
}

/**
 * Attach rendered asset URLs to an item. asset_url is a single column, but a
 * carousel is many pages, so the cover (page 1) goes in asset_url for previews
 * and the full ordered list lives in copy.asset_urls. Touches pixels only —
 * never copy, status, or the claims gate.
 */
export async function updateContentItemAssets(
  id: string,
  pageUrls: string[]
): Promise<ContentItem> {
  const db = getServiceClient();
  if (!db) throw new Error("Supabase is not configured.");
  const { data: existing } = await db
    .from("content_items")
    .select("copy")
    .eq("id", id)
    .maybeSingle();
  const prevCopy = (existing?.copy as Record<string, unknown>) ?? {};
  const nextCopy = { ...prevCopy, asset_urls: pageUrls };
  const { data, error } = await db
    .from("content_items")
    .update({ copy: nextCopy, asset_url: pageUrls[0] ?? null })
    .eq("id", id)
    .select("*, source_files(drive_file_id)")
    .single();
  if (error || !data) throw new Error(error?.message ?? "asset update failed");
  return rowToContentItem(data);
}

/** A draft to persist, as produced by the Amplifier for one format. */
export interface DraftInput {
  clientId: string;
  sourceFileId: string;
  format: ContentItem["format"];
  platform: ContentItem["platform"];
  pillar: ContentItem["pillar"];
  copy: ContentItem["copy"];
  claimsVerdict: ContentItem["claimsVerdict"];
  claimsFlags: ContentItem["claimsFlags"];
}

/**
 * Insert generated drafts into content_items. They always land as `draft` with
 * claims_checked=false — nothing here can move toward scheduled/posted, which
 * stays a human, approval-gated step (hard rules 1 & 3).
 */
export async function insertContentDrafts(
  drafts: DraftInput[]
): Promise<ContentItem[]> {
  const db = getServiceClient();
  if (!db) throw new Error("Supabase is not configured.");
  const rows = drafts.map((d) => ({
    client_id: d.clientId,
    source_file_id: d.sourceFileId,
    format: d.format,
    platform: d.platform,
    status: "draft",
    claims_checked: false,
    approved_by: null,
    copy: {
      ...d.copy,
      pillar: d.pillar,
      claims_verdict: d.claimsVerdict,
      claims_flags: d.claimsFlags,
    },
  }));
  const { data, error } = await db
    .from("content_items")
    .insert(rows)
    .select("*, source_files(drive_file_id)");
  if (error || !data) throw new Error(error?.message ?? "insert failed");
  return data.map(rowToContentItem);
}

/**
 * Move a draft into the review queue (status `draft` -> `in_review`). This is the
 * only forward transition this layer makes from the generator; approval,
 * scheduling and posting stay separate, human-gated steps (hard rules 1 & 3).
 * Safe to call twice: if the item already advanced, the current row is returned.
 */
export async function sendContentItemToReview(id: string): Promise<ContentItem> {
  const db = getServiceClient();
  if (!db) throw new Error("Supabase is not configured.");
  const { data, error } = await db
    .from("content_items")
    .update({ status: "in_review" })
    .eq("id", id)
    .eq("status", "draft")
    .select("*, source_files(drive_file_id)")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (data) return rowToContentItem(data);
  // Nothing updated — it wasn't a `draft` (e.g. already sent). Return as-is.
  const current = await getContentItemById(id);
  if (!current) throw new Error("Content item not found.");
  return current;
}
