// Shared domain types — mirror lib/db/schema.sql.
// The front-end prototype (Phase 1) uses these against mock data; later phases
// reuse them for real Supabase reads/writes so the UI doesn't change shape.

export type ClientMode = "execution" | "strategy";

/** A client's editable brand voice. `guidelines` is the rich spec injected into
 * the Amplifier prompt on every generation; tone/claims are legacy summary fields. */
export interface BrandVoice {
  tone?: string;
  claims?: string;
  guidelines: string;
}

export type ContentFormat = "carousel" | "static" | "reel";

export type Platform = "instagram" | "tiktok";

export type ContentStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "scheduled"
  | "posted"
  | "rejected";

export type Pillar =
  | "education"
  | "product"
  | "founder"
  | "social_proof"
  | "lifestyle";

/** Claude's first-pass claims verdict on a piece of copy. */
export type ClaimsVerdict = "ok" | "review_claim";

export interface ClaimsFlag {
  /** Where the questionable language lives. */
  location: string; // e.g. "slide 2", "caption", "transcript 00:14"
  /** The exact phrase that tripped the check. */
  excerpt: string;
  /** Why it was flagged, in plain language. */
  reason: string;
  severity: "low" | "high";
}

export interface ContentCopy {
  hook: string;
  slides: string[];
  caption: string;
  hashtags: string[];
}

export interface ContentItem {
  id: string;
  clientId: string;
  sourceFileId: string | null;
  sourceFileName?: string;
  format: ContentFormat;
  platform: Platform;
  pillar: Pillar;
  copy: ContentCopy;
  /** Cover image (page 1) of the most recent render, or null. */
  assetUrl: string | null;
  /** Every rendered page in order. Omitted/empty until the item is rendered. */
  assetUrls?: string[];
  status: ContentStatus;
  scheduledFor: string | null; // ISO date
  postedAt: string | null;
  claimsChecked: boolean;
  claimsVerdict: ClaimsVerdict;
  claimsFlags: ClaimsFlag[];
  approvedBy: string | null;
  createdAt: string;
}

export interface SourceFile {
  id: string;
  clientId: string;
  name: string;
  type: "video" | "audio" | "image" | "doc";
  driveFileId: string;
  transcript: string;
  durationSec?: number;
  ingestedAt: string;
}

export interface MetricCardData {
  key: string;
  label: string;
  value: string;
  /** Signed delta vs prior period, already formatted (e.g. "+3.2pts"). */
  delta: string;
  direction: "up" | "down" | "flat";
  /** Whether "up" is good for this metric (CAC up is bad). */
  goodDirection: "up" | "down";
  caption: string;
}

export interface Decision {
  id: string;
  date: string; // ISO date
  lever: string; // what changed
  rationale: string; // the number behind it
  predicted: string; // what we expected
  actual: string | null; // what happened (null = still measuring)
  status: "pending" | "win" | "loss" | "inconclusive";
}
