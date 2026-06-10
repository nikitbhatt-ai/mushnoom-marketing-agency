// Public asset hosting for rendered content (Phase 3).
//
// Canva export URLs are temporary, but a post needs its media at a STABLE public
// URL at publish time (§6). So we rehost each exported PNG into a PUBLIC Google
// Cloud Storage bucket and hand back the durable public URL. GCS is part of our
// GCP stack — no extra vendor (orchestrate, don't build).
//
// Setup note: the bucket (set GCS_ASSETS_BUCKET) must exist and be readable by
// allUsers (public). On Cloud Run, auth is automatic via the service account's
// Application Default Credentials — no key file needed. It holds only rendered,
// non-sensitive marketing images.

import { Storage } from "@google-cloud/storage";

const BUCKET = process.env.GCS_ASSETS_BUCKET ?? "content-assets";

// Lazy singleton. On GCP, Application Default Credentials are picked up from the
// runtime service account; locally, set GOOGLE_APPLICATION_CREDENTIALS to a key.
let cached: Storage | null = null;
function getStorage(): Storage {
  if (!cached) cached = new Storage();
  return cached;
}

/**
 * Fetch a (temporary) remote image and store it in the public bucket at `path`.
 * Returns the durable public URL. Overwrites on repeat so re-renders are idempotent.
 */
export async function rehostImage(srcUrl: string, path: string): Promise<string> {
  const res = await fetch(srcUrl);
  if (!res.ok) throw new Error(`Failed to fetch render (${res.status}).`);
  const bytes = Buffer.from(await res.arrayBuffer());

  const file = getStorage().bucket(BUCKET).file(path);
  await file.save(bytes, {
    contentType: "image/png",
    resumable: false,
    metadata: { cacheControl: "public, max-age=31536000" },
  });

  // Bucket is public (allUsers: objectViewer), so the canonical object URL is
  // durable and needs no signing.
  return `https://storage.googleapis.com/${BUCKET}/${path}`;
}
