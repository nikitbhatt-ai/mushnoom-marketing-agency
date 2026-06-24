-- Phase A (multi-tenant): per-client brand kits + uploaded fonts + asset bucket.
--
-- HOW TO APPLY: paste this whole file into the Supabase dashboard → SQL Editor →
-- Run. It is idempotent (safe to run more than once). The app already falls back
-- to the bundled Mushnoom defaults until this runs, so rendering keeps working
-- either way — this just lets each client have its own colors/fonts/logo.

-- 1. brand_kits: one visual identity per client. Null fields fall back to the
--    bundled default in the renderer.
create table if not exists brand_kits (
  client_id    uuid primary key references clients(id) on delete cascade,
  colors       jsonb,                    -- { bg, surface, accent, text }
  heading_font text,
  body_font    text,
  logo_path    text,
  icon_path    text,
  updated_at   timestamptz not null default now()
);

-- 2. brand_fonts: custom font binaries a client uploads (one row per weight/style).
create table if not exists brand_fonts (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references clients(id) on delete cascade,
  family       text not null,
  weight       integer not null default 400,
  style        text not null default 'normal' check (style in ('normal','italic')),
  storage_path text not null,
  created_at   timestamptz not null default now()
);
create index if not exists idx_brand_fonts_client on brand_fonts(client_id);

-- 3. RLS on (no public policies — server uses the service-role key, like every
--    other table). Per-tenant policies arrive with auth in Phase C.
alter table brand_kits  enable row level security;
alter table brand_fonts enable row level security;

-- 4. Public bucket for brand logos / icons / font files.
insert into storage.buckets (id, name, public)
values ('brand-assets', 'brand-assets', true)
on conflict (id) do update set public = true;

-- 5. Seed the existing (Mushnoom) client's kit from the current bundled tokens.
--    logo/icon left null so it keeps using the bundled artwork until one is uploaded.
insert into brand_kits (client_id, colors, heading_font, body_font)
select id,
       '{"bg":"#262E29","surface":"#47564A","accent":"#92A1CF","text":"#F3F3F3"}'::jsonb,
       'Playfair Display', 'Inter'
from clients
order by created_at asc
limit 1
on conflict (client_id) do nothing;
