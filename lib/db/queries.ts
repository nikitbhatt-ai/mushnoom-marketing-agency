import { isDbConfigured, query } from "./postgres";
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
 * The data layer (Phase 2). Server-side reads from Cloud SQL for PostgreSQL (the
 * system of record) via the `pg` driver. When DATABASE_URL isn't set, every
 * function falls back to lib/mock/data so the Phase 1 demo keeps working and the
 * build never breaks. Add the env var and the same screens render live data.
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
    // SQL join surfaces the linked file's Drive id as a flat column.
    sourceFileName: r.source_file_drive_id
      ? driveNameFor(r.source_file_drive_id)
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

// The content-item select always left-joins source_files so the mapper can show
// a friendly file name. Defined once so reads and write-returns stay identical.
const CONTENT_SELECT = `
  select ci.*, sf.drive_file_id as source_file_drive_id
  from content_items ci
  left join source_files sf on sf.id = ci.source_file_id`;

export async function getContentItems(): Promise<ContentItem[]> {
  if (!isDbConfigured()) return MOCK_CONTENT;
  try {
    const rows = await query(`${CONTENT_SELECT} order by ci.created_at desc`);
    return rows.map(rowToContentItem);
  } catch (err) {
    console.warn("getContentItems failed:", (err as Error).message);
    return MOCK_CONTENT;
  }
}

/** Fetch a single content item by id (live only — render needs the real row). */
export async function getContentItemById(
  id: string
): Promise<ContentItem | null> {
  if (!isDbConfigured()) return null;
  try {
    const rows = await query(`${CONTENT_SELECT} where ci.id = $1`, [id]);
    return rows[0] ? rowToContentItem(rows[0]) : null;
  } catch (err) {
    console.warn("getContentItemById failed:", (err as Error).message);
    return null;
  }
}

export async function getSourceFiles(): Promise<SourceFile[]> {
  if (!isDbConfigured()) return MOCK_SOURCES;
  try {
    const rows = await query(
      `select * from source_files order by ingested_at desc`
    );
    return rows.map(rowToSourceFile);
  } catch (err) {
    console.warn("getSourceFiles failed:", (err as Error).message);
    return MOCK_SOURCES;
  }
}

export async function getSourceFileById(id: string): Promise<SourceFile | null> {
  if (!isDbConfigured()) return null;
  try {
    const rows = await query(`select * from source_files where id = $1`, [id]);
    return rows[0] ? rowToSourceFile(rows[0]) : null;
  } catch (err) {
    console.warn("getSourceFileById failed:", (err as Error).message);
    return null;
  }
}

export async function getDecisions(): Promise<Decision[]> {
  if (!isDbConfigured()) return MOCK_DECISIONS;
  try {
    const rows = await query(`select * from decisions order by date desc`);
    return rows.map(rowToDecision);
  } catch (err) {
    console.warn("getDecisions failed:", (err as Error).message);
    return MOCK_DECISIONS;
  }
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
  if (!isDbConfigured()) return MOCK_METRICS;

  let data: { metric: string; value: number }[];
  try {
    data = await query(
      `select metric, value, captured_at from metrics_log
       order by captured_at desc`
    );
  } catch (err) {
    console.warn("getMetricCards failed:", (err as Error).message);
    return MOCK_METRICS;
  }

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
  if (!isDbConfigured()) return MOCK_WEEK;

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
  if (!isDbConfigured()) return null;
  try {
    const rows = await query<{ id: string }>(
      `select id from clients order by created_at asc limit 1`
    );
    return rows[0]?.id ?? null;
  } catch (err) {
    console.warn("getDefaultClientId failed:", (err as Error).message);
    return null;
  }
}

/**
 * Read the operating client's brand voice (the editable "skill"). Falls back to
 * the default Mushnoom voice when nothing is stored or Supabase isn't configured,
 * so generation and the editor always have something to work with.
 */
export async function getClientBrandVoice(): Promise<BrandVoice> {
  if (!isDbConfigured()) return { guidelines: DEFAULT_BRAND_VOICE_GUIDELINES };
  try {
    const rows = await query<{ brand_voice: Partial<BrandVoice> | null }>(
      `select brand_voice from clients order by created_at asc limit 1`
    );
    const bv = rows[0]?.brand_voice ?? null;
    if (!bv) return { guidelines: DEFAULT_BRAND_VOICE_GUIDELINES };
    return {
      tone: bv.tone,
      claims: bv.claims,
      guidelines: (bv.guidelines ?? "").trim() || DEFAULT_BRAND_VOICE_GUIDELINES,
    };
  } catch (err) {
    console.warn("getClientBrandVoice failed:", (err as Error).message);
    return { guidelines: DEFAULT_BRAND_VOICE_GUIDELINES };
  }
}

