# Project: raemy ai — Marketing & Content Ops

## Identity
AI-native, data-driven marketing & content operations for SMBs. AI runs the
operating layer; a human owns strategy and every client-facing approval. First
client: Mushnoom (execution-layer mode).

## Hard rules (never violate)
1. No content_item reaches `scheduled` or `posted` unless canPublish(item) is true
   (claims_checked === true AND approved_by set).
2. Claims: structure/function only ("supports focus"). Never disease claims
   ("treats", "cures"). FDA disclaimer where required. Check reel transcripts too.
3. Generation is automated; publishing is human-approved.
4. Log tokens + cost to usage_log on every model call; enforce per-client quota.
5. Orchestrate, don't build: integrate Drive, Canva, a clipping tool, a posting API,
   an ASR API. Do not hand-build video editing or platform OAuth.

## Stack
TypeScript · Anthropic SDK · Next.js (App Router) · Vercel · Supabase (Postgres,
sole system of record) · Vercel Cron. No Make.com. No Airtable.
Haiku for parsing/triage; Sonnet/Opus for drafting.

## Patterns
- Shared runAgent(config, input) -> structured JSON; per-agent config objects.
- Cron routes under app/api/cron/[name]/route.ts.
- Content quality lives in the social-content-creator skill (the prompt), not the
  app. When output is wrong, fix the skill, not the plumbing.

## Build order
Front-end prototype first (mock data) → data layer → generation → ingestion →
review/schedule → posting → analyst/reporting. Each phase must be usable alone.

## Working style with Nikit
- Coding beginner: explain errors in plain language, show the fix and WHY.
- Honest and direct, no fluff. Flag scope creep back toward planning over shipping.

## Status
- **Phase 1 (front-end prototype): in progress.** Four core screens built with mock
  data from `lib/mock/data.ts`. No backend wired yet. Strategy + Report screens stubbed.
- Phases 2–7: not started. Stubs live in `lib/` and `app/api/` with `// TODO(Phase N)`.
