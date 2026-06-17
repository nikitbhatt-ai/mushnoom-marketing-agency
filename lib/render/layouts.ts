// Post layouts for the self-hosted renderer. These return Satori element objects
// (the same {type, props} shape React produces) — no JSX, so the module is plain
// TS and easy to render-test in isolation.
//
// Brand look per the Mushnoom style guide (see lib/render/brand.ts): Black Olive
// background, Playfair Display headlines, Inter for labels/body, Vista Blue
// accents, and the wordmark/logo. Tuned for a 1080-wide canvas (all IG/FB ratios
// share that width).

import type { RenderTemplateKey } from "./templates";
import { BRAND, RENDER } from "./brand";
import { LOGO } from "./logo";

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
// in (see logoImage / LOGO in this file) — the single place to swap.
const wordmark = (): El =>
  LOGO
    ? { type: "img", props: { src: LOGO, style: { height: 40 } } }
    : txt({ fontFamily: BODY, fontWeight: 700, fontSize: 30, letterSpacing: 0.5, color: FG }, "mushnoom");

/** Shared page shell: wordmark header, centered body, optional footer line. */
function frame(children: El[], footer?: string): El {
  return box(
    {
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
    ]
  );
}

const hookPage = (hook: string, footer?: string): El =>
  frame([txt({ fontFamily: HEAD, fontWeight: 700, fontSize: 78, lineHeight: 1.12 }, hook)], footer);

const ingredientPage = (idx: string, name: string, benefit: string): El =>
  frame([
    txt({ fontFamily: BODY, fontSize: 24, fontWeight: 700, letterSpacing: 6, color: ACCENT }, idx),
    txt({ fontFamily: HEAD, fontSize: 92, fontWeight: 700, marginTop: 18, lineHeight: 1.05 }, name),
    txt({ fontFamily: BODY, fontSize: 38, color: MUTED, marginTop: 20, lineHeight: 1.3 }, benefit),
  ]);

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

/** Build the ordered pages for a template from its fielded copy. */
export function buildPages(
  templateKey: RenderTemplateKey,
  f: Record<string, string>
): El[] {
  switch (templateKey) {
    case "ingredients_carousel":
      return [
        hookPage(f.hook, "Swipe »"),
        ingredientPage("01", f.ingredient_1, f.benefit_1),
        ingredientPage("02", f.ingredient_2, f.benefit_2),
        ingredientPage("03", f.ingredient_3, f.benefit_3),
      ];
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
