import type { Config } from "tailwindcss";

/**
 * Design system (from Master Build Spec §5):
 * flat, clean white surfaces, 0.5px borders, generous whitespace,
 * NO gradients / NO shadows. Sans-serif. Sentence case.
 *
 * WHY a tiny palette: the look is defined by restraint. We give ourselves
 * one ink color, one muted gray, one hairline border, and a single accent.
 * Anything fancier fights the brief.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1a1a1a",        // primary text
        muted: "#6b6b6b",      // secondary text
        faint: "#9b9b9b",      // tertiary / captions
        line: "#e6e6e6",       // hairline borders
        surface: "#ffffff",    // cards / panels
        canvas: "#fafafa",     // app background
        accent: "#1a1a1a",     // we keep accent = ink for a mono, flat feel
        ok: "#1f7a4d",         // claims ok / positive delta
        warn: "#9a6b00",       // claims needs review
        bad: "#a13b2f",        // rejected / negative delta
      },
      borderWidth: {
        // 0.5px hairline — the spec's signature detail.
        hairline: "0.5px",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      maxWidth: {
        content: "1180px",
      },
    },
  },
  plugins: [],
};

export default config;
