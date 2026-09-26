# Supabase Setup Guide - Portfolio Dashboard

This is the one-time setup needed so the admin dashboard (`cpr.html`) can
actually read/write photos, and so the gallery pages (event, portrait,
wedding, proposal, sport - EN & FR) show what you add there. Run this once
in your Supabase project's **SQL Editor**.

> An earlier, unmerged attempt at this exact feature left a version of this
> guide on a stale branch (`copilot/add-supabase-admin-panel`) pointing at a
> *different* Supabase project than the one currently wired into
> `js/supabase-config.js`. This version is the current, authoritative one -
> ignore the old branch.

## Step 1 - Confirm which Supabase project is live

Open `js/supabase-config.js` in this repo - it already has a `url` and
`anonKey`. Log into [supabase.com](https://supabase.com) and make sure you
can access **that** project (URL should match). If you don't have access to
it, either get added as a collaborator or create a new project and update
`js/supabase-config.js` with its URL/anon key (Settings → API).

## Step 2 - Create the `photos` table

SQL Editor → New Query → run:

```sql
create table if not exists photos (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  image_url text not null,
  category text,
  order_index integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists photos_category_idx on photos(category);
create index if not exists photos_order_idx on photos(order_index);
```

Valid `category` values (must match exactly, lowercase): `proposal`,
`wedding`, `portrait`, `event`, `sport`.

## Step 3 - Create the `photos` storage bucket

Storage → Create a new bucket → name it exactly `photos` → toggle **Public
bucket** ON → Create.

Then add these policies (Storage → `photos` bucket → Policies, or just run
in SQL Editor):

```sql
create policy "Public photos are viewable by everyone"
on storage.objects for select
using ( bucket_id = 'photos' );

create policy "Authenticated users can upload photos"
on storage.objects for insert
with check ( bucket_id = 'photos' and auth.role() = 'authenticated' );

create policy "Authenticated users can update photos"
on storage.objects for update
using ( bucket_id = 'photos' and auth.role() = 'authenticated' );

create policy "Authenticated users can delete photos"
on storage.objects for delete
using ( bucket_id = 'photos' and auth.role() = 'authenticated' );
```

## Step 4 - Row Level Security on the `photos` table

This is the important one for security: without it, anyone with the public
anon key (which is visible in your page source - that's normal) could
write to your database directly, bypassing the admin login entirely.

```sql
alter table photos enable row level security;

create policy "Photos are viewable by everyone"
on photos for select
using ( true );

create policy "Authenticated users can insert photos"
on photos for insert
with check ( auth.role() = 'authenticated' );

create policy "Authenticated users can update photos"
on photos for update
using ( auth.role() = 'authenticated' );

create policy "Authenticated users can delete photos"
on photos for delete
using ( auth.role() = 'authenticated' );
```

## Step 5 - Create your admin login

Authentication → Users → Add user → Create new user. Use the email/password
you'll log into `cpr.html` with, and enable **Auto Confirm User**.

## Step 6 - Test it

1. Open `cpr.html`, log in, upload a test photo in e.g. category
   `event`, save it.
2. Open `event.html` (or `eventfr.html`) - the new photo should appear
   *after* the existing hand-placed photos on the page (this loader is
   additive: it appends dashboard photos to the existing gallery rather
   than replacing it, so nothing already on the site disappears).
3. Edit or delete that photo from the dashboard and refresh the gallery
   page to confirm the change shows up.

## How the pieces fit together

- `js/supabase-config.js` - your project URL + public anon key (safe to be
  public; RLS above is what actually protects the data).
- `cpr.html` + `js/admin.js` - the dashboard: login, upload, edit,
  delete. Writes go straight to Supabase.
- `js/portfolio-loader.js` - runs on `event.html`, `eventfr.html`,
  `portrait.html`, `portraitfr.html`, `wedding.html`, `weddingfr.html`,
  `proposal.html`, `proposalfr.html`, `sport.html`, `sportfr.html`. It reads
  `data-category` off `<body>`, finds the gallery container
  (`id="photoGallery"`), and appends any photos from Supabase in that
  category - cloning the markup of the page's last existing photo so new
  ones match the page's exact layout/styling.

## Adding a brand new category/page later

1. Add the option in `cpr.html`'s category `<select>`.
2. Create the new page from an existing gallery page as a template (so it
   already has at least one static photo - the loader clones that markup
   for new items; without one it falls back to a generic layout).
3. Add `data-category="yourcategory"` to `<body>`.
4. Give the gallery container `id="photoGallery"`.
5. Before `</body>`, add:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   <script src="js/supabase-config.js"></script>
   <script src="js/portfolio-loader.js"></script>
   ```

## Troubleshooting

**"Error loading photos" / dashboard shows nothing** - Open the browser
console (F12). Usually: RLS policies missing (Step 4), or wrong
url/anonKey in `js/supabase-config.js`.

**"Error uploading image"** - Confirm the bucket is named exactly `photos`
and is Public, and Step 3's policies were created.

**Login fails** - Confirm the user exists under Authentication → Users and
was Auto Confirmed. You can reset the password there too.

**Photos don't show on the public gallery page** - Check the `category`
value on the photo matches the page's `data-category` exactly (lowercase),
and that the SELECT policy from Step 4 is in place (anon key needs public
read access).
