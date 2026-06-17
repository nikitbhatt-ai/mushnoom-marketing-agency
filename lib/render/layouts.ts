// Post layouts for the self-hosted renderer. These return Satori element objects
// (the same {type, props} shape React produces) — no JSX, so the module is plain
// TS and easy to render-test in isolation.
//
// Brand look mirrors the Mushnoom templates: deep forest background, cream serif
// headlines, a small "mushnoom" wordmark, sans for labels/body. Tuned for a
// 1080-wide canvas (all IG/FB ratios share that width).

import type { RenderTemplateKey } from "./templates";

/* eslint-disable @typescript-eslint/no-explicit-any */
type El = { type: string; props: { style: Record<string, any>; children?: any } };

const BG = "#2d342a";
const FG = "#f3efe6";
const MUTED = "#aeb6a3";

const box = (style: Record<string, any>, children: any): El => ({
  type: "div",
  props: { style: { display: "flex", ...style }, children },
});
const txt = (style: Record<string, any>, s: string): El => ({
  type: "div",
  props: { style, children: s },
});

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
      fontFamily: "Serif",
    },
    [
      box({ justifyContent: "flex-end" }, [
        txt({ fontFamily: "Sans", fontWeight: 700, fontSize: 32, letterSpacing: 1 }, "mushnoom"),
      ]),
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
        ? [txt({ fontFamily: "Sans", fontSize: 28, color: MUTED }, footer)]
        : []),
    ]
  );
}

const hookPage = (hook: string, footer?: string): El =>
  frame([txt({ fontSize: 78, fontWeight: 700, lineHeight: 1.12 }, hook)], footer);

const ingredientPage = (idx: string, name: string, benefit: string): El =>
  frame([
    txt({ fontFamily: "Sans", fontSize: 26, fontWeight: 700, letterSpacing: 6, color: MUTED }, idx),
    txt({ fontSize: 96, fontWeight: 700, marginTop: 18, lineHeight: 1.05 }, name),
    txt({ fontFamily: "Sans", fontSize: 40, color: MUTED, marginTop: 20 }, benefit),
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
            borderColor: FG,
            borderRadius: 28,
            paddingTop: 28,
            paddingBottom: 28,
            marginTop: 26,
            fontSize: 44,
          },
          [txt({}, o)]
        )
      )
    ),
  ]);

const ctaPage = (cta: string): El =>
  frame([txt({ fontSize: 74, fontWeight: 700, lineHeight: 1.15 }, cta)]);

const staticPage = (hook: string, body: string): El =>
  frame([
    txt({ fontSize: 76, fontWeight: 700, lineHeight: 1.12 }, hook),
    txt({ fontFamily: "Sans", fontSize: 38, color: MUTED, marginTop: 30, lineHeight: 1.4 }, body),
  ]);

/** Build the ordered pages for a template from its fielded copy. */
export function buildPages(
  templateKey: RenderTemplateKey,
  f: Record<string, string>
): El[] {
  switch (templateKey) {
    case "ingredients_carousel":
      return [
        hookPage(f.hook, "Swipe →"),
        ingredientPage("01", f.ingredient_1, f.benefit_1),
        ingredientPage("02", f.ingredient_2, f.benefit_2),
        ingredientPage("03", f.ingredient_3, f.benefit_3),
      ];
    case "poll_carousel":
      return [
        hookPage(f.hook, "Swipe →"),
        pollPage([f.option_1, f.option_2, f.option_3]),
        ctaPage(f.cta),
      ];
    case "announcement_static":
      return [staticPage(f.hook, f.body)];
  }
}
