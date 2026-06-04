// Canva render — the "hands" (Phase 3). Autofill an on-brand BRAND TEMPLATE with
// generated copy and export it to PNG. Orchestrate, don't build (hard rule 5):
// Canva owns the layout and the pixels; we only fill named fields and pull the
// result. The templates themselves live in lib/integrations/canva-templates.ts.
//
// This talks to the Canva CONNECT REST API — NOT the MCP server, which is a
// dev-time tool, not something a Vercel route can call. It needs a Connect access
// token in CANVA_CONNECT_TOKEN; when that's unset the caller returns 501, the same
// graceful-degradation pattern as Anthropic and Supabase.

const CANVA_API = "https://api.canva.com/rest/v1";

export function isCanvaConfigured(): boolean {
  return Boolean(process.env.CANVA_CONNECT_TOKEN);
}

function authHeaders(): Record<string, string> {
  const token = process.env.CANVA_CONNECT_TOKEN;
  if (!token) throw new Error("CANVA_CONNECT_TOKEN is not set.");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/** One autofill field. Every Mushnoom template field is text today. */
export type AutofillData = Record<string, { type: "text"; text: string }>;

export interface RenderResult {
  designId: string;
  /** One PNG URL per page, in order. Canva-hosted and TEMPORARY — rehost before publish. */
  pageUrls: string[];
}

// Autofill and export are async jobs on Canva's side; we poll until they settle.
const POLL_INTERVAL_MS = 1500;
const POLL_MAX_ATTEMPTS = 40; // ~60s ceiling before we give up.

/* eslint-disable @typescript-eslint/no-explicit-any */
async function pollJob(path: string): Promise<any> {
  for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    const res = await fetch(`${CANVA_API}${path}`, { headers: authHeaders() });
    if (!res.ok) throw new Error(`Canva poll ${path} failed: ${res.status}`);
    const job = (await res.json()).job;
    if (job?.status === "success") return job;
    if (job?.status === "failed") {
      throw new Error(`Canva job failed: ${job.error?.message ?? "unknown error"}`);
    }
  }
  throw new Error(`Canva job timed out after ${POLL_MAX_ATTEMPTS} polls.`);
}

/** Fill a brand template with `data`; return the new design's id. */
async function autofill(brandTemplateId: string, data: AutofillData): Promise<string> {
  const res = await fetch(`${CANVA_API}/autofills`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ brand_template_id: brandTemplateId, data }),
  });
  if (!res.ok) {
    throw new Error(`Canva autofill failed: ${res.status} ${await res.text()}`);
  }
  const job = (await res.json()).job;
  const done = job.status === "success" ? job : await pollJob(`/autofills/${job.id}`);
  const designId = done.result?.design?.id;
  if (!designId) throw new Error("Canva autofill returned no design id.");
  return designId;
}

/** Export a design to PNG; return one URL per page, in order. */
async function exportPng(designId: string): Promise<string[]> {
  const res = await fetch(`${CANVA_API}/exports`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ design_id: designId, format: { type: "png" } }),
  });
  if (!res.ok) {
    throw new Error(`Canva export failed: ${res.status} ${await res.text()}`);
  }
  const job = (await res.json()).job;
  const done = job.status === "success" ? job : await pollJob(`/exports/${job.id}`);
  const urls: string[] = done.urls ?? [];
  if (!urls.length) throw new Error("Canva export returned no URLs.");
  return urls;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Render a brand template: autofill its named fields with `data`, then export to
 * PNG. Returns the design id and one (temporary) PNG URL per page. The caller is
 * responsible for rehosting those URLs somewhere public before publish (§6).
 */
export async function renderTemplate(
  brandTemplateId: string,
  data: AutofillData
): Promise<RenderResult> {
  const designId = await autofill(brandTemplateId, data);
  const pageUrls = await exportPng(designId);
  return { designId, pageUrls };
}
