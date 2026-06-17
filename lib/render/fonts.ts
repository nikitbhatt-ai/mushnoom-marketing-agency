// Brand fonts for the renderer, loaded from bundled .ttf files (committed in
// ./fonts and force-included in the Vercel build via next.config). Liberation
// fonts are SIL OFL 1.1 licensed, so redistributing them in-repo is fine.
//
// "Serif" carries headlines/wordmark; "Sans" carries labels and body.

import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface SatoriFont {
  name: string;
  data: Buffer;
  weight: 400 | 700;
  style: "normal";
}

const dir = join(process.cwd(), "lib/render/fonts");

let cache: SatoriFont[] | null = null;

export function brandFonts(): SatoriFont[] {
  if (!cache) {
    cache = [
      { name: "Serif", data: readFileSync(join(dir, "LiberationSerif-Regular.ttf")), weight: 400, style: "normal" },
      { name: "Serif", data: readFileSync(join(dir, "LiberationSerif-Bold.ttf")), weight: 700, style: "normal" },
      { name: "Sans", data: readFileSync(join(dir, "LiberationSans-Regular.ttf")), weight: 400, style: "normal" },
      { name: "Sans", data: readFileSync(join(dir, "LiberationSans-Bold.ttf")), weight: 700, style: "normal" },
    ];
  }
  return cache;
}
