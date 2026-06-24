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
import { DEFAULT_BRAND_KIT, type BrandKit } from "./brand";

/* eslint-disable @typescript-eslint/no-explicit-any */
type El = { type: string; props: { style: Record<string, any>; children?: any; src?: string } };

const box = (style: Record<string, any>, children: any): El => ({
  type: "div",
  props: { style: { display: "flex", ...style }, children },
});
const txt = (style: Record<string, any>, s: string): El => ({
  type: "div",
  props: { style, children: s },
});

// Brand wordmark for the header. Uses the kit's logo image when set, else the
// brand name as a text wordmark.
const wordmark = (c: Ctx): El =>
  c.logo
    ? { type: "img", props: { src: c.logo, style: { height: 40 } } }
    : txt({ fontFamily: c.body, fontWeight: 700, fontSize: 30, letterSpacing: 0.5, color: c.text }, c.name);

// Small brand mark pinned to the bottom-right corner (favicon-style). Omitted
// entirely when the kit has no icon.
const cornerIcon = (c: Ctx): El | null =>
  c.icon
    ? {
        type: "img",
        props: { src: c.icon, style: { position: "absolute", right: 64, bottom: 64, width: 88, height: 88 } },
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

/** Render context: the user's options resolved to concrete values, fused with
 *  the brand kit's colors/fonts/logo. One object threaded into every builder. */
interface Ctx {
  align: "center" | "left";
  scale: number;
  numbered: boolean;
  showSwipe: boolean;
  // brand kit
  bg: string;
  text: string;
  accent: string;
  muted: string;
  head: string; // heading font family
  body: string; // body font family
  logo: string | null;
  icon: string | null;
  name: string;
}
function resolve(opts: RenderOptions, kit: BrandKit): Ctx {
  return {
    align: opts.align === "left" ? "left" : "center",
    scale: TEXT_SCALE[opts.textSize ?? "normal"],
    numbered: opts.numbered ?? false,
    showSwipe: opts.showSwipe ?? true,
    bg: kit.bg,
    text: kit.text,
    accent: kit.accent,
    muted: kit.muted,
    head: kit.headingFont,
    body: kit.bodyFont,
    logo: kit.logo,
    icon: kit.icon,
    name: kit.name,
  };
}
const sz = (base: number, scale: number) => Math.round(base * scale);

/** Shared page shell: wordmark header, body (aligned per options), optional footer. */
function frame(children: El[], c: Ctx, footer?: string): El {
  const icon = cornerIcon(c);
  const left = c.align === "left";
  return box(
    {
      position: "relative",
      width: "100%",
      height: "100%",
      flexDirection: "column",
      backgroundColor: c.bg,
      color: c.text,
      padding: 96,
      fontFamily: c.head,
    },
    [
      box({ justifyContent: "flex-end" }, [wordmark(c)]),
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
        ? [txt({ fontFamily: c.body, fontSize: 26, letterSpacing: 1, color: c.accent }, footer)]
        : []),
      ...(icon ? [icon] : []),
    ]
  );
}

const hookPage = (hook: string, c: Ctx): El =>
  frame(
    [txt({ fontFamily: c.head, fontWeight: 700, fontSize: sz(78, c.scale), lineHeight: 1.12 }, hook)],
    c,
    c.showSwipe ? "Swipe »" : undefined
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
const slidePage = (n: number, slide: string, c: Ctx): El => {
  const { title, body } = splitSlide(slide);
  const idx = String(n).padStart(2, "0");
  const base = body ? 84 : title.length > 70 ? 50 : title.length > 40 ? 62 : 78;
  return frame(
    [
      ...(c.numbered
        ? [txt({ fontFamily: c.body, fontSize: sz(24, c.scale), fontWeight: 700, letterSpacing: 6, color: c.accent }, idx)]
        : []),
      txt(
        { fontFamily: c.head, fontSize: sz(base, c.scale), fontWeight: 700, marginTop: 18, lineHeight: 1.1 },
        title
      ),
      ...(body
        ? [txt({ fontFamily: c.body, fontSize: sz(36, c.scale), color: c.muted, marginTop: 20, lineHeight: 1.35 }, body)]
        : []),
    ],
    c
  );
};

const pollPage = (options: string[], c: Ctx): El =>
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
              borderColor: c.accent,
              borderRadius: 28,
              paddingTop: 28,
              paddingBottom: 28,
              marginTop: 26,
            },
            [txt({ fontFamily: c.body, fontSize: sz(42, c.scale), color: c.text }, o)]
          )
        )
      ),
    ],
    c
  );

const ctaPage = (cta: string, c: Ctx): El =>
  frame(
    [txt({ fontFamily: c.head, fontWeight: 700, fontSize: sz(74, c.scale), lineHeight: 1.15 }, cta)],
    c
  );

const staticPage = (hook: string, body: string, c: Ctx): El =>
  frame(
    [
      txt({ fontFamily: c.head, fontWeight: 700, fontSize: sz(74, c.scale), lineHeight: 1.14 }, hook),
      txt({ fontFamily: c.body, fontSize: sz(36, c.scale), color: c.muted, marginTop: 30, lineHeight: 1.45 }, body),
    ],
    c
  );

/** Build the ordered pages for a template. The dynamic carousel renders one page
 *  per slide straight from the approved copy; fixed templates use fielded values.
 *  `kit` supplies the per-client colors/fonts/logo (defaults to Mushnoom). */
export function buildPages(
  templateKey: RenderTemplateKey,
  copy: ContentCopy,
  f: Record<string, string>,
  opts: RenderOptions = {},
  kit: BrandKit = DEFAULT_BRAND_KIT
): El[] {
  const c = resolve(opts, kit);
  switch (templateKey) {
    case "ingredients_carousel": {
      // Dynamic: hook + every slide in the copy, in order — nothing is dropped.
      const slides = copy.slides.filter((s) => s.trim());
      const pages = [
        hookPage(copy.hook, c),
        ...slides.map((s, i) => slidePage(i + 1, s, c)),
      ];
      if (opts.cta) pages.push(ctaPage((opts.ctaText ?? "").trim() || "Learn more »", c));
      return pages;
    }
    case "poll_carousel":
      return [
        hookPage(f.hook, c),
        pollPage([f.option_1, f.option_2, f.option_3], c),
        ctaPage(f.cta, c),
      ];
    case "announcement_static":
      return [staticPage(f.hook, f.body, c)];
  }
}
