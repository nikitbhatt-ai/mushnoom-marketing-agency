import { NextResponse } from "next/server";
import {
  buildAuthorizeUrl,
  challengeFor,
  isCanvaOAuthConfigured,
  makeState,
  makeVerifier,
} from "@/lib/integrations/canva-oauth";

export const runtime = "nodejs";

// GET /api/canva/connect — start the Canva OAuth flow.
// Mints a PKCE verifier + state, stashes them in short-lived httpOnly cookies,
// and redirects the user to Canva's consent screen. The callback reads the
// cookies back to complete the exchange.

export async function GET() {
  if (!isCanvaOAuthConfigured()) {
    return NextResponse.json(
      { error: "Canva OAuth isn't configured (CANVA_CLIENT_ID / SECRET / REDIRECT_URI)." },
      { status: 501 }
    );
  }

  const verifier = makeVerifier();
  const state = makeState();
  const url = buildAuthorizeUrl(state, challengeFor(verifier));

  const res = NextResponse.redirect(url);
  const cookie = {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 600, // 10 min — the code is short-lived anyway
  };
  res.cookies.set("canva_pkce_verifier", verifier, cookie);
  res.cookies.set("canva_oauth_state", state, cookie);
  return res;
}
