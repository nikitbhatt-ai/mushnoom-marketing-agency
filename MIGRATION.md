# Migrating raemy ai to Google Cloud

Goal: everything on one Google Cloud bill — Postgres, the app, asset storage, and
Claude (via Vertex AI) — instead of Supabase + Vercel + the direct Anthropic API.

**Architecture chosen:** a single Compute Engine VM running the app + Postgres in
Docker, with nightly database backups to Cloud Storage, and Claude billed through
Vertex AI. The data layer reads a single `DATABASE_URL`, so moving the database to
managed Cloud SQL later is a one-line change — no code edits.

```
            ┌──────────── Compute Engine VM ────────────┐
  Internet ─┤  docker compose:                          │
   :80      │    app (Next.js)  ─DATABASE_URL─►  db (Postgres)
            │                                      │     │
            │    backup ── nightly pg_dump ──► gs://raemy-db-backups
            └────────────────────┬──────────────────────┘
                                 │ service account (ADC)
                  ┌──────────────┼───────────────┐
            Vertex AI       gs://raemy-content-assets
           (Claude)         (rendered images)
```

## What changed in the code (already done on this branch)

| Was (Supabase/Vercel) | Now (GCP) | File |
|---|---|---|
| `@supabase/supabase-js` client | `pg` pool on `DATABASE_URL` | `lib/db/postgres.ts`, `lib/db/queries.ts` |
| Supabase Storage | Google Cloud Storage | `lib/integrations/storage.ts` |
| direct Anthropic API | Vertex AI (with direct fallback) | `lib/agents/anthropic.ts` |
| Vercel host | Docker on a VM | `Dockerfile`, `docker-compose.yml` |
| Vercel Cron | cron → `/api/cron/*` w/ bearer secret | `lib/cron-auth.ts` |
| RLS security model | DB role + private networking | `lib/db/schema.sql` |

`lib/db/seed.sql` is your live Mushnoom data, exported from Supabase.

---

## Part A — things only you can do (GCP console)

1. **Create a project** and link a billing account. Note the **Project ID**.
2. **Enable APIs** (APIs & Services → Library): Compute Engine API, Vertex AI API,
   Cloud Storage API.
3. **Enable Claude in Vertex Model Garden** (search "Claude", request/enable access).
4. **Connect the Google Compute Engine connector** in Claude (OAuth — see chat for
   how to create the OAuth Client ID/Secret).
5. Give me your **Project ID**, **region**, and **zone**.

## Part B — things I can drive once you've done Part A

Via the connector / your help, in order:

1. **Buckets:** create `raemy-content-assets` (public-read) and `raemy-db-backups`
   (private).
2. **VM:** create an `e2-small` Compute Engine instance, with a service account
   that has `roles/aiplatform.user` (Vertex), `roles/storage.objectAdmin` (buckets),
   and a firewall rule allowing tcp:80.
3. **Deploy on the VM** (startup script or by hand):
   ```sh
   git clone -b claude/focused-fermat-9vimj4 https://github.com/nikitbhatt-ai/mushnoom-marketing-agency.git
   cd mushnoom-marketing-agency
   cp .env.example .env && nano .env        # fill in the values below
   docker compose up -d --build
   # one-time data load (schema runs automatically on first db boot):
   docker compose exec -T db psql -U raemy_app -d raemy < lib/db/seed.sql
   ```

### `.env` values to set on the VM
- `ANTHROPIC_VERTEX_PROJECT_ID` = your project id · `CLOUD_ML_REGION` = your region
- `POSTGRES_PASSWORD` = a strong password · `DATABASE_URL` is built by compose
- `GCS_ASSETS_BUCKET=raemy-content-assets` · `BACKUP_BUCKET=raemy-db-backups`
- `CRON_SECRET` = `openssl rand -hex 32`

### Cron (replaces Vercel Cron)
On the VM, add crontab entries that call the endpoints with the shared secret:
```
*/30 * * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" http://localhost/api/cron/ingest
*/15 * * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" http://localhost/api/cron/publish
```

---

## Part C — verify
- `curl http://<VM_IP>/` serves the app.
- The dashboard shows live Mushnoom data (not the mock fallback) → Postgres works.
- A generation run logs a row to `usage_log` → Vertex + DB write work.
- Check `gs://raemy-db-backups` after the first nightly cycle → backups work.

## Later: graduate the DB to managed Cloud SQL (optional)
Create a Cloud SQL Postgres instance, import `schema.sql` + `seed.sql`, then point
the VM's `DATABASE_URL` at it and drop the `db`/`backup` services from compose.
No application code changes.

## Decommission (only after verifying GCP is healthy)
Pause the Supabase project and remove the Vercel deployment once a few days of GCP
operation and backups confirm everything works.
