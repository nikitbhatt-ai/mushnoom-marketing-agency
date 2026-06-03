import type { ClaimsVerdict, ContentStatus } from "@/lib/types";

/** Small flat label. No shadow, hairline border, sentence case. */
export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "ok" | "warn" | "bad" | "info";
}) {
  const tones: Record<string, string> = {
    neutral: "text-muted border-line bg-canvas",
    ok: "text-ok border-ok/30 bg-ok/5",
    warn: "text-warn border-warn/30 bg-warn/5",
    bad: "text-bad border-bad/30 bg-bad/5",
    info: "text-ink border-line bg-canvas",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${tones[tone]}`}
      style={{ borderWidth: "0.5px" }}
    >
      {children}
    </span>
  );
}

/** Claims-compliance badge (Spec §5.2/§5.3): ok / review claim. */
export function ClaimsBadge({ verdict }: { verdict: ClaimsVerdict }) {
  if (verdict === "ok") {
    return <Badge tone="ok">● Claims ok</Badge>;
  }
  return <Badge tone="warn">▲ Review claim</Badge>;
}

const STATUS_LABEL: Record<ContentStatus, string> = {
  draft: "Draft",
  in_review: "In review",
  approved: "Approved",
  scheduled: "Scheduled",
  posted: "Posted",
  rejected: "Rejected",
};

const STATUS_TONE: Record<ContentStatus, "neutral" | "ok" | "warn" | "bad" | "info"> = {
  draft: "neutral",
  in_review: "warn",
  approved: "info",
  scheduled: "info",
  posted: "ok",
  rejected: "bad",
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>;
}

/** Platform chip for the calendar + cards. */
export function PlatformChip({ platform }: { platform: string }) {
  const label = platform === "instagram" ? "Instagram" : platform === "tiktok" ? "TikTok" : platform;
  return <Badge tone="neutral">{label}</Badge>;
}
