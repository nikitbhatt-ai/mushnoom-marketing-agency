// Post layouts for the self-hosted renderer. These return Satori element objects
// (the same {type, props} shape React produces) — no JSX, so the module is plain
// TS and easy to render-test in isolation.
//
// Brand look per the Mushnoom style guide (see lib/render/brand.ts): Black Olive
// background, Playfair Display headlines, Inter for labels/body, Vista Blue
// accents, and the wordmark/logo. Tuned for a 1080-wide canvas (all IG/FB ratios
// share that width).

import type { RenderTemplateKey } from "./templates";
import type { ContentCopy } from "../types";
import { BRAND, RENDER } from "./brand";
import { LOGO, ICON } from "./logo";

/* eslint-disable @typescript-eslint/no-explicit-any */
type El = { type: string; props: { style: Record<string, any>; children?: any; src?: string } };

const BG = RENDER.bg;
const FG = RENDER.text;
const ACCENT = RENDER.accent;
const MUTED = RENDER.muted;
const HEAD = BRAND.fonts.heading; // Playfair Display
const BODY = BRAND.fonts.body; //   Inter

const box = (style: Record<string, any>, children: any): El => ({
  type: "div",
  props: { style: { display: "flex", ...style }, children },
});
const txt = (style: Record<string, any>, s: string): El => ({
  type: "div",
  props: { style, children: s },
});

// Brand wordmark for the header. Text stand-in until the real logo file is wired
// in (see LOGO in ./logo) — the single place to swap.
const wordmark = (): El =>
  LOGO
    ? { type: "img", props: { src: LOGO, style: { height: 40 } } }
    : txt({ fontFamily: BODY, fontWeight: 700, fontSize: 30, letterSpacing: 0.5, color: FG }, "mushnoom");

// Small brand mark pinned to the bottom-right corner (favicon-style). Omitted
// entirely until an icon file is wired in (see ICON in ./logo).
const cornerIcon = (): El | null =>
  ICON
    ? {
        type: "img",
        props: { src: ICON, style: { position: "absolute", right: 64, bottom: 64, width: 88, height: 88 } },
      }
    : null;

/** Visual options the user controls per render (beyond copy + template). */
export interface RenderOptions {
  /** Show the 01/02… index label on dynamic carousel slides. Default false. */
  numbered?: boolean;
  /** Body alignment. Default "center". */
  align?: "center" | "left";
  /** Overall text size. Default "normal". */
  textSize?: "small" | "normal" | "large";
  /** Show the "Swipe »" prompt on the hook/cover. Default true. */
  showSwipe?: boolean;
  /** Append a closing CTA slide to a dynamic carousel. Default false. */
  cta?: boolean;
  /** Text for the CTA slide (when `cta`). Defaults to a soft prompt. */
  ctaText?: string;
  /** Cap on total rendered pages (incl. hook/cover). Applied by the renderer. */
  maxPages?: number;
}

const TEXT_SCALE = { small: 0.85, normal: 1, large: 1.18 } as const;

/** Options resolved to concrete values, passed into every page builder. */
interface Resolved {
  align: "center" | "left";
  scale: number;
  numbered: boolean;
  showSwipe: boolean;
}
function resolve(opts: RenderOptions): Resolved {
  return {
    align: opts.align === "left" ? "left" : "center",
    scale: TEXT_SCALE[opts.textSize ?? "normal"],
    numbered: opts.numbered ?? false,
    showSwipe: opts.showSwipe ?? true,
  };
}
const sz = (base: number, scale: number) => Math.round(base * scale);

/** Shared page shell: wordmark header, body (aligned per options), optional footer. */
function frame(children: El[], r: Resolved, footer?: string): El {
  const icon = cornerIcon();
  const left = r.align === "left";
  return box(
    {
      position: "relative",
      width: "100%",
      height: "100%",
      flexDirection: "column",
      backgroundColor: BG,
      color: FG,
      padding: 96,
      fontFamily: HEAD,
    },
    [
      box({ justifyContent: "flex-end" }, [wordmark()]),
      box(
        {
          flexGrow: 1,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: left ? "flex-start" : "center",
          textAlign: left ? "left" : "center",
        },
        children
      ),
      box({ justifyContent: left ? "flex-start" : "center", height: 46 }, footer
        ? [txt({ fontFamily: BODY, fontSize: 26, letterSpacing: 1, color: ACCENT }, footer)]
        : []),
      ...(icon ? [icon] : []),
    ]
  );
}

