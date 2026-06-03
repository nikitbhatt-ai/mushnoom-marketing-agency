import type { MetricCardData } from "@/lib/types";

export function MetricCard({ data }: { data: MetricCardData }) {
  // A delta is "good" when its direction matches the metric's goodDirection.
  // (CAC going down is good; repeat rate going down is bad.)
  const isGood =
    data.direction === "flat"
      ? null
      : data.direction === data.goodDirection;

  const deltaColor =
    isGood === null ? "text-faint" : isGood ? "text-ok" : "text-bad";

  const arrow =
    data.direction === "up" ? "↑" : data.direction === "down" ? "↓" : "→";

  return (
    <div className="card p-5">
      <div className="text-xs text-muted">{data.label}</div>
      <div className="mt-2 text-2xl font-medium tracking-tight text-ink">
        {data.value}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className={`text-xs ${deltaColor}`}>
          {arrow} {data.delta}
        </span>
        <span className="text-xs text-faint">{data.caption}</span>
      </div>
    </div>
  );
}
