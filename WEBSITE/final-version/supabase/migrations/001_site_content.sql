-- Site content CMS: lets the admin dashboard edit page text (titles,
-- paragraphs, FAQ, etc.) that used to be hardcoded in the HTML.
-- Run this once in Supabase SQL Editor (Melissa's project).

create table if not exists site_content (
  id uuid default gen_random_uuid() primary key,
  page text not null,          -- e.g. 'home', 'about', 'contact'
  locale text not null,        -- 'en' or 'fr'
  key text not null,           -- e.g. 'hero.slide1.title'
  content text not null,
  content_type text not null default 'text',  -- 'text' or 'html'
  updated_at timestamptz not null default now(),
  unique (page, locale, key)
);

create index if not exists site_content_page_locale_idx
  on site_content(page, locale);

alter table site_content enable row level security;

create policy "site_content viewable by everyone"
on site_content for select
using ( true );

create policy "authenticated can insert site_content"
on site_content for insert
with check ( auth.role() = 'authenticated' );

create policy "authenticated can update site_content"
on site_content for update
using ( auth.role() = 'authenticated' );

create policy "authenticated can delete site_content"
on site_content for delete
using ( auth.role() = 'authenticated' );

-- Keep updated_at fresh on every edit.
create or replace function site_content_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists site_content_updated_at on site_content;
create trigger site_content_updated_at
before update on site_content
for each row execute function site_content_set_updated_at();
