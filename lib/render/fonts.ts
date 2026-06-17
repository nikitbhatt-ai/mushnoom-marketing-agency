// Brand fonts for the renderer, loaded from bundled .woff files (committed in
// ./fonts and force-included in the Vercel build via next.config). These are the
// Mushnoom brand fonts per the style guide — Playfair Display (headings) and
// Inter (body/labels) — both SIL OFL, so redistributing them in-repo is fine.

import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface SatoriFont {
  name: string;
  data: Buffer;
  weight: number;
  style: "normal";
}

const dir = join(process.cwd(), "lib/render/fonts");
const read = (f: string) => readFileSync(join(dir, f));

let cache: SatoriFont[] | null = null;

export function brandFonts(): SatoriFont[] {
  if (!cache) {
    cache = [
      { name: "Playfair Display", data: read("PlayfairDisplay-700.woff"), weight: 700, style: "normal" },
      { name: "Playfair Display", data: read("PlayfairDisplay-500.woff"), weight: 500, style: "normal" },
      { name: "Inter", data: read("Inter-400.woff"), weight: 400, style: "normal" },
      { name: "Inter", data: read("Inter-700.woff"), weight: 700, style: "normal" },
    ];
  }
  return cache;
}
