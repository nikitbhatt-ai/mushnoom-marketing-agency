import { PageHeader } from "@/components/PageHeader";
import { Badge, PlatformChip } from "@/components/Badge";
import { CONTENT_ITEMS } from "@/lib/mock/data";
import type { ContentItem } from "@/lib/types";

// Prototype "today" matches the spec demo window.
const TODAY = new Date("2026-06-03T00:00:00Z");
const YEAR = 2026;
const MONTH = 5; // June (0-indexed)

export default function CalendarPage() {
  // Anything with a scheduled (or already-posted) slot shows on the calendar.
  const scheduled = CONTENT_ITEMS.filter(
    (c) => c.scheduledFor && (c.status === "scheduled" || c.status === "posted")
  );

  const byDay = groupByDay(scheduled);

  const firstOfMonth = new Date(Date.UTC(YEAR, MONTH, 1));
  const startWeekday = firstOfMonth.getUTCDay(); // 0 = Sun
  const daysInMonth = new Date(Date.UTC(YEAR, MONTH + 1, 0)).getUTCDate();

  // Build leading blanks + day cells, padded to full weeks.
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <PageHeader
        title="Calendar"
        subtitle="June 2026 · approved posts scheduled by Vercel Cron"
        action={<Badge tone="neutral">{scheduled.length} on the calendar</Badge>}
      />

      <div className="mx-auto max-w-content px-8 py-8">
        <div className="card overflow-hidden">
          {/* Weekday header */}
          <div className="grid grid-cols-7 border-hair-b">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="px-3 py-2.5 text-[11px] uppercase tracking-wide text-faint"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              const key = day ? dayKey(YEAR, MONTH, day) : `blank-${i}`;
              const posts = day ? byDay[dayKey(YEAR, MONTH, day)] ?? [] : [];
              const isToday =
                day === TODAY.getUTCDate() &&
                MONTH === TODAY.getUTCMonth() &&
                YEAR === TODAY.getUTCFullYear();

              return (
                <div
                  key={key}
                  className="min-h-28 border-line p-2"
                  style={{
                    borderRightWidth: (i + 1) % 7 === 0 ? 0 : "0.5px",
                    borderBottomWidth: "0.5px",
                    background: day ? "#fff" : "#fafafa",
                  }}
                >
                  {day && (
                    <>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs ${
                            isToday
                              ? "flex h-5 w-5 items-center justify-center rounded-full bg-ink text-white"
                              : "text-muted"
                          }`}
                        >
                          {day}
                        </span>
                      </div>
                      <div className="mt-1.5 space-y-1.5">
                        {posts.map((p) => (
                          <CalendarPost key={p.id} item={p} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-3 text-xs text-faint">
          Posts only land here after approval + a confirmed claims check (canPublish).
        </p>
      </div>
    </div>
  );
}

function CalendarPost({ item }: { item: ContentItem }) {
  return (
    <div
      className="rounded-md p-2"
      style={{ borderWidth: "0.5px", borderColor: "#e6e6e6", background: "#fafafa" }}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-[10px] text-faint">{formatTime(item.scheduledFor!)}</span>
        <PlatformChip platform={item.platform} />
      </div>
      <div className="mt-1 truncate text-[11px] text-ink" title={item.copy.hook}>
        {item.copy.hook}
      </div>
      <div className="mt-1 flex items-center gap-1">
        <span className="text-[10px] text-faint">{capitalize(item.format)}</span>
        {item.status === "posted" && <Badge tone="ok">Posted</Badge>}
      </div>
    </div>
  );
}

function groupByDay(items: ContentItem[]): Record<string, ContentItem[]> {
  const out: Record<string, ContentItem[]> = {};
  for (const it of items) {
    const d = new Date(it.scheduledFor!);
    const key = dayKey(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    (out[key] ??= []).push(it);
  }
  for (const key of Object.keys(out)) {
    out[key].sort((a, b) => a.scheduledFor!.localeCompare(b.scheduledFor!));
  }
  return out;
}

function dayKey(y: number, m: number, d: number) {
  return `${y}-${m}-${d}`;
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
