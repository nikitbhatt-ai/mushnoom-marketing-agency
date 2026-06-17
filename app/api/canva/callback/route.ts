import { NextResponse } from "next/server";
import {
  exchangeCodeForTokens,
  isCanvaOAuthConfigured,
  storeConnection,
} from "@/lib/integrations/canva-oauth";
import { getDefaultClientId } from "@/lib/db/queries";

export const runtime = "nodejs";

// GET /api/canva/callback — Canva redirects here after the user approves.
// Validates the state, exchanges the code (+ PKCE verifier from the cookie) for
// tokens, and stores them against the client. Then bounces back to Settings.
//
// Nothing here is shown to the user except a redirect; tokens never touch the
// browser. Errors land on /settings?canva=error so the page can explain.

function back(reason: "connected" | "error", detail?: string): NextResponse {
  const url = new URL("/settings", process.env.CANVA_REDIRECT_URI ?? "http://localhost:3000");
  url.search = "";
  url.pathname = "/settings";
  url.searchParams.set("canva", reason);
  if (detail) url.searchParams.set("detail", detail);
  const res = NextResponse.redirect(url);
  // One-time cookies have done their job.
  res.cookies.delete("canva_pkce_verifier");
  res.cookies.delete("canva_oauth_state");
  return res;
}

export async function GET(req: Request) {
  if (!isCanvaOAuthConfigured()) {
    return NextResponse.json({ error: "Canva OAuth isn't configured." }, { status: 501 });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const denied = url.searchParams.get("error");
  if (denied) return back("error", denied);
  if (!code || !state) return back("error", "missing_code");

  // CSRF: the state we set in /connect must come back unchanged.
  const cookieHeader = req.headers.get("cookie") ?? "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const i = c.indexOf("=");
      return [c.slice(0, i).trim(), decodeURIComponent(c.slice(i + 1))];
    })
  );
  if (!cookies.canva_oauth_state || cookies.canva_oauth_state !== state) {
    return back("error", "state_mismatch");
  }
  const verifier = cookies.canva_pkce_verifier;
  if (!verifier) return back("error", "missing_verifier");

  try {
    const clientId = await getDefaultClientId();
    if (!clientId) return back("error", "no_client");
    const tokens = await exchangeCodeForTokens(code, verifier);
    await storeConnection(clientId, tokens);
    return back("connected");
  } catch (err) {
    const detail = err instanceof Error ? err.message.slice(0, 120) : "exchange_failed";
    return back("error", detail);
  }
}
