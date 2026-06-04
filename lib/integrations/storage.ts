// Public asset hosting for rendered content (Phase 3).
//
// Canva export URLs are temporary, but a post needs its media at a STABLE public
// URL at publish time (§6). So we rehost each exported PNG into a PUBLIC Supabase
// Storage bucket and hand back the durable public URL. Storage is part of our
// existing system of record — no extra vendor (orchestrate, don't build).
//
// Setup note: the bucket (default "content-assets", override CONTENT_ASSETS_BUCKET)
// must exist and be PUBLIC. It holds only rendered, non-sensitive marketing images.

import { getServiceClient } from "@/lib/db/supabase";

const BUCKET = process.env.CONTENT_ASSETS_BUCKET ?? "content-assets";

/**
 * Fetch a (temporary) remote image and store it in the public bucket at `path`.
 * Returns the durable public URL. Overwrites on repeat so re-renders are idempotent.
 */
export async function rehostImage(srcUrl: string, path: string): Promise<string> {
  const db = getServiceClient();
  if (!db) throw new Error("Supabase is not configured; cannot store assets.");

  const res = await fetch(srcUrl);
  if (!res.ok) throw new Error(`Failed to fetch render (${res.status}).`);
  const bytes = Buffer.from(await res.arrayBuffer());

  const { error } = await db.storage.from(BUCKET).upload(path, bytes, {
    contentType: "image/png",
    upsert: true,
  });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
