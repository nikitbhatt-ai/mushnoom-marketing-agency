"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Badge, ClaimsBadge, PlatformChip } from "@/components/Badge";
import type {
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
}: {
  sources: SourceFile[];
  pool: ContentItem[];
}) {
  const [sourceId, setSourceId] = useState(sources[0]?.id ?? "");
  const [formats, setFormats] = useState<ContentFormat[]>(["carousel"]);
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [pillar, setPillar] = useState<Pillar>("education");
  const [drafts, setDrafts] = useState<ContentItem[] | null>(null);
  const [generating, setGenerating] = useState(false);

  const source = useMemo(
    () => sources.find((s) => s.id === sourceId) ?? sources[0],
    [sourceId, sources]
  );

  function toggleFormat(f: ContentFormat) {
    setFormats((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  }

  function generate() {
    if (formats.length === 0) return;
    setGenerating(true);
    // Phase 2: simulate generation by pulling matching items from the DB pool.
    // Phase 3 replaces this with POST /api/generate (runAgent + the skill).
    setTimeout(() => {
      const matched = pool.filter((c) => c.sourceFileId === sourceId);
      const made = formats.map((fmt, i) => {
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
      setDrafts(made);
      setGenerating(false);
    }, 650);
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
            <p className="mt-1 text-xs text-muted">From the connected Drive folder.</p>
            <div className="mt-3 space-y-1.5">
              {sources.map((s) => (
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
          </div>

          <div className="card p-5">
            <div className="text-xs font-medium text-ink">Extracted transcript</div>
            <p className="mt-2 max-h-44 overflow-y-auto text-xs leading-relaxed text-muted">
              {source?.transcript}
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

            <button
              onClick={generate}
              disabled={generating || formats.length === 0}
              className="mt-5 w-full rounded-md bg-ink px-4 py-2.5 text-sm text-white transition-opacity disabled:opacity-40"
            >
              {generating ? "Generating…" : "Generate drafts"}
            </button>
          </div>
        </div>

        {/* Right: drafts */}
        <div className="space-y-4">
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
            <DraftCard key={d.id} item={d} />
          ))}
        </div>
      </div>
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

function DraftCard({ item }: { item: ContentItem }) {
  const [sent, setSent] = useState(false);
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
          disabled={sent}
          onClick={() => setSent(true)}
          className="rounded-md bg-ink px-3 py-1.5 text-xs text-white disabled:opacity-40"
        >
          {sent ? "Sent to review ✓" : "Send to review"}
        </button>
        <button
          className="rounded-md px-3 py-1.5 text-xs text-muted hover:text-ink"
          style={{ borderWidth: "0.5px", borderColor: "#e6e6e6" }}
        >
          Regenerate
        </button>
        <button
          className="rounded-md px-3 py-1.5 text-xs text-muted hover:text-ink"
          style={{ borderWidth: "0.5px", borderColor: "#e6e6e6" }}
        >
          Edit
        </button>
      </div>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function prettyPillar(p: string) {
  return p.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
