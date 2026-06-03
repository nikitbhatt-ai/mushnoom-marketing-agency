import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";

// Stub (Spec §5.6). The monthly client one-pager: what changed, the data, the
// result, what's next. Built later (Phase 7) once metrics_log is flowing.
export default function ReportPage() {
  return (
    <div>
      <PageHeader
        title="Client report"
        subtitle="The monthly one-pager: what changed, the data, the result, what's next"
        action={<Badge tone="warn">Coming in Phase 7</Badge>}
      />
      <div className="mx-auto max-w-content px-8 py-8">
        <div className="card p-10">
          <div className="max-w-xl space-y-3">
            <p className="text-sm text-ink">
              A generated monthly report that turns the decision log and metrics into a
              clean one-pager for the client.
            </p>
            <p className="text-sm text-muted">
              Stubbed in the prototype. It depends on metrics_log ingestion (Phase 7),
              so it&apos;s built once real numbers are flowing from Shopify/Klaviyo and
              the channels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
