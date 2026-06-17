// Mushnoom brand tokens — the single source of truth for rendering, taken from
// the Mushnoom Brand Style Guidelines. To align the renderer with the brand,
// edit THIS file (and drop matching font files in ./fonts); nothing else needs
// to change.

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
