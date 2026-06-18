// Brand artwork for the rendered posts. Drop the files in lib/render/logo/ and
// they're automatically placed on every post; until a file exists, the renderer
// falls back to a plain-text wordmark (and simply omits the corner icon).
//
// Two slots, both in the LIGHT/white version since they sit on the dark Black
// Olive background:
//   • the WORDMARK ("mushnoom-logo.svg|png") — header, top of every page.
//   • the ICON     ("mushnoom-icon.svg|png")  — small mark, bottom-right corner.
//
// Loaded once as data URIs so Satori can embed them without a network fetch.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DIR = join(process.cwd(), "lib/render/logo");

function load(candidates: { file: string; mime: string }[]): string | null {
  for (const c of candidates) {
    const p = join(DIR, c.file);
    if (existsSync(p)) {
      return `data:${c.mime};base64,${readFileSync(p).toString("base64")}`;
    }
  }
  return null;
}

/** Wordmark logo as a data URI, or null if no file has been added yet. */
export const LOGO: string | null = load([
  { file: "mushnoom-logo.svg", mime: "image/svg+xml" },
  { file: "mushnoom-logo.png", mime: "image/png" },
]);

/** Corner icon (favicon mark) as a data URI, or null if no file exists yet. */
export const ICON: string | null = load([
  { file: "mushnoom-icon.svg", mime: "image/svg+xml" },
  { file: "mushnoom-icon.png", mime: "image/png" },
]);