const hookPage = (hook: string, r: Resolved): El =>
  frame(
    [txt({ fontFamily: HEAD, fontWeight: 700, fontSize: sz(78, r.scale), lineHeight: 1.12 }, hook)],
    r,
    r.showSwipe ? "Swipe »" : undefined
  );

// Split a slide into a bold lead + supporting line when it uses a clear
// separator ("Term — explanation", "Term: explanation"); otherwise render the
// whole slide as the headline. Either way no copy is dropped.
function splitSlide(slide: string): { title: string; body?: string } {
  const m = slide.match(/^(.{2,48}?)\s*(?:—|–|::|:|\s-\s)\s+(.+)$/);
  if (m) return { title: m[1].trim(), body: m[2].trim() };
  return { title: slide.trim() };
}

// One carousel page per generated slide. A short lead before a separator becomes
// the headline with the rest as a supporting line; otherwise the whole slide is
// the headline. Font size steps down for longer text so it still fits.
const slidePage = (n: number, slide: string, r: Resolved): El => {
  const { title, body } = splitSlide(slide);
  const idx = String(n).padStart(2, "0");
  const base = body ? 84 : title.length > 70 ? 50 : title.length > 40 ? 62 : 78;
  return frame(
    [
      ...(r.numbered
        ? [txt({ fontFamily: BODY, fontSize: sz(24, r.scale), fontWeight: 700, letterSpacing: 6, color: ACCENT }, idx)]
        : []),
      txt(
        { fontFamily: HEAD, fontSize: sz(base, r.scale), fontWeight: 700, marginTop: 18, lineHeight: 1.1 },
        title
      ),
      ...(body
        ? [txt({ fontFamily: BODY, fontSize: sz(36, r.scale), color: MUTED, marginTop: 20, lineHeight: 1.35 }, body)]
        : []),
    ],
    r
  );
};

const pollPage = (options: string[], r: Resolved): El =>
  frame(
    [
      box(
        { flexDirection: "column", width: "100%" },
        options.filter(Boolean).map((o) =>
          box(
            {
              justifyContent: "center",
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: ACCENT,
              borderRadius: 28,
              paddingTop: 28,
              paddingBottom: 28,
              marginTop: 26,
            },
            [txt({ fontFamily: BODY, fontSize: sz(42, r.scale), color: FG }, o)]
          )
        )
      ),
    ],
    r
  );

const ctaPage = (cta: string, r: Resolved): El =>
  frame(
    [txt({ fontFamily: HEAD, fontWeight: 700, fontSize: sz(74, r.scale), lineHeight: 1.15 }, cta)],
    r
  );

const staticPage = (hook: string, body: string, r: Resolved): El =>
  frame(
    [
      txt({ fontFamily: HEAD, fontWeight: 700, fontSize: sz(74, r.scale), lineHeight: 1.14 }, hook),
      txt({ fontFamily: BODY, fontSize: sz(36, r.scale), color: MUTED, marginTop: 30, lineHeight: 1.45 }, body),
    ],
    r
  );

/** Build the ordered pages for a template. The dynamic carousel renders one page
 *  per slide straight from the approved copy; fixed templates use fielded values. */
export function buildPages(
  templateKey: RenderTemplateKey,
  copy: ContentCopy,
  f: Record<string, string>,
  opts: RenderOptions = {}
): El[] {
  const r = resolve(opts);
  switch (templateKey) {
    case "ingredients_carousel": {
      // Dynamic: hook + every slide in the copy, in order — nothing is dropped.
      const slides = copy.slides.filter((s) => s.trim());
      const pages = [
        hookPage(copy.hook, r),
        ...slides.map((s, i) => slidePage(i + 1, s, r)),
      ];
      if (opts.cta) pages.push(ctaPage((opts.ctaText ?? "").trim() || "Learn more »", r));
      return pages;
    }
    case "poll_carousel":
      return [
        hookPage(f.hook, r),
        pollPage([f.option_1, f.option_2, f.option_3], r),
        ctaPage(f.cta, r),
      ];
    case "announcement_static":
      return [staticPage(f.hook, f.body, r)];
  }
}
