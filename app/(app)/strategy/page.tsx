import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";

// Stub (Spec §5.5). Strategy-led mode: a structured Growth Architecture
// diagnostic that produces a strategy for clients who don't have one.
// Built later (Phase 7, Strategist agent). Nav item is present so the prototype
// shows the full surface area.
export default function StrategyPage() {
  return (
    <div>
      <PageHeader
        title="Strategy intake"
        subtitle="Strategy-led mode · the Growth Architecture diagnostic"
        action={<Badge tone="warn">Coming in Phase 7</Badge>}
      />
      <div className="mx-auto max-w-content px-8 py-8">
        <div className="card p-10">
          <div className="max-w-xl space-y-3">
            <p className="text-sm text-ink">
              For clients without a strategy, we start here: a productized diagnostic
              that produces a Growth Architecture before we execute.
            </p>
            <p className="text-sm text-muted">
              This screen is intentionally stubbed in the prototype. Mushnoom runs in
              execution-layer mode (it already has a CMO and a growth architecture), so
              the diagnostic isn&apos;t needed for the first deployment. It&apos;s wired
              in Phase 7 with the Strategist agent (Opus).
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li>• Structured intake form → positioning, ICP, offer, channel plan</li>
              <li>• Output: a Growth Architecture doc the execution layer then runs</li>
              <li>• Reuses runAgent() with a strategist config</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
