"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Badge, ClaimsBadge, PlatformChip } from "@/components/Badge";
import { canPublish } from "@/lib/guards";
import {
  RENDER_TEMPLATES,
  type RenderTemplateKey,
} from "@/lib/render/templates";
import { SIZES, DEFAULT_ASPECT, type AspectKey } from "@/lib/render/sizes";
import type { ContentItem } from "@/lib/types";

const ASPECT_LABEL: Record<AspectKey, string> = {
  portrait: "Portrait 4:5",
  square: "Square 1:1",
  story: "Story 9:16",
};

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

  // Persist an inline edit back into local state. Editing copy clears the claims
  // check server-side, so reflect that here too — a human must re-confirm.
  function applyEdit(updated: ContentItem) {
    setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
  }

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
            onEdited={applyEdit}
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
  onEdited,
}: {
  item: ContentItem;
  decision?: Decision;
  onDecide: (id: string, d: Decision) => void;
  onEdited: (updated: ContentItem) => void;
}) {
  const flagged = item.claimsVerdict === "review_claim";
  const publishable = canPublish(item);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hook, setHook] = useState(item.copy.hook);
  const [slides, setSlides] = useState(item.copy.slides.join("\n"));
  const [caption, setCaption] = useState(item.copy.caption);
  const [hashtags, setHashtags] = useState(item.copy.hashtags.join(" "));

  function startEdit() {
    setHook(item.copy.hook);
    setSlides(item.copy.slides.join("\n"));
    setCaption(item.copy.caption);
    setHashtags(item.copy.hashtags.join(" "));
    setSaveError(null);
    setEditing(true);
  }

  async function saveEdit() {
    const copy = {
      hook: hook.trim(),
      slides: slides.split("\n").map((s) => s.trim()).filter(Boolean),
      caption: caption.trim(),
      hashtags: hashtags.split(/\s+/).filter(Boolean),
    };
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/content/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ copy }),
      });
      if (res.ok) {
        const { item: saved } = await res.json();
        onEdited(saved as ContentItem);
        setEditing(false);
      } else {
        const { error } = await res.json().catch(() => ({ error: "" }));
        // Keep the edit locally even if it couldn't persist (e.g. preview/mock).
        onEdited({ ...item, copy, claimsChecked: false });
        setEditing(false);
        if (res.status !== 501) setSaveError(error || `Save failed (${res.status}).`);
      }
    } catch {
      onEdited({ ...item, copy, claimsChecked: false });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

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

      {editing ? (
        <div className="mt-4 space-y-3">
          <EditField label="Hook">
            <input
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              className="w-full rounded-md px-2.5 py-1.5 text-sm text-ink outline-none"
              style={{ borderWidth: "0.5px", borderColor: "#e6e6e6" }}
            />
          </EditField>
          {item.format !== "static" && (
            <EditField label="Slides (one per line)">
              <textarea
                value={slides}
                onChange={(e) => setSlides(e.target.value)}
                rows={5}
                className="w-full rounded-md px-2.5 py-1.5 text-xs text-ink outline-none"
                style={{ borderWidth: "0.5px", borderColor: "#e6e6e6" }}
              />
            </EditField>
          )}
          <EditField label="Caption">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              className="w-full rounded-md px-2.5 py-1.5 text-xs text-ink outline-none"
              style={{ borderWidth: "0.5px", borderColor: "#e6e6e6" }}
            />
          </EditField>
          <EditField label="Hashtags (space-separated)">
            <input
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              className="w-full rounded-md px-2.5 py-1.5 text-xs text-ink outline-none"
              style={{ borderWidth: "0.5px", borderColor: "#e6e6e6" }}
            />
          </EditField>
          <p className="text-[11px] text-faint">
            Saving re-runs the claims gate — you’ll need to approve again.
          </p>
          {saveError && <p className="text-[11px] text-bad">{saveError}</p>}
        </div>
      ) : (
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
      )}

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
          {editing ? (
            <>
              <button
                onClick={() => setEditing(false)}
                disabled={saving}
                className="rounded-md px-3 py-1.5 text-xs text-muted hover:text-ink disabled:opacity-40"
                style={{ borderWidth: "0.5px", borderColor: "#e6e6e6" }}
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="rounded-md bg-ink px-3 py-1.5 text-xs text-white disabled:opacity-40"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </>
          ) : decision ? (
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
                onClick={startEdit}
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

      <RenderControls item={item} />
    </div>
  );
}

/** Render this item's copy into a brand template (in-app) and show the result. */
function RenderControls({ item }: { item: ContentItem }) {
  const options = (
    Object.entries(RENDER_TEMPLATES) as [
      RenderTemplateKey,
      (typeof RENDER_TEMPLATES)[RenderTemplateKey]
    ][]
  ).filter(([, t]) => t.format === item.format);

  const [templateKey, setTemplateKey] = useState<RenderTemplateKey | "">(
    options[0]?.[0] ?? ""
  );
  const [aspect, setAspect] = useState<AspectKey>(DEFAULT_ASPECT);
  const [status, setStatus] = useState<"idle" | "rendering" | "done" | "error">(
    "idle"
  );
  const [pages, setPages] = useState<string[]>(
    item.assetUrls?.length ? item.assetUrls : item.assetUrl ? [item.assetUrl] : []
  );
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [maxPages, setMaxPages] = useState(8); // total pages incl. the hook/cover

  const isDynamic = templateKey ? RENDER_TEMPLATES[templateKey].dynamic : false;

  if (options.length === 0) {
    return (
      <div className="mt-4 border-hair-t pt-4 text-xs text-faint">
        No Canva template for {item.format}s yet.
      </div>
    );
  }

  async function render() {
    if (!templateKey) return;
    setStatus("rendering");
    setError(null);
    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          templateKey,
          aspect,
          ...(isDynamic ? { maxPages } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Render failed.");
      const urls: string[] = data.item?.assetUrls?.length
        ? data.item.assetUrls
        : data.item?.assetUrl
        ? [data.item.assetUrl]
        : [];
      setPages(urls);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Render failed.");
      setStatus("error");
    }
  }

  // Force a real file download (the URLs are cross-origin, so the <a download>
  // attribute is ignored — fetch the bytes and save them via a blob URL).
  async function download(url: string, filename: string) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch {
      // Fall back to opening it; the user can still save manually.
      window.open(url, "_blank", "noreferrer");
    }
  }

  async function downloadAll() {
    setDownloading(true);
    try {
      for (let i = 0; i < pages.length; i++) {
        await download(pages[i], `mushnoom-${item.format}-${i + 1}.png`);
      }
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="mt-4 border-hair-t pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-wide text-faint">
          Render
        </span>
        <select
          value={templateKey}
          onChange={(e) => setTemplateKey(e.target.value as RenderTemplateKey)}
          className="rounded-md px-2 py-1 text-xs text-ink"
          style={{ borderWidth: "0.5px", borderColor: "#e6e6e6" }}
        >
          {options.map(([key, t]) => (
            <option key={key} value={key}>
              {t.title}
            </option>
          ))}
        </select>
        <select
          value={aspect}
          onChange={(e) => setAspect(e.target.value as AspectKey)}
          className="rounded-md px-2 py-1 text-xs text-ink"
          style={{ borderWidth: "0.5px", borderColor: "#e6e6e6" }}
        >
          {(Object.keys(SIZES) as AspectKey[]).map((k) => (
            <option key={k} value={k}>
              {ASPECT_LABEL[k]}
            </option>
          ))}
        </select>
        {isDynamic && (
          <label className="flex items-center gap-1.5 text-[11px] text-faint">
            Max slides
            <select
              value={maxPages}
              onChange={(e) => setMaxPages(Number(e.target.value))}
              className="rounded-md px-2 py-1 text-xs text-ink"
              style={{ borderWidth: "0.5px", borderColor: "#e6e6e6" }}
            >
              {[3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}
        <button
          onClick={render}
          disabled={status === "rendering"}
          className="rounded-md px-3 py-1.5 text-xs text-muted hover:text-ink disabled:opacity-40"
          style={{ borderWidth: "0.5px", borderColor: "#e6e6e6" }}
        >
          {status === "rendering" ? "Rendering…" : "Render"}
        </button>
        {status === "done" && <span className="text-xs text-ok">Rendered ✓</span>}
        {status === "error" && (
          <span className="text-xs text-bad">{error}</span>
        )}
      </div>

      {pages.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wide text-faint">
              {pages.length === 1 ? "Rendered image" : `${pages.length} pages`}
            </span>
            <button
              onClick={downloadAll}
              disabled={downloading}
              className="rounded-md bg-ink px-3 py-1 text-xs text-white disabled:opacity-40"
            >
              {downloading
                ? "Downloading…"
                : pages.length === 1
                ? "Download"
                : "Download all"}
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-3">
            {pages.map((url, i) => (
              <div key={url} className="flex flex-col items-center gap-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Rendered page ${i + 1}`}
                  className="h-40 w-auto rounded-md"
                  style={{ borderWidth: "0.5px", borderColor: "#e6e6e6" }}
                />
                <button
                  onClick={() => download(url, `mushnoom-${item.format}-${i + 1}.png`)}
                  className="text-[11px] text-muted underline hover:text-ink"
                >
                  {pages.length === 1 ? "Download" : `Download p${i + 1}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EditField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 text-[11px] uppercase tracking-wide text-faint">{label}</div>
      {children}
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
