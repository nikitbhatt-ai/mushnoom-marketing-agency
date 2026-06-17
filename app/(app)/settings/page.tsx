import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { getDefaultClientId } from "@/lib/db/queries";
import {
  getConnectionStatus,
  isCanvaOAuthConfigured,
} from "@/lib/integrations/canva-oauth";

// Settings / Integrations (Phase 3). Where a client connects the third-party
// accounts the pipeline orchestrates. First one: Canva, for rendering.
// Connecting is a click: this links to /api/canva/connect, which runs OAuth and
// stores the client's tokens server-side (auto-refreshed). No tokens in the UI.

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ canva?: string; detail?: string }>;
}) {
  const sp = await searchParams;
  const configured = isCanvaOAuthConfigured();
  const clientId = configured ? await getDefaultClientId() : null;
  const status = clientId
    ? await getConnectionStatus(clientId)
    : { connected: false };

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Connect the accounts the pipeline orchestrates"
      />
      <div className="mx-auto max-w-content px-8 py-8 space-y-4">
        {sp.canva === "connected" && (
          <div className="card border-l-4 border-l-green-600 p-4 text-sm text-ink">
            ✅ Canva connected. Rendering is ready.
          </div>
        )}
        {sp.canva === "error" && (
          <div className="card border-l-4 border-l-red-600 p-4 text-sm text-ink">
            Couldn&apos;t connect Canva{sp.detail ? `: ${sp.detail}` : ""}. Try again.
          </div>
        )}

        <div className="card p-6">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium text-ink">Canva</h2>
                {status.connected ? (
                  <Badge tone="ok">Connected</Badge>
                ) : (
                  <Badge tone="warn">Not connected</Badge>
                )}
              </div>
              <p className="max-w-md text-sm text-muted">
                Renders approved copy into on-brand carousels and statics from your
                Canva brand templates. Connect once — the app keeps the connection
                fresh automatically.
              </p>
              {status.connected && status.expiresAt && (
                <p className="text-xs text-faint">
                  Access token refreshes automatically (current one valid until{" "}
                  {new Date(status.expiresAt).toLocaleString()}).
                </p>
              )}
            </div>
            <div className="shrink-0">
              {!configured ? (
                <span className="text-xs text-faint">
                  Set CANVA_CLIENT_ID / SECRET / REDIRECT_URI
                </span>
              ) : (
                <a
                  href="/api/canva/connect"
                  className="inline-flex items-center rounded-md bg-ink px-4 py-2 text-sm font-medium text-surface transition-opacity hover:opacity-90"
                >
                  {status.connected ? "Reconnect" : "Connect Canva"}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
