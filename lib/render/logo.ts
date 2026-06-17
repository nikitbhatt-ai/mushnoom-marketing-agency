// Brand logo for the rendered posts. Drop the Mushnoom wordmark file in
// lib/render/logo/ (a transparent PNG or SVG, in the LIGHT/white version since it
// sits on the dark background) and it's automatically placed on every post.
// Until a file exists, the renderer falls back to a plain-text wordmark.
//
// Loaded once as a data URI so Satori can embed it without a network fetch.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DIR = join(process.cwd(), "lib/render/logo");
const CANDIDATES: { file: string; mime: string }[] = [
  { file: "mushnoom-logo.svg", mime: "image/svg+xml" },
  { file: "mushnoom-logo.png", mime: "image/png" },
];

function load(): string | null {
  for (const c of CANDIDATES) {
    const p = join(DIR, c.file);
    if (existsSync(p)) {
      return `data:${c.mime};base64,${readFileSync(p).toString("base64")}`;
    }
  }
  return null;
}

/** Logo as a data URI, or null if no logo file has been added yet. */
export const LOGO: string | null = load();
