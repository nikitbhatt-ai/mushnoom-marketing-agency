"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/generator", label: "Content generator" },
  { href: "/review", label: "Review queue" },
  { href: "/calendar", label: "Calendar" },
  { href: "/strategy", label: "Strategy intake", stub: true },
  { href: "/report", label: "Client report", stub: true },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-hair-r flex w-60 shrink-0 flex-col bg-surface">
      <div className="border-hair-b px-5 py-5">
        <div className="text-sm font-medium tracking-tight text-ink">raemy ai</div>
        <div className="mt-0.5 text-xs text-faint">Marketing &amp; content ops</div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {NAV.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-canvas text-ink"
                  : "text-muted hover:bg-canvas hover:text-ink"
              }`}
            >
              <span>{item.label}</span>
              {item.stub && (
                <span className="text-[10px] uppercase tracking-wide text-faint">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-hair-t px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border-hair text-xs text-muted">
            M
          </div>
          <div className="leading-tight">
            <div className="text-xs text-ink">Mushnoom</div>
            <div className="text-[11px] text-faint">Execution mode</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
