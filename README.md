# raemy ai — Marketing & Content Ops

AI-native, data-driven marketing & content operations for SMBs. AI runs the
repeatable operating layer (content generation, scheduling, reporting); a human
owns strategy, exceptions, and every client-facing approval.

First deployment: **Mushnoom** (execution-layer mode).

> The full plan lives in the Master Build Spec. The differentiator is data
> discipline: no decision without a number behind it, and every decision logged
> with its rationale and result.

## Status — Phase 1 (front-end prototype)

This repo currently contains the **clickable front-end prototype** (mock data, no
backend) — the cheapest sales asset. Four core screens are live:

- **Overview** (`/`) — metric cards, this-week row, and the decision log (the moat).
- **Content generator** (`/generator`) — pick a Drive source, choose formats /
  platform / pillar, generate drafts, each with a claims badge.
- **Review queue** (`/review`) — approve / edit / reject; the claims gate is
  enforced (a flagged disease claim can't be approved until fixed).
- **Calendar** (`/calendar`) — approved posts scheduled by day with platform chips.

Strategy intake and Client report are stubbed (Phase 7).

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in when wiring later phases
npm run dev                  # http://localhost:3000
```

`npm run typecheck` and `npm run build` should both pass on the prototype.

## Stack

TypeScript · Anthropic SDK · Next.js (App Router) · Vercel · Supabase (Postgres,
sole system of record) · Vercel Cron. No Make.com. No Airtable.

## Repo map

```
app/(app)/            the four screens + strategy/report stubs
app/api/              generate + cron routes (stubbed until their phase)
components/           flat UI matching the mockups
lib/types.ts          shared domain types (mirror the schema)
lib/guards.ts         canPublish() — the hard human-in-the-loop gate
lib/mock/data.ts      Phase 1 mock data (Mushnoom)
lib/db/schema.sql     Supabase schema (run in Phase 2)
lib/agents/           runAgent + amplifier.config (the skill)
lib/integrations/     drive · transcribe · canva · clipper · poster (stubs)
CLAUDE.md             project rules for future sessions
```

## Build order

Front-end prototype (now) → data layer → generation → ingestion →
review/schedule → posting → analyst/reporting. Each phase ships something usable.
