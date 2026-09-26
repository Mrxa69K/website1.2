-- Adds: photo alt text, and a publish_log table so the dashboard can show
-- whether an auto-publish actually succeeded instead of firing blind.
-- Run once in Supabase SQL Editor, after 001_site_content.sql.

alter table photos add column if not exists alt_text text;

-- Lets a migration/seed script safely use "on conflict (image_url) do
-- nothing" instead of risking duplicate rows if it's ever run twice.
create unique index if not exists photos_image_url_key on photos(image_url);

create table if not exists publish_log (
  id uuid default gen_random_uuid() primary key,
  status text not null default 'pending', -- pending | success | failed
  triggered_by text,
  reason text, -- short note on what was published (e.g. "photo save", "site text: home/en")
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  run_url text,
  error text
);

create index if not exists publish_log_started_at_idx on publish_log(started_at desc);

alter table publish_log enable row level security;

-- Publish history is only shown inside the dashboard, but there's nothing
-- sensitive in it (no secrets, just timestamps/status/a GitHub URL), so a
-- public read policy keeps this consistent with photos/site_content.
create policy "publish_log viewable by everyone"
on publish_log for select
using ( true );

create policy "authenticated can insert publish_log"
on publish_log for insert
with check ( auth.role() = 'authenticated' );

-- No update policy for regular users on purpose: only the GitHub Actions
-- workflow (using the Supabase service role key, which bypasses RLS
-- entirely) marks a row success/failed. This stops anyone with the public
-- anon key from forging a fake "success" status.
