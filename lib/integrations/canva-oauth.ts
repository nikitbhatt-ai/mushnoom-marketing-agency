// Canva Connect OAuth (Phase 3) — the multi-tenant "Connect Canva" flow.
//
// The APP is the Canva integration (one Client ID/Secret, app-level env). Each
// CLIENT connects their own Canva account by authorizing; we store their tokens
// per-client and auto-refresh them. This is what makes the render pipeline work
// in production without anyone pasting tokens into a terminal.
//
// Flow: /api/canva/connect builds an authorize URL (PKCE) -> user approves on
// Canva -> /api/canva/callback exchanges the code for tokens -> we store them.
// Before any Canva API call, getValidAccessToken() refreshes if near expiry.
//
// Orchestrate, don't build (hard rule 5): standard OAuth 2.0 + PKCE against
// Canva's endpoints; no auth framework of our own.

import { createHash, randomBytes } from "node:crypto";
import { getServiceClient } from "@/lib/db/supabase";

const AUTHORIZE_URL = "https://www.canva.com/api/oauth/authorize";
const TOKEN_URL = "https://api.canva.com/rest/v1/oauth/token";

// Scopes the render pipeline needs: autofill a template into a design, export it.
export const CANVA_SCOPES = [
  "design:content:read",
  "design:content:write",
  "brandtemplate:meta:read",
  "brandtemplate:content:read",
].join(" ");

// Refresh a little before the real 4h expiry so a call never races the cutoff.
const EXPIRY_SKEW_MS = 5 * 60 * 1000;

export function isCanvaOAuthConfigured(): boolean {
  return Boolean(
    process.env.CANVA_CLIENT_ID &&
      process.env.CANVA_CLIENT_SECRET &&
      process.env.CANVA_REDIRECT_URI
  );
}

function clientId(): string {
  const v = process.env.CANVA_CLIENT_ID;
  if (!v) throw new Error("CANVA_CLIENT_ID is not set.");
  return v;
}
function clientSecret(): string {
  const v = process.env.CANVA_CLIENT_SECRET;
  if (!v) throw new Error("CANVA_CLIENT_SECRET is not set.");
  return v;
}
function redirectUri(): string {
  const v = process.env.CANVA_REDIRECT_URI;
  if (!v) throw new Error("CANVA_REDIRECT_URI is not set.");
  return v;
}

// --- PKCE ------------------------------------------------------------------

const b64url = (buf: Buffer) =>
  buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

/** A fresh PKCE verifier (kept in an httpOnly cookie until the callback). */
export function makeVerifier(): string {
  return b64url(randomBytes(96)).slice(0, 110);
}
export function challengeFor(verifier: string): string {
  return b64url(createHash("sha256").update(verifier).digest());
}
/** Random opaque state to tie /connect to /callback (CSRF guard). */
export function makeState(): string {
  return b64url(randomBytes(16));
}

/** The Canva consent URL to send the user to. */
export function buildAuthorizeUrl(state: string, codeChallenge: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId(),
    redirect_uri: redirectUri(),
    scope: CANVA_SCOPES,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state,
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

// --- token endpoint --------------------------------------------------------

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number; // seconds
  scope?: string;
}

async function postToken(body: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId(),
      client_secret: clientSecret(),
      ...body,
    }).toString(),
  });
  if (!res.ok) {
    throw new Error(`Canva token request failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as TokenResponse;
}

/** Exchange the authorization code (+ PKCE verifier) for tokens. */
export function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<TokenResponse> {
  return postToken({
    grant_type: "authorization_code",
    code,
    code_verifier: codeVerifier,
    redirect_uri: redirectUri(),
  });
}

function refreshTokens(refreshToken: string): Promise<TokenResponse> {
  return postToken({ grant_type: "refresh_token", refresh_token: refreshToken });
}

// --- storage (per client) --------------------------------------------------

async function saveTokens(clientIdValue: string, t: TokenResponse): Promise<void> {
  const db = getServiceClient();
  if (!db) throw new Error("Supabase is not configured; cannot store Canva tokens.");
  const expiresAt = new Date(Date.now() + t.expires_in * 1000).toISOString();
  const { error } = await db.from("canva_connections").upsert({
    client_id: clientIdValue,
    access_token: t.access_token,
    refresh_token: t.refresh_token,
    expires_at: expiresAt,
    scopes: t.scope ?? CANVA_SCOPES,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(`Failed to store Canva tokens: ${error.message}`);
}

/** Persist the tokens from a fresh authorization (called by the callback). */
export async function storeConnection(
  clientIdValue: string,
  tokens: TokenResponse
): Promise<void> {
  await saveTokens(clientIdValue, tokens);
}

export interface CanvaConnectionStatus {
  connected: boolean;
  expiresAt?: string;
  scopes?: string;
}

/** Whether (and until when) a client has a Canva connection — for the UI. */
export async function getConnectionStatus(
  clientIdValue: string
): Promise<CanvaConnectionStatus> {
  const db = getServiceClient();
  if (!db) return { connected: false };
  const { data } = await db
    .from("canva_connections")
    .select("expires_at, scopes")
    .eq("client_id", clientIdValue)
    .maybeSingle();
  if (!data) return { connected: false };
  return { connected: true, expiresAt: data.expires_at, scopes: data.scopes };
}

/**
 * Return a valid access token for the client, refreshing it first if it's at or
 * near expiry. Throws if the client hasn't connected Canva yet. This is the only
 * function the render path should call to get a token.
 */
export async function getValidAccessToken(clientIdValue: string): Promise<string> {
  const db = getServiceClient();
  if (!db) throw new Error("Supabase is not configured.");
  const { data, error } = await db
    .from("canva_connections")
    .select("access_token, refresh_token, expires_at")
    .eq("client_id", clientIdValue)
    .maybeSingle();
  if (error || !data) {
    throw new Error("This client hasn't connected Canva yet.");
  }

  const expiresMs = new Date(data.expires_at).getTime();
  if (Date.now() < expiresMs - EXPIRY_SKEW_MS) {
    return data.access_token; // still fresh
  }

  // Near/at expiry: refresh and persist the new pair (Canva rotates refresh tokens).
  const refreshed = await refreshTokens(data.refresh_token);
  await saveTokens(clientIdValue, refreshed);
  return refreshed.access_token;
}
