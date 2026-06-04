-- raemy ai — Supabase (Postgres) schema · sole system of record
-- Run this in the Supabase SQL editor when wiring Phase 2.
--
-- WHY these tables: `decisions` + `metrics_log` are the moat and the product
-- story (a queryable record of why every change was made and what it did).
-- `post_log` + the canPublish guard are the compliance shield for a
-- physician-founded brand.

-- ---------------------------------------------------------------------------
-- clients: one row per brand we operate. mode drives which playbook we run.
-- ---------------------------------------------------------------------------
create table if not exists clients (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  mode        text not null check (mode in ('execution', 'strategy')),
  brand_voice jsonb,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- source_files: raw inputs ingested from Drive (video/audio/doc) + transcript.
-- ---------------------------------------------------------------------------
create table if not exists source_files (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references clients(id) on delete cascade,
  source        text,                  -- e.g. 'google_drive'
  drive_file_id text,
  type          text,                  -- video | audio | image | doc
  transcript    text,
  frames_url    text,
  ingested_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- content_items: generated drafts and their lifecycle.
-- status: draft | in_review | approved | scheduled | posted | rejected
-- format: carousel | static | reel
-- ---------------------------------------------------------------------------
create table if not exists content_items (
  id               uuid primary key default gen_random_uuid(),
  client_id        uuid not null references clients(id) on delete cascade,
  source_file_id   uuid references source_files(id) on delete set null,
  format           text not null check (format in ('carousel', 'static', 'reel')),
  platform         text,                -- instagram | tiktok | ...
  copy             jsonb,               -- { hook, slides[], caption, hashtags[] }
  asset_url        text,
  status           text not null default 'draft'
                     check (status in ('draft','in_review','approved','scheduled','posted','rejected')),
  scheduled_for    timestamptz,
  posted_at        timestamptz,
  external_post_id text,
  claims_checked   boolean not null default false,
  approved_by      text,                -- null until a human approves
  created_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- review_queue: items awaiting a human, with Claude's first-pass flags.
-- ---------------------------------------------------------------------------
create table if not exists review_queue (
  id              uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references content_items(id) on delete cascade,
  flagged_issues  jsonb,               -- [{ type, severity, excerpt }]
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- post_log: every publish attempt and its result (the compliance shield).
-- ---------------------------------------------------------------------------
create table if not exists post_log (
  id              uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references content_items(id) on delete cascade,
  platform        text,
  result          text,                -- success | error
  error           text,
  posted_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- metrics_log: time series of channel/commerce metrics (the moat, part 1).
-- ---------------------------------------------------------------------------
create table if not exists metrics_log (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references clients(id) on delete cascade,
  metric      text not null,
  value       numeric,
  source      text,                    -- shopify | klaviyo | instagram | ...
  captured_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- decisions: the decision log (the moat, part 2).
-- change (lever) -> data behind it (rationale/predicted) -> result (actual).
-- ---------------------------------------------------------------------------
create table if not exists decisions (
  id        uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  date      date not null default current_date,
  lever     text not null,             -- what changed
  rationale text,                      -- the number behind it
  predicted text,                      -- what we expected
  actual    text,                      -- what happened
  status    text                       -- pending | win | loss | inconclusive
);

-- ---------------------------------------------------------------------------
-- usage_log: tokens + cost per model call; powers per-client quota enforcement.
-- ---------------------------------------------------------------------------
create table if not exists usage_log (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references clients(id) on delete cascade,
  agent      text,                     -- amplifier | analyst | strategist
  model      text,
  tokens_in  integer,
  tokens_out integer,
  cost       numeric,
  created_at timestamptz not null default now()
);

-- Helpful indexes for the dashboard + cron queries.
create index if not exists idx_content_items_client_status on content_items(client_id, status);
create index if not exists idx_content_items_scheduled_for on content_items(scheduled_for);
create index if not exists idx_metrics_log_client_metric   on metrics_log(client_id, metric, captured_at);
create index if not exists idx_decisions_client_date       on decisions(client_id, date);

-- ---------------------------------------------------------------------------
-- Row Level Security: ON for every table, with NO public policies.
-- The anon/publishable key therefore can't read or write anything. All app DB
-- access happens server-side with the service-role key, which bypasses RLS.
-- When Supabase Auth is added, per-table policies go here.
-- ---------------------------------------------------------------------------
alter table clients       enable row level security;
alter table source_files  enable row level security;
alter table content_items enable row level security;
alter table review_queue  enable row level security;
alter table post_log      enable row level security;
alter table metrics_log   enable row level security;
alter table decisions     enable row level security;
alter table usage_log     enable row level security;
