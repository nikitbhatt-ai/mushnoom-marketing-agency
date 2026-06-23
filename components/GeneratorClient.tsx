"use client";

import { useMemo, useRef, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Badge, ClaimsBadge, PlatformChip } from "@/components/Badge";
import type {
  BrandVoice,
  ContentFormat,
  ContentItem,
  Pillar,
  Platform,
  SourceFile,
} from "@/lib/types";

const FORMATS: { id: ContentFormat; label: string }[] = [
  { id: "carousel", label: "Carousel" },
  { id: "static", label: "Static" },
  { id: "reel", label: "Reel" },
];

const PILLARS: { id: Pillar; label: string }[] = [
  { id: "education", label: "Education" },
  { id: "product", label: "Product" },
  { id: "founder", label: "Founder" },
  { id: "social_proof", label: "Social proof" },
  { id: "lifestyle", label: "Lifestyle" },
];

export function GeneratorClient({
  sources,
  pool,
  brandVoice,
}: {
  sources: SourceFile[];
  pool: ContentItem[];
  brandVoice: BrandVoice;
}) {
  // Sources can grow at runtime as the user uploads PDFs / adds links.
  const [sourceList, setSourceList] = useState<SourceFile[]>(sources);
  const [sourceId, setSourceId] = useState(sources[0]?.id ?? "");
  const [formats, setFormats] = useState<ContentFormat[]>(["carousel"]);
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [pillar, setPillar] = useState<Pillar>("education");
  const [instructions, setInstructions] = useState("");
  const [drafts, setDrafts] = useState<ContentItem[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const source = useMemo(
    () => sourceList.find((s) => s.id === sourceId) ?? sourceList[0],
    [sourceId, sourceList]
  );

  function toggleFormat(f: ContentFormat) {
    setFormats((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  }

  // Phase 2 fallback: when live generation is unavailable, fake it from the pool
  // so the prototype still demos. Phase 3 (real) runs when the API route answers.
  function simulate(fmts: ContentFormat[]): ContentItem[] {
    const matched = pool.filter((c) => c.sourceFileId === sourceId);
    return fmts.map((fmt, i) => {
      const template =
        matched.find((c) => c.format === fmt) ?? matched[0] ?? pool[0];
      return {
        ...template,
        id: `gen-${fmt}-${i}-${Date.now()}`,
        format: fmt,
        platform,
        pillar,
        status: "draft" as const,
      };
    });
  }

  async function generate() {
    if (formats.length === 0 || !sourceId) return;
    setGenerating(true);
    setNotice(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId,
          formats,
          platform,
          pillar,
          instructions: instructions.trim() || undefined,
        }),
      });
      if (res.ok) {
        const { drafts: made } = await res.json();
        setDrafts(made);
      } else {
        const { error } = await res.json().catch(() => ({ error: "" }));
        setDrafts(simulate(formats));
        setNotice(
          res.status === 501
            ? "Preview only — add ANTHROPIC_API_KEY on Vercel for live drafts."
            : `Live generation failed (${error || res.status}). Showing a preview.`
        );
      }
    } catch {
      setDrafts(simulate(formats));
      setNotice("Couldn't reach the generator. Showing a preview.");
    } finally {
      setGenerating(false);
    }
  }

  function replaceDraft(updated: ContentItem) {
    setDrafts((prev) =>
      prev ? prev.map((d) => (d.id === updated.id ? updated : d)) : prev
    );
  }

  async function regenerate(draft: ContentItem): Promise<void> {
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId: draft.sourceFileId ?? sourceId,
          formats: [draft.format],
          platform: draft.platform,
          pillar: draft.pillar,
          instructions: instructions.trim() || undefined,
          replaceId: draft.id.startsWith("gen-") ? undefined : draft.id,
        }),
      });
      if (res.ok) {
        const { drafts: made } = await res.json();
        if (made?.[0]) replaceDraft({ ...made[0], id: draft.id } as ContentItem);
        return;
      }
    } catch {
      /* fall through to simulated regenerate */
    }
    // Fallback: re-pick from the pool for this one card.
    const [fresh] = simulate([draft.format]);
    if (fresh) replaceDraft({ ...fresh, id: draft.id });
  }

  async function saveEdit(draft: ContentItem): Promise<void> {
    replaceDraft(draft); // optimistic local update
    if (draft.id.startsWith("gen-")) return; // simulated draft, nothing to persist
    try {
      await fetch(`/api/content/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ copy: draft.copy }),
      });
    } catch {
      /* keep the local edit even if the save didn't reach the server */
    }
  }

  function onSourceAdded(s: SourceFile) {
    setSourceList((prev) => [s, ...prev]);
    setSourceId(s.id);
  }

  return (
    <div>
      <PageHeader
        title="Content generator"
        subtitle="Pick a source, choose formats, generate drafts. Nothing schedules from here."
      />

      <div className="mx-auto grid max-w-content grid-cols-1 gap-6 px-8 py-8 lg:grid-cols-[360px_1fr]">
        {/* Left: controls */}
        <div className="space-y-6">
          <div className="card p-5">
            <div className="text-xs font-medium text-ink">Source file</div>
            <p className="mt-1 text-xs text-muted">
              From the connected Drive folder, an uploaded PDF, or a research link.
            </p>
            <div className="mt-3 space-y-1.5">
              {sourceList.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSourceId(s.id)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    sourceId === s.id ? "bg-canvas text-ink" : "text-muted hover:bg-canvas"
                  }`}
                  style={{
                    borderWidth: "0.5px",
                    borderColor: sourceId === s.id ? "#e6e6e6" : "transparent",
                  }}
                >
                  <span className="truncate">{s.name}</span>
                  <span className="ml-2 shrink-0 text-[11px] text-faint">{s.type}</span>
                </button>
              ))}
            </div>

            <AddSource onAdded={onSourceAdded} />
          </div>

          <div className="card p-5">
            <div className="text-xs font-medium text-ink">Extracted transcript</div>
            <p className="mt-2 max-h-44 overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-muted">
              {source?.transcript || "No extracted text yet for this source."}
            </p>
          </div>

          <div className="card p-5">
            <div className="text-xs font-medium text-ink">Formats</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {FORMATS.map((f) => (
                <Chip key={f.id} active={formats.includes(f.id)} onClick={() => toggleFormat(f.id)}>
                  {f.label}
                </Chip>
              ))}
            </div>

            <div className="mt-4 text-xs font-medium text-ink">Platform</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["instagram", "tiktok"] as Platform[]).map((p) => (
                <Chip key={p} active={platform === p} onClick={() => setPlatform(p)}>
                  {p === "instagram" ? "Instagram" : "TikTok"}
                </Chip>
              ))}
            </div>

            <div className="mt-4 text-xs font-medium text-ink">Content pillar</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {PILLARS.map((p) => (
                <Chip key={p.id} active={pillar === p.id} onClick={() => setPillar(p.id)}>
                  {p.label}
                </Chip>
              ))}
            </div>

            <div className="mt-4 text-xs font-medium text-ink">
              Extra instructions <span className="text-faint">(optional)</span>
            </div>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={2}
              placeholder="Steer this batch — e.g. “punchier, lead with the cordyceps-for-athletes angle.”"
              className="mt-2 w-full rounded-md px-2.5 py-1.5 text-xs text-ink outline-none"
              style={{ borderWidth: "0.5px", borderColor: "#e6e6e6" }}
            />

            <button
              onClick={generate}
              disabled={generating || formats.length === 0 || !sourceId}
              className="mt-5 w-full rounded-md bg-ink px-4 py-2.5 text-sm text-white transition-opacity disabled:opacity-40"
            >
              {generating ? "Generating…" : "Generate drafts"}
            </button>
          </div>

          <BrandVoiceEditor initial={brandVoice.guidelines} />
        </div>

        {/* Right: drafts */}
        <div className="space-y-4">
          {notice && (
            <div
              className="rounded-md bg-canvas px-4 py-2.5 text-xs text-muted"
              style={{ borderWidth: "0.5px", borderColor: "#e6e6e6" }}
            >
              {notice}
            </div>
          )}

          {drafts === null && (
            <div className="card flex h-full min-h-64 items-center justify-center p-10 text-center">
              <div>
                <div className="text-sm text-ink">No drafts yet</div>
                <p className="mt-1 text-xs text-muted">
                  Choose a source and formats, then generate. Drafts appear here with a
                  claims badge before anything moves to review.
                </p>
              </div>
            </div>
          )}

          {drafts?.map((d) => (
            <DraftCard
              key={d.id}
              item={d}
              onRegenerate={() => regenerate(d)}
              onSave={saveEdit}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Upload a PDF or paste a research link; ingests via /api/ingest. */
function AddSource({ onAdded }: { onAdded: (s: SourceFile) => void }) {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function send(init: RequestInit) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ingest", { method: "POST", ...init });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.source) {
        onAdded(json.source as SourceFile);
        setUrl("");
        setText("");
        if (fileRef.current) fileRef.current.value = "";
      } else {
        setError(json.error || `Ingest failed (${res.status}).`);
      }
    } catch {
      setError("Couldn't reach the ingest endpoint.");
    } finally {
      setBusy(false);
    }
  }

  function onAddText() {
    if (!text.trim()) return;
    void send({
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.trim() }),
    });
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    void send({ body: form });
  }

  function onAddUrl() {
    if (!url.trim()) return;
    void send({
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url.trim() }),
    });
  }

  return (
    <div className="mt-3 border-t pt-3" style={{ borderColor: "#eee" }}>
      <div className="text-[11px] uppercase tracking-wide text-faint">Add a source</div>
      <p className="mt-1 text-[11px] text-faint">Use any one of these.</p>

      {/* Option 1 — research link */}
      <div className="mt-2 flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAddUrl()}
          placeholder="Paste a research link…"
          className="min-w-0 flex-1 rounded-md px-2.5 py-1.5 text-xs text-ink outline-none"
          style={{ borderWidth: "0.5px", borderColor: "#e6e6e6" }}
        />
        <button
          onClick={onAddUrl}
          disabled={busy || !url.trim()}
          className="shrink-0 rounded-md bg-ink px-3 py-1.5 text-xs text-white disabled:opacity-40"
        >
          Add
        </button>
      </div>

      <OrDivider />

      {/* Option 2 — upload a PDF */}
      <button
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        className="w-full rounded-md px-3 py-1.5 text-xs text-muted hover:text-ink disabled:opacity-40"
        style={{ borderWidth: "0.5px", borderColor: "#e6e6e6" }}
      >
        {busy ? "Working…" : "Upload a PDF"}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/pdf"
        onChange={onFile}
        className="hidden"
      />

      <OrDivider />

      {/* Option 3 — paste the text directly (works when a site blocks bots) */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Paste article text here…"
        className="w-full rounded-md px-2.5 py-1.5 text-xs text-ink outline-none"
        style={{ borderWidth: "0.5px", borderColor: "#e6e6e6" }}
      />
      <button
        onClick={onAddText}
        disabled={busy || !text.trim()}
        className="mt-2 w-full rounded-md bg-ink px-3 py-1.5 text-xs text-white disabled:opacity-40"
      >
        {busy ? "Working…" : "Add pasted text"}
      </button>

      {error && <p className="mt-2 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}

/**
 * Edit the persistent brand voice (the "skill") and save it to the client. The
 * saved guidelines are injected into every future generation. Compliance rules
 * are NOT shown here — they live in code and can't be edited away.
 */
function BrandVoiceEditor({ initial }: { initial: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function save() {
    if (!text.trim()) return;
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/brand-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guidelines: text.trim() }),
      });
      if (res.ok) {
        setStatus("Saved — applies to the next generation.");
      } else {
        const { error } = await res.json().catch(() => ({ error: "" }));
        setStatus(
          res.status === 501
            ? "Can't save without a database connection."
            : `Save failed${error ? `: ${error}` : ""}.`
        );
      }
    } catch {
      setStatus("Couldn't reach the server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <div className="text-xs font-medium text-ink">Brand voice</div>
          <p className="mt-1 text-xs text-muted">
            The voice every draft is written in. Compliance rules are always on.
          </p>
        </div>
        <span className="ml-2 shrink-0 text-xs text-faint">
          {open ? "Hide" : "Edit"}
        </span>
      </button>

      {open && (
        <div className="mt-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={14}
            className="w-full rounded-md px-2.5 py-2 text-xs leading-relaxed text-ink outline-none"
            style={{ borderWidth: "0.5px", borderColor: "#e6e6e6" }}
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={save}
              disabled={saving || !text.trim()}
              className="rounded-md bg-ink px-3 py-1.5 text-xs text-white disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save voice"}
            </button>
            <button
              onClick={() => setText(initial)}
              disabled={saving || text === initial}
              className="rounded-md px-3 py-1.5 text-xs text-muted hover:text-ink disabled:opacity-40"
              style={{ borderWidth: "0.5px", borderColor: "#e6e6e6" }}
            >
              Reset
            </button>
            {status && <span className="text-[11px] text-muted">{status}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

/** A small "or" rule that separates the equal source options. */
function OrDivider() {
  return (
    <div className="my-2 flex items-center gap-2">
      <div className="h-px flex-1" style={{ backgroundColor: "#eee" }} />
      <span className="text-[10px] uppercase tracking-wide text-faint">or</span>
      <div className="h-px flex-1" style={{ backgroundColor: "#eee" }} />
    </div>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
        active ? "bg-ink text-white" : "bg-canvas text-muted hover:text-ink"
      }`}
      style={{ borderWidth: "0.5px", borderColor: active ? "#1a1a1a" : "#e6e6e6" }}
    >
      {children}
    </button>
  );
}

function DraftCard({
  item,
  onRegenerate,
  onSave,
}: {
  item: ContentItem;
  onRegenerate: () => Promise<void>;
  onSave: (updated: ContentItem) => void;
}) {
  const [sent, setSent] = useState(item.status === "in_review");
  const [sending, setSending] = useState(false);
  const [sendNote, setSendNote] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  // Edit buffers (slides one-per-line, hashtags space-separated).
  const [hook, setHook] = useState(item.copy.hook);
  const [slides, setSlides] = useState(item.copy.slides.join("\n"));
  const [caption, setCaption] = useState(item.copy.caption);
  const [hashtags, setHashtags] = useState(item.copy.hashtags.join(" "));

  function startEdit() {
    setHook(item.copy.hook);
    setSlides(item.copy.slides.join("\n"));
    setCaption(item.copy.caption);
    setHashtags(item.copy.hashtags.join(" "));
    setEditing(true);
  }

  function save() {
    onSave({
      ...item,
      copy: {
        hook: hook.trim(),
        slides: slides.split("\n").map((s) => s.trim()).filter(Boolean),
        caption: caption.trim(),
        hashtags: hashtags.split(/\s+/).filter(Boolean),
      },
    });
    setEditing(false);
  }

  async function sendToReview() {
    if (sent || sending) return;
    // Simulated preview drafts aren't persisted, so there's no row to queue.
    if (item.id.startsWith("gen-")) {
      setSent(true);
      setSendNote("Preview draft — add ANTHROPIC_API_KEY so drafts persist and queue.");
      return;
    }
    setSending(true);
    setSendNote(null);
    try {
      const res = await fetch(`/api/content/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in_review" }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        const { error } = await res.json().catch(() => ({ error: "" }));
        setSendNote(error || `Couldn't send to review (${res.status}).`);
      }
    } catch {
      setSendNote("Couldn't reach the server.");
    } finally {
      setSending(false);
    }
  }

  async function handleRegenerate() {
    setRegenerating(true);
    setSent(false);
    try {
      await onRegenerate();
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge tone="neutral">{capitalize(item.format)}</Badge>
          <PlatformChip platform={item.platform} />
          <Badge tone="neutral">{prettyPillar(item.pillar)}</Badge>
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
          <div className="flex items-center gap-2">
            <button
              onClick={save}
              className="rounded-md bg-ink px-3 py-1.5 text-xs text-white"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-md px-3 py-1.5 text-xs text-muted hover:text-ink"
              style={{ borderWidth: "0.5px", borderColor: "#e6e6e6" }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-4 text-sm font-medium text-ink">{item.copy.hook}</div>

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

          <div
            className="mt-3 rounded-md bg-canvas p-3"
            style={{ borderWidth: "0.5px", borderColor: "#e6e6e6" }}
          >
            <div className="text-[11px] uppercase tracking-wide text-faint">Caption</div>
            <p className="mt-1 text-xs leading-relaxed text-muted">{item.copy.caption}</p>
            <div className="mt-2 text-xs text-faint">{item.copy.hashtags.join(" ")}</div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              disabled={sent || sending}
              onClick={sendToReview}
              className="rounded-md bg-ink px-3 py-1.5 text-xs text-white disabled:opacity-40"
            >
              {sent ? "Sent to review ✓" : sending ? "Sending…" : "Send to review"}
            </button>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="rounded-md px-3 py-1.5 text-xs text-muted hover:text-ink disabled:opacity-40"
              style={{ borderWidth: "0.5px", borderColor: "#e6e6e6" }}
            >
              {regenerating ? "Regenerating…" : "Regenerate"}
            </button>
            <button
              onClick={startEdit}
              className="rounded-md px-3 py-1.5 text-xs text-muted hover:text-ink"
              style={{ borderWidth: "0.5px", borderColor: "#e6e6e6" }}
            >
              Edit
            </button>
          </div>
          {sent && !sendNote && (
            <p className="mt-2 text-[11px] text-muted">
              In the review queue now — approve it there to make it publishable.
            </p>
          )}
          {sendNote && <p className="mt-2 text-[11px] text-muted">{sendNote}</p>}
        </>
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
function prettyPillar(p: string) {
  return p.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
