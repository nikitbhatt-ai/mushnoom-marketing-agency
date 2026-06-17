// Output sizes for rendered posts, in the ratios Instagram & Facebook use.
// Portrait 4:5 is the default: it's the largest format that BOTH IG and FB feeds
// show without cropping, and it's what the brand templates were designed at.

export type AspectKey = "portrait" | "square" | "story";

export interface RenderSize {
  width: number;
  height: number;
}

export const SIZES: Record<AspectKey, RenderSize> = {
  portrait: { width: 1080, height: 1350 }, // 4:5 — IG + FB feed (default)
  square: { width: 1080, height: 1080 }, //   1:1 — IG + FB feed
  story: { width: 1080, height: 1920 }, //    9:16 — Stories / Reels
};

export const DEFAULT_ASPECT: AspectKey = "portrait";

export function isAspectKey(v: unknown): v is AspectKey {
  return v === "portrait" || v === "square" || v === "story";
}
