// Brand-kit loader (Phase A, multi-tenant). Composes a client's resolved brand
// identity for the renderer from three sources, each with a graceful fallback:
//   1. brand_kits row    -> colors, font families, logo/icon paths
//   2. brand_fonts rows  -> uploaded font binaries (Satori needs the bytes)
//   3. brand-assets bucket -> the actual logo/icon/font files
//
// Anything missing falls back to the bundled Mushnoom default, so a client with
// no kit — or a database that hasn't run the brand_kits migration yet — still
// renders. This never throws: on any error it returns the default brand.

import { getServiceClient } from "@/lib/db/supabase";
import { brandFonts, type SatoriFont } from "./fonts";
import { DEFAULT_BRAND_KIT, type BrandKit } from "./brand";
import { defaultBrand, type ResolvedBrand } from "./renderer";

const BUCKET = "brand-assets";

/** Resolve a client's full brand identity (kit + font binaries) for rendering. */
export async function loadBrandKit(clientId: string): Promise<ResolvedBrand> {
  const db = getServiceClient();
  if (!db) return defaultBrand();

  try {
    const [{ data: client }, { data: row }, { data: fontRows }] = await Promise.all([
      db.from("clients").select("name").eq("id", clientId).maybeSingle(),
      db.from("brand_kits").select("*").eq("client_id", clientId).maybeSingle(),
      db.from("brand_fonts").select("*").eq("client_id", clientId),
    ]);

    // No kit row → keep the bundled identity, but still use the client's name
    // as the text wordmark when there's no logo.
    const colors = (row?.colors ?? {}) as Record<string, string>;
    const kit: BrandKit = {
      ...DEFAULT_BRAND_KIT,
      name: client?.name || DEFAULT_BRAND_KIT.name,
      bg: colors.bg || DEFAULT_BRAND_KIT.bg,
      text: colors.text || DEFAULT_BRAND_KIT.text,
      accent: colors.accent || DEFAULT_BRAND_KIT.accent,
      surface: colors.surface || DEFAULT_BRAND_KIT.surface,
      muted: colors.muted || rgba(colors.text, 0.7) || DEFAULT_BRAND_KIT.muted,
      headingFont: row?.heading_font || DEFAULT_BRAND_KIT.headingFont,
      bodyFont: row?.body_font || DEFAULT_BRAND_KIT.bodyFont,
      // Uploaded assets override the bundled logo/icon; null keeps the default.
      logo: (await dataUri(db, row?.logo_path)) ?? DEFAULT_BRAND_KIT.logo,
      icon: (await dataUri(db, row?.icon_path)) ?? DEFAULT_BRAND_KIT.icon,
    };

    // Bundled fonts first (so default families always resolve), then any uploaded.
    const fonts: SatoriFont[] = [...brandFonts()];
    for (const fr of fontRows ?? []) {
      const buf = await download(db, fr.storage_path);
      if (buf) {
        fonts.push({
          name: fr.family,
          data: buf,
          weight: fr.weight ?? 400,
          style: fr.style === "italic" ? "italic" : "normal",
        });
      }
    }

    return { kit, fonts };
  } catch {
    // Tables not migrated yet, storage error, etc. — never block a render.
    return defaultBrand();
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function download(db: any, path?: string | null): Promise<Buffer | null> {
  if (!path) return null;
  try {
    const { data, error } = await db.storage.from(BUCKET).download(path);
    if (error || !data) return null;
    return Buffer.from(await data.arrayBuffer());
  } catch {
    return null;
  }
}

async function dataUri(db: any, path?: string | null): Promise<string | null> {
  const buf = await download(db, path);
  if (!buf || !path) return null;
  return `data:${mimeFor(path)};base64,${buf.toString("base64")}`;
}

function mimeFor(path: string): string {
  const ext = path.toLowerCase().split(".").pop();
  if (ext === "svg") return "image/svg+xml";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "webp") return "image/webp";
  return "image/png";
}

/** "#RRGGBB" -> "rgba(r,g,b,a)"; null if not a 6-digit hex. */
function rgba(hex: string | undefined, a: number): string | null {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return null;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
