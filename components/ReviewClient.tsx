"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Badge, ClaimsBadge, PlatformChip } from "@/components/Badge";
import { canPublish } from "@/lib/guards";
import type { ContentItem } from "@/lib/types";

type Decision = "approved" | "rejected";

export function ReviewClient({ initial }: { initial: ContentItem[] }) {
  const [items, setItems] = useState<ContentItem[]>(initial);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});

  function decide(id: string, decision: Decision) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        if (decision === "approved") {
          // Approving = confirm claims check + set approver. This is what flips
          // canPublish() to true and lets it move toward the calendar.
          // Phase 5 persists this to Supabase via a server action.
          return {
            ...it,
            status: "approved",
            claimsChecked: true,
            approvedBy: "nikit@raemy.ai",
          };
        }
        return { ...it, status: "rejected" };
      })
    );
    setDecisions((prev) => ({ ...prev, [id]: decision }));
  }

  const pending = items.filter((it) => !decisions[it.id]);

  return (
    <div>
      <PageHeader
        title="Review queue"
        subtitle="Nothing schedules without a human approval and a confirmed claims check."
        action={
          <Badge tone={pending.length ? "warn" : "ok"}>
            {pending.length ? `${pending.length} awaiting review` : "All clear"}
          </Badge>
        }
      />

      <div className="mx-auto max-w-content space-y-4 px-8 py-8">
        {items.length === 0 && (
          <div className="card p-10 text-center text-sm text-muted">
            The queue is empty.
          </div>
        )}

        {items.map((item) => (
          <ReviewCard
            key={item.id}
            item={item}
            decision={decisions[item.id]}
            onDecide={decide}
          />
        ))}
      </div>
    </div>
  );
}

function ReviewCard({
  item,
  decision,
  onDecide,
}: {
  item: ContentItem;
  decision?: Decision;
  onDecide: (id: string, d: Decision) => void;
}) {
  const flagged = item.claimsVerdict === "review_claim";
  const publishable = canPublish(item);

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Badge tone="neutral">{capitalize(item.format)}</Badge>
          <PlatformChip platform={item.platform} />
          {item.sourceFileName && (
            <span className="text-xs text-faint">from {item.sourceFileName}</span>
          )}
        </div>
        <ClaimsBadge verdict={item.claimsVerdict} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <div className="text-sm font-medium text-ink">{item.copy.hook}</div>
          {item.format !== "static" && (
            <ol className="mt-3 space-y-1.5">
              {item.copy.slides.map((s, i) => (
                <li key={i} className="flex gap-2 text-xs text-muted">
                  <span className="text-faint">{i + 1}.</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          )}
          <div className="mt-3 text-xs leading-relaxed text-muted">
            {item.copy.caption}
          </div>
        </div>

        {/* Claims flags panel */}
        <div
          className="rounded-md p-4"
          style={{
            borderWidth: "0.5px",
            borderColor: flagged ? "rgba(154,107,0,0.3)" : "#e6e6e6",
            background: flagged ? "rgba(154,107,0,0.05)" : "#fafafa",
          }}
        >
          <div className="text-[11px] uppercase tracking-wide text-faint">
            Claims check
          </div>
          {flagged ? (
            <ul className="mt-2 space-y-3">
              {item.claimsFlags.map((f, i) => (
                <li key={i} className="text-xs">
                  <div className="flex items-center gap-2">
                    <Badge tone="bad">{f.severity === "high" ? "High" : "Low"}</Badge>
                    <span className="text-faint">{f.location}</span>
                  </div>
                  <div className="mt-1 text-ink">“{f.excerpt}”</div>
                  <div className="mt-1 text-muted">{f.reason}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-muted">
              No disease claims detected. Structure/function language only. FDA
              disclaimer present. A human still confirms before approval.
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex items-center justify-between border-hair-t pt-4">
        <div className="text-xs text-faint">
          {decision === "approved" && publishable && "Approved — eligible to schedule."}
          {decision === "rejected" && "Rejected — will not be scheduled."}
          {!decision &&
            (flagged
              ? "Fix the flagged claim (Edit) before approving."
              : "Confirm the claims check by approving.")}
        </div>
        <div className="flex items-center gap-2">
          {decision ? (
            <Badge tone={decision === "approved" ? "ok" : "bad"}>
              {decision === "approved" ? "Approved ✓" : "Rejected"}
            </Badge>
          ) : (
            <>
              <button
                onClick={() => onDecide(item.id, "rejected")}
                className="rounded-md px-3 py-1.5 text-xs text-muted hover:text-ink"
                style={{ borderWidth: "0.5px", borderColor: "#e6e6e6" }}
              >
                Reject
              </button>
              <button
                className="rounded-md px-3 py-1.5 text-xs text-muted hover:text-ink"
                style={{ borderWidth: "0.5px", borderColor: "#e6e6e6" }}
              >
                Edit
              </button>
              <button
                onClick={() => onDecide(item.id, "approved")}
                disabled={flagged}
                title={flagged ? "Resolve the flagged claim first." : undefined}
                className="rounded-md bg-ink px-3 py-1.5 text-xs text-white disabled:opacity-40"
              >
                Approve
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
