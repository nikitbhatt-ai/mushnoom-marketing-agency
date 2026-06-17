import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";

// Settings / Integrations (Phase 3). Rendering is now self-hosted (Satori → PNG
// in lib/render), so there's no Canva account to connect — every client gets
// on-brand carousels/statics with zero third-party setup. This page is where
// future integrations (a posting API, Shopify, etc.) will be wired in.

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Integrations and account configuration"
      />
      <div className="mx-auto max-w-content px-8 py-8 space-y-4">
        <div className="card p-6">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium text-ink">Rendering</h2>
                <Badge tone="ok">Built-in</Badge>
              </div>
              <p className="max-w-md text-sm text-muted">
                Carousels and statics are rendered in-app from brand templates, in
                Instagram/Facebook ratios (4:5, 1:1, 9:16). No Canva account or
                client setup required — it just works.
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="space-y-1">
            <h2 className="text-sm font-medium text-ink">Coming soon</h2>
            <p className="max-w-md text-sm text-muted">
              Posting API and commerce/analytics connections (Shopify, Klaviyo)
              will be connected here as those phases land.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
