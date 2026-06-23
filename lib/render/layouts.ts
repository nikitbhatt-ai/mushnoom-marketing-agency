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

/** Shared page shell: wordmark header, centered body, optional footer line. */
function frame(children: El[], footer?: string): El {
  const icon = cornerIcon();
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
          alignItems: "center",
          textAlign: "center",
        },
        children
      ),
      box({ justifyContent: "center", height: 46 }, footer
        ? [txt({ fontFamily: BODY, fontSize: 26, letterSpacing: 1, color: ACCENT }, footer)]
        : []),
      ...(icon ? [icon] : []),
    ]
  );
}

const hookPage = (hook: string, footer?: string): El =>
  frame([txt({ fontFamily: HEAD, fontWeight: 700, fontSize: 78, lineHeight: 1.12 }, hook)], footer);

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
// the headline. Font size steps down for longer text so it still fits. The index
// label (01, 02…) is optional — off by default, since numbering makes slides
// awkward to reorder or drop.
const slidePage = (n: number, slide: string, numbered: boolean): El => {
  const { title, body } = splitSlide(slide);
  const idx = String(n).padStart(2, "0");
  const titleSize = body ? 84 : title.length > 70 ? 50 : title.length > 40 ? 62 : 78;
  return frame([
    ...(numbered
      ? [txt({ fontFamily: BODY, fontSize: 24, fontWeight: 700, letterSpacing: 6, color: ACCENT }, idx)]
      : []),
    txt(
      { fontFamily: HEAD, fontSize: titleSize, fontWeight: 700, marginTop: 18, lineHeight: 1.1 },
      title
    ),
    ...(body
      ? [txt({ fontFamily: BODY, fontSize: 36, color: MUTED, marginTop: 20, lineHeight: 1.35 }, body)]
      : []),
  ]);
};

const pollPage = (options: string[]): El =>
  frame([
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
          [txt({ fontFamily: BODY, fontSize: 42, color: FG }, o)]
        )
      )
    ),
  ]);

const ctaPage = (cta: string): El =>
  frame([txt({ fontFamily: HEAD, fontWeight: 700, fontSize: 74, lineHeight: 1.15 }, cta)]);

const staticPage = (hook: string, body: string): El =>
  frame([
    txt({ fontFamily: HEAD, fontWeight: 700, fontSize: 74, lineHeight: 1.14 }, hook),
    txt({ fontFamily: BODY, fontSize: 36, color: MUTED, marginTop: 30, lineHeight: 1.45 }, body),
  ]);

/** Visual options the user controls per render (beyond copy + template). */
export interface RenderOptions {
  /** Show the 01/02… index label on dynamic carousel slides. Default false. */
  numbered?: boolean;
}

/** Build the ordered pages for a template. The dynamic carousel renders one page
 *  per slide straight from the approved copy; fixed templates use fielded values. */
export function buildPages(
  templateKey: RenderTemplateKey,
  copy: ContentCopy,
  f: Record<string, string>,
  opts: RenderOptions = {}
): El[] {
  switch (templateKey) {
    case "ingredients_carousel": {
      // Dynamic: hook + every slide in the copy, in order — nothing is dropped.
      const slides = copy.slides.filter((s) => s.trim());
      return [
        hookPage(copy.hook, "Swipe »"),
        ...slides.map((s, i) => slidePage(i + 1, s, opts.numbered ?? false)),
      ];
    }
    case "poll_carousel":
      return [
        hookPage(f.hook, "Swipe »"),
        pollPage([f.option_1, f.option_2, f.option_3]),
        ctaPage(f.cta),
      ];
    case "announcement_static":
      return [staticPage(f.hook, f.body)];
  }
}
