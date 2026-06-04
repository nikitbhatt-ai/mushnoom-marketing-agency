import { getServiceClient, isSupabaseConfigured } from "./supabase";
import {
  CONTENT_ITEMS as MOCK_CONTENT,
  DECISIONS as MOCK_DECISIONS,
  METRIC_CARDS as MOCK_METRICS,
  SOURCE_FILES as MOCK_SOURCES,
  THIS_WEEK as MOCK_WEEK,
} from "@/lib/mock/data";
import type {
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
    name: driveNameFor(r.drive_file_id),
    type: r.type,
    driveFileId: r.drive_file_id,
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
