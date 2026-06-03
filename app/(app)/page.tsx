import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { Badge } from "@/components/Badge";
import { DECISIONS, METRIC_CARDS, THIS_WEEK } from "@/lib/mock/data";
import type { Decision } from "@/lib/types";

const DECISION_TONE: Record<Decision["status"], "ok" | "warn" | "bad" | "neutral"> = {
  win: "ok",
  loss: "bad",
  inconclusive: "warn",
  pending: "neutral",
};

const DECISION_LABEL: Record<Decision["status"], string> = {
  win: "Win",
  loss: "Loss",
  inconclusive: "Inconclusive",
  pending: "Measuring",
};

export default function OverviewPage() {
  return (
    <div>
      <PageHeader
        title="Overview"
        subtitle="Mushnoom · the numbers, and every decision behind them"
      />

      <div className="mx-auto max-w-content space-y-8 px-8 py-8">
        {/* Metric cards */}
        <section>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {METRIC_CARDS.map((m) => (
              <MetricCard key={m.key} data={m} />
            ))}
          </div>
        </section>

        {/* This week */}
        <section className="card divide-x divide-line/70 grid grid-cols-2 sm:grid-cols-4">
          <WeekStat label="Published this week" value={THIS_WEEK.published} />
          <WeekStat
            label="Awaiting review"
            value={THIS_WEEK.awaitingReview}
            href="/review"
          />
          <WeekStat label="Scheduled" value={THIS_WEEK.scheduled} href="/calendar" />
          <WeekStat label="Generated today" value={THIS_WEEK.generatedToday} href="/generator" />
        </section>

        {/* Decision log — the moat */}
        <section>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-sm font-medium text-ink">Decision log</h2>
              <p className="text-xs text-muted">
                Every change, the data behind it, and what it did. This record is the moat.
              </p>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="border-hair-b grid grid-cols-12 gap-4 px-5 py-3 text-[11px] uppercase tracking-wide text-faint">
              <div className="col-span-2">Date</div>
              <div className="col-span-4">Change (lever)</div>
              <div className="col-span-3">Data behind it</div>
              <div className="col-span-3">Result</div>
            </div>
            {DECISIONS.map((d) => (
              <div
                key={d.id}
                className="border-hair-b grid grid-cols-12 gap-4 px-5 py-4 text-sm last:border-b-0"
              >
                <div className="col-span-2 text-muted">{formatDate(d.date)}</div>
                <div className="col-span-4 text-ink">{d.lever}</div>
                <div className="col-span-3 text-muted">{d.rationale}</div>
                <div className="col-span-3">
                  <div className="text-ink">{d.actual ?? d.predicted}</div>
                  <div className="mt-1">
                    <Badge tone={DECISION_TONE[d.status]}>{DECISION_LABEL[d.status]}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function WeekStat({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href?: string;
}) {
  const inner = (
    <div className="px-5 py-5">
      <div className="text-2xl font-medium tracking-tight text-ink">{value}</div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
  return href ? (
    <Link href={href} className="transition-colors hover:bg-canvas">
      {inner}
    </Link>
  ) : (
    inner
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
