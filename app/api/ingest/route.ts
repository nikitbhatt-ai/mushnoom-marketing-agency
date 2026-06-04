import { NextResponse } from "next/server";
import { lookup } from "node:dns/promises";
import { extractSourceText, type ExtractInput } from "@/lib/agents/extract";
import { isAnthropicConfigured, QuotaExceededError } from "@/lib/agents/anthropic";
import { createSourceFile, getDefaultClientId } from "@/lib/db/queries";

export const runtime = "nodejs";

// POST /api/ingest — Phase 4 slice feeding Phase 3.
// Accepts EITHER a multipart upload (a PDF file) OR JSON { url }. Extracts clean
// source text (PDFs go to Claude as native documents — orchestrate, don't build)
// and saves it as a source_files row the generator can draft from.
//
// Without ANTHROPIC_API_KEY we can't extract, so we return 501 and the UI shows a
// "add the key on Vercel" notice rather than faking a result.

const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: Request) {
  if (!isAnthropicConfigured()) {
    return NextResponse.json(
      { error: "Live ingestion needs ANTHROPIC_API_KEY (add it on Vercel)." },
      { status: 501 }
    );
  }

  const clientId = await getDefaultClientId();
  if (!clientId) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 501 }
    );
  }

  try {
    const contentType = req.headers.get("content-type") ?? "";
    let extractInput: ExtractInput;
    let name: string;
    let source: string;

    if (contentType.includes("multipart/form-data")) {
      // --- uploaded file ---
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
      }
      if (file.type !== "application/pdf") {
        return NextResponse.json(
          { error: "Only PDF uploads are supported right now." },
          { status: 415 }
        );
      }
      const bytes = Buffer.from(await file.arrayBuffer());
      if (bytes.byteLength > MAX_PDF_BYTES) {
        return NextResponse.json(
          { error: "PDF is too large (max 10 MB)." },
          { status: 413 }
        );
      }
      extractInput = { kind: "pdf", base64: bytes.toString("base64") };
      name = file.name || "Uploaded PDF";
      source = "upload";
    } else {
      // --- research link ---
      const { url } = (await req.json()) as { url?: string };
      if (!url || !/^https?:\/\//i.test(url)) {
        return NextResponse.json(
          { error: "Provide a valid http(s) URL." },
          { status: 400 }
        );
      }
      // SSRF guard: don't let the server fetch internal/private addresses.
      const blocked = await isBlockedUrl(url);
      if (blocked) {
        return NextResponse.json({ error: blocked }, { status: 400 });
      }
      const res = await fetch(url, { redirect: "follow" });
      if (!res.ok) {
        return NextResponse.json(
          { error: `Could not fetch the link (${res.status}).` },
          { status: 422 }
        );
      }
      const ct = res.headers.get("content-type") ?? "";
      if (ct.includes("application/pdf") || /\.pdf($|\?)/i.test(url)) {
        const bytes = Buffer.from(await res.arrayBuffer());
        if (bytes.byteLength > MAX_PDF_BYTES) {
          return NextResponse.json(
            { error: "Linked PDF is too large (max 10 MB)." },
            { status: 413 }
          );
        }
        extractInput = { kind: "pdf", base64: bytes.toString("base64") };
      } else {
        const html = await res.text();
        extractInput = { kind: "text", text: htmlToText(html) };
      }
      name = url;
      source = "url";
    }

    const { text } = await extractSourceText(extractInput, clientId);
    if (!text.trim()) {
      return NextResponse.json(
        { error: "Couldn't extract any usable text from that source." },
        { status: 422 }
      );
    }

    const saved = await createSourceFile({
      clientId,
      name,
      source,
      transcript: text,
    });
    return NextResponse.json({ source: saved });
  } catch (err) {
    if (err instanceof QuotaExceededError) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    const message = err instanceof Error ? err.message : "Ingestion failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Basic SSRF guard: resolve the host and reject private/loopback/link-local
 * addresses so a pasted link can't make the server hit internal services or the
 * cloud metadata endpoint. Note: redirects are still followed, so this is a
 * baseline — hardening every hop is a follow-up. Returns an error string if
 * blocked, else null.
 */
async function isBlockedUrl(url: string): Promise<string | null> {
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    return "Invalid URL.";
  }
  if (/^(localhost|.*\.local|metadata\.google\.internal)$/i.test(host)) {
    return "That host is not allowed.";
  }
  try {
    const results = await lookup(host, { all: true });
    if (results.some((r) => isPrivateAddress(r.address))) {
      return "That URL resolves to a private address and isn't allowed.";
    }
  } catch {
    return "Couldn't resolve that host.";
  }
  return null;
}

function isPrivateAddress(ip: string): boolean {
  // IPv4 private / loopback / link-local ranges.
  const m = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (m) {
    const [a, b] = [Number(m[1]), Number(m[2])];
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true; // link-local (incl. metadata)
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    return false;
  }
  // IPv6 loopback / unique-local / link-local.
  const low = ip.toLowerCase();
  return low === "::1" || low.startsWith("fc") || low.startsWith("fd") || low.startsWith("fe80");
}

/** Crude HTML -> text: drop scripts/styles, strip tags, collapse whitespace.
 * Good enough to hand to the extractor, which does the real cleanup. */
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}