/**
 * Save an edited brand voice to the operating client. Preserves the legacy
 * tone/claims summary fields and only replaces `guidelines`.
 */
export async function updateClientBrandVoice(
  guidelines: string
): Promise<BrandVoice> {
  if (!isDbConfigured()) throw new Error("Cloud SQL is not configured.");
  const clientId = await getDefaultClientId();
  if (!clientId) throw new Error("No client to update.");
  const existing = await query<{ brand_voice: Record<string, unknown> | null }>(
    `select brand_voice from clients where id = $1`,
    [clientId]
  );
  const prev = existing[0]?.brand_voice ?? {};
  const next = { ...prev, guidelines };
  await query(`update clients set brand_voice = $1::jsonb where id = $2`, [
    JSON.stringify(next),
    clientId,
  ]);
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
  if (!isDbConfigured()) throw new Error("Cloud SQL is not configured.");
  const rows = await query(
    `insert into source_files (client_id, name, source, type, transcript)
     values ($1, $2, $3, 'doc', $4)
     returning *`,
    [input.clientId, input.name, input.source, input.transcript]
  );
  if (!rows[0]) throw new Error("insert failed");
  return rowToSourceFile(rows[0]);
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
  if (!isDbConfigured()) throw new Error("Cloud SQL is not configured.");
  const existing = await query<{ copy: Record<string, unknown> | null }>(
    `select copy from content_items where id = $1`,
    [id]
  );
  const prevCopy = existing[0]?.copy ?? {};
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
  // Editing copy can change claims, so it must be re-checked by a human. The CTE
  // updates the row, then re-joins source_files so the mapper gets the file name.
  const rows = await query(
    `with updated as (
       update content_items set copy = $1::jsonb, claims_checked = false
       where id = $2 returning *
     )
     select u.*, sf.drive_file_id as source_file_drive_id
     from updated u
     left join source_files sf on sf.id = u.source_file_id`,
    [JSON.stringify(nextCopy), id]
  );
  if (!rows[0]) throw new Error("update failed");
  return rowToContentItem(rows[0]);
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
  if (!isDbConfigured()) throw new Error("Cloud SQL is not configured.");
  const existing = await query<{ copy: Record<string, unknown> | null }>(
    `select copy from content_items where id = $1`,
    [id]
  );
  const prevCopy = existing[0]?.copy ?? {};
  const nextCopy = { ...prevCopy, asset_urls: pageUrls };
  const rows = await query(
    `with updated as (
       update content_items set copy = $1::jsonb, asset_url = $2
       where id = $3 returning *
     )
     select u.*, sf.drive_file_id as source_file_drive_id
     from updated u
     left join source_files sf on sf.id = u.source_file_id`,
    [JSON.stringify(nextCopy), pageUrls[0] ?? null, id]
  );
  if (!rows[0]) throw new Error("asset update failed");
  return rowToContentItem(rows[0]);
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
  if (!isDbConfigured()) throw new Error("Cloud SQL is not configured.");
  if (drafts.length === 0) return [];

  // Build one multi-row INSERT. Each draft contributes 5 bound params; status,
  // claims_checked and approved_by are fixed literals so nothing here can move a
  // draft toward scheduled/posted (hard rules 1 & 3).
  const params: unknown[] = [];
  const values = drafts.map((d, i) => {
    const copy = {
      ...d.copy,
      pillar: d.pillar,
      claims_verdict: d.claimsVerdict,
      claims_flags: d.claimsFlags,
    };
    params.push(d.clientId, d.sourceFileId, d.format, d.platform, JSON.stringify(copy));
    const n = i * 5;
    return `($${n + 1}, $${n + 2}, $${n + 3}, $${n + 4}, 'draft', false, null, $${n + 5}::jsonb)`;
  });

  const rows = await query(
    `with inserted as (
       insert into content_items
         (client_id, source_file_id, format, platform, status, claims_checked, approved_by, copy)
       values ${values.join(", ")}
       returning *
     )
     select i.*, sf.drive_file_id as source_file_drive_id
     from inserted i
     left join source_files sf on sf.id = i.source_file_id`,
    params
  );
  if (!rows.length) throw new Error("insert failed");
  return rows.map(rowToContentItem);
}
