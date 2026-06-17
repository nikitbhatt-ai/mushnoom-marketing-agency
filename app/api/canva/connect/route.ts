import { NextResponse } from "next/server";
import {
  buildAuthorizeUrl,
  challengeFor,
  isCanvaOAuthConfigured,
  makeState,
  makeVerifier,
  saveOAuthState,
} from "@/lib/integrations/canva-oauth";

export const runtime = "nodejs";

// GET /api/canva/connect — start the Canva OAuth flow.
// Mints a PKCE verifier + state, stores them server-side keyed by state, and
// redirects to Canva's consent screen. The callback looks the verifier back up
// by state — no cookie has to survive the round-trip.

export async function GET() {
  if (!isCanvaOAuthConfigured()) {
    return NextResponse.json(
      { error: "Canva OAuth isn't configured (CANVA_CLIENT_ID / SECRET / REDIRECT_URI)." },
      { status: 501 }
    );
  }

  const verifier = makeVerifier();
  const state = makeState();
  await saveOAuthState(state, verifier);

  return NextResponse.redirect(buildAuthorizeUrl(state, challengeFor(verifier)));
}
