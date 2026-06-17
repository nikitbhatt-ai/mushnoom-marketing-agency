import { NextResponse } from "next/server";
import {
  consumeOAuthState,
  exchangeCodeForTokens,
  isCanvaOAuthConfigured,
  storeConnection,
} from "@/lib/integrations/canva-oauth";
import { getDefaultClientId } from "@/lib/db/queries";

export const runtime = "nodejs";

// GET /api/canva/callback — Canva redirects here after the user approves.
// Looks the PKCE verifier back up by `state` (server-side, no cookie), exchanges
// the code for tokens, and stores them against the client. Then bounces back to
// Settings. Tokens never touch the browser.

function back(reason: "connected" | "error", detail?: string): NextResponse {
  const base = process.env.CANVA_REDIRECT_URI ?? "http://localhost:3000";
  const url = new URL(base);
  url.pathname = "/settings";
  url.search = "";
  url.searchParams.set("canva", reason);
  if (detail) url.searchParams.set("detail", detail);
  return NextResponse.redirect(url);
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

  // Look up the verifier we stored when the flow started (CSRF + PKCE in one).
  const verifier = await consumeOAuthState(state);
  if (!verifier) return back("error", "state_mismatch");

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
