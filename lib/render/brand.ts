// Mushnoom brand tokens — the bundled default identity and the fallback for any
// per-client brand kit field that's unset (see BrandKit / DEFAULT_BRAND_KIT).

import { LOGO, ICON } from "./logo";

export const BRAND = {
  colors: {
    blackOlive: "#262E29", // Primary — dark background
    greenGray: "#47564A", //  Primary — muted green
    vistaBlue: "#92A1CF", //  Secondary — accent
    oWhite: "#F3F3F3", //     Secondary — near-white (text on dark)
    black: "#000000",
    white: "#FFFFFF",
  },
  fonts: {
    heading: "Playfair Display", // Bold/Medium for headings
    body: "Inter", //              Regular for body, Bold for emphasis/labels
  },
} as const;

// Derived render roles (so layouts read intent, not raw hex).
export const RENDER = {
  bg: BRAND.colors.blackOlive,
  text: BRAND.colors.oWhite,
  accent: BRAND.colors.vistaBlue,
  muted: "rgba(243, 243, 243, 0.7)", // dimmed O White for secondary lines
} as const;

// ---------------------------------------------------------------------------
// BrandKit — the resolved, per-client visual identity the layouts render from.
// Multi-tenant: instead of reading the constants above directly, every layout
// takes one of these. The loader (lib/render/loadBrandKit) builds it from a
// client's brand_kits row + uploaded assets, falling back field-by-field to
// DEFAULT_BRAND_KIT below, so a client with no kit still renders.
// ---------------------------------------------------------------------------
export interface BrandKit {
  /** Used for the text wordmark when no logo image is set. */
  name: string;
  bg: string;
  text: string;
  accent: string;
  muted: string;
  surface: string;
  headingFont: string; // font family name
  bodyFont: string; //    font family name
  logo: string | null; // data URI, or null -> text wordmark
  icon: string | null; // data URI, or null -> no corner mark
}

/** The bundled Mushnoom identity — also the fallback for any unset kit field. */
export const DEFAULT_BRAND_KIT: BrandKit = {
  name: "mushnoom",
  bg: RENDER.bg,
  text: RENDER.text,
  accent: RENDER.accent,
  muted: RENDER.muted,
  surface: BRAND.colors.greenGray,
  headingFont: BRAND.fonts.heading,
  bodyFont: BRAND.fonts.body,
  logo: LOGO,
  icon: ICON,
};
