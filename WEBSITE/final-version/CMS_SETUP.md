# Site-text CMS - setup guide

This adds a second thing the admin dashboard can manage besides photos:
**page text** (titles, paragraphs, FAQ, coverage list, SEO title/description,
etc.), with changes auto-publishing to the live site. The one-time setup
steps below need to happen in your Supabase project, its Auth settings, and
your GitHub repo (things I can't do from here) - after that, everything
happens from `cpr.html`.

## How it works

1. You edit a photo, a piece of text, or a photo's order in the dashboard.
2. The dashboard writes to Supabase (a `photos` row, a `site_content` row,
   or a `publish_log` row), then calls a small Supabase function
   ("trigger-publish").
3. That function creates a `publish_log` row (so the dashboard can show
   whether this actually worked) and asks GitHub Actions to run a workflow
   which:
   - reads everything from Supabase (text + photos),
   - regenerates the actual HTML files (swapping in your new text where a
     `<!--cms:...-->` marker is, and rebuilding each gallery page's photo
     grid from the `photos` table),
   - commits and pushes the result,
   - marks the `publish_log` row success or failed.
4. Netlify sees the push and redeploys, same as always. A minute or two
   after you hit Save, the live site shows your change, and the dashboard's
   status banner (and "Publish history" panel) tells you whether it landed.

Pages stay plain static HTML (fast, good for SEO) - nothing is fetched
live from the database when a visitor loads a page. The "database" part
only exists to feed the dashboard and the publish step.

## Step 1 - Run the SQL migrations, in order

Supabase → SQL Editor → paste and Run each of these, in order (skip any
you've already run):

1. `supabase/migrations/001_site_content.sql` - creates the `site_content`
   table (public read, only logged-in admin can write).
2. `supabase/migrations/002_alt_text_and_publish_log.sql` - adds a
   `photos.alt_text` column and a `publish_log` table (so a publish's
   success/failure is visible instead of silent).
3. `supabase/migrations/003_seed_gallery_photos.sql` - brings the photos
   that were hardcoded in the Proposal/Wedding/Portrait/Sport gallery
   pages into the `photos` table, so the dashboard can fully manage them
   (edit/delete/reorder) like any photo added through the panel. Safe to
   run once; it no-ops on a second run.

## Step 2 - Create a GitHub token and add it to Supabase

1. GitHub → your avatar → Settings → Developer settings → Personal access
   tokens → **Fine-grained tokens** → Generate new token.
   - Repository access: only `Mrxa69K/website1.2`.
   - Permissions: **Contents: Read and write**, **Actions: Read and write**.
   - Copy the token (starts with `github_pat_...`) - you won't see it again.
2. In a terminal, with the [Supabase CLI](https://supabase.com/docs/guides/cli)
   installed and logged in (`supabase login`):
   ```
   supabase secrets set GITHUB_TOKEN=github_pat_xxx GITHUB_REPO=Mrxa69K/website1.2 --project-ref amrzoqmnkfnewujbeqdn
   ```
   (No Supabase CLI? Dashboard → Project Settings → Edge Functions →
   Secrets, add `GITHUB_TOKEN` and `GITHUB_REPO` there instead.)

## Step 3 - Deploy the Edge Function

From the repo root, with the Supabase CLI:
```
supabase functions deploy trigger-publish --project-ref amrzoqmnkfnewujbeqdn
```
That's the function at `supabase/functions/trigger-publish/index.ts` - it
creates the `publish_log` row and asks GitHub to run the publish workflow;
it never touches your photos or text directly. (`SUPABASE_URL` and
`SUPABASE_ANON_KEY` are provided automatically by Supabase - no need to
set those as secrets yourself.)

## Step 4 - Confirm GitHub Actions can push

Repo → Settings → Actions → General → "Workflow permissions" → set to
**Read and write permissions** → Save. (Needed once, so the publish
workflow is allowed to commit/push the regenerated pages.)

## Step 5 - Add the service-role secret to GitHub

This is what lets the workflow report success/failure back to
`publish_log` (regular dashboard saves use the public anon key, which
deliberately can't mark a publish successful - see the comments in
`supabase/migrations/002_alt_text_and_publish_log.sql`).

1. Supabase Dashboard → Project Settings → API → copy the **service_role**
   key (starts with `eyJ...`; keep this one secret - it bypasses all
   Row Level Security).
2. GitHub repo → Settings → Secrets and variables → Actions → New
   repository secret → name it `SUPABASE_SERVICE_ROLE_KEY`, paste the key.

## Step 6 - Allow the password-reset redirect

Supabase Dashboard → Authentication → URL Configuration → **Redirect
URLs** → add the exact URL your panel is served at, e.g.
`https://melissaphotographyparis.fr/cpr.html`. Without this, "Forgot your
password?" emails will send but the reset link will refuse to log you in.

## Using it day to day

Open `cpr.html`, log in as usual (or use "Forgot your password?" if
needed). Two tabs:

- **Photos** - add/edit/delete, plus:
  - a search box and category filter above the grid,
  - an **Alt text** field (falls back to the title if left blank),
  - photos uploaded here are automatically resized/recompressed to webp
    before upload, same idea as the rest of the site's images,
  - filter to one category (with no search text) to **drag photos into a
    new order** instead of typing numbers into "Order Index",
  - deleting a photo shows an "Undo" toast for a few seconds instead of a
    yes/no popup - no more accidental permanent deletes.
- **Site text** - every editable title/paragraph/SEO field, grouped by
  page, with a search box, a **Revert to original** button per field (goes
  back to what's currently in the HTML file, not just your last save), and
  a "View live page" link per section. Unsaved edits autosave to your
  browser as you type, so a closed tab or a crash doesn't lose your work -
  reopening the panel restores the draft with a banner offering to discard
  it.

A "Publish history" button at the top shows the last few publishes and
whether each one succeeded or failed - a save's status banner also follows
its own publish through to success/failure instead of just saying
"started" and leaving you to guess. "Republish site" re-runs the publish
step by hand - only needed if something seems stuck.

## What's covered so far

Marked up and editable today: the **Home**, **About**, and **Contact**
pages (EN + FR - hero text, intro copy, FAQ, coverage-area list, and each
page's SEO title/meta description), plus all five gallery pages
(**Proposal/Wedding/Portrait/Event/Sport**, EN + FR) whose photo grids now
render from the `photos` table at publish time instead of being hardcoded
HTML.

Not yet wired up (same idea, just needs the same marker treatment applied
page by page): Services, Reviews, and the legal pages (Policy/Terms). I
can keep extending this the same way - it's mechanical once the pipeline
exists, which is the part that's now done.

One known quirk from the photo migration: the EN and FR Proposal galleries
use two different source photos at the same grid position (`proposal2.webp`
vs `2.webp`) - both were seeded as-is rather than silently picked for you,
since that's a content decision, not a technical one.

## Troubleshooting

- Dashboard shows "could not reach the auto-publish service" - Steps 2-3
  above haven't been done yet, or the GitHub token expired. Saving to the
  database still works either way; the live site just won't update until
  the publish step is wired up.
- Status banner says a publish failed, or "Publish history" shows a
  failed run - check the Actions tab on GitHub for the "Publish dashboard
  content" run's logs (the history panel links straight to the run).
- Status banner says a publish's result "can't be confirmed from here" -
  the Edge Function is running an older version without `publish_log`
  wiring; redeploy it (Step 3).
- "Forgot your password?" email link doesn't log you in - see Step 6
  above (the redirect URL needs to be allow-listed in Supabase Auth).
- To add a new editable text field on an existing page: wrap the text in
  the HTML with `<!--cms:page:some.key-->text<!--/cms:page:some.key-->`,
  add the file to `scripts/cms-pages.json` if it's a new page, then run
  `node scripts/scan-content.js` and commit `content-manifest.json`.
- To wire up a new gallery page: wrap its photo-grid container's contents
  with `<!--cms:gallery:category.flavor-->...<!--/cms:gallery:category.flavor-->`
  (`flavor` is `grid` for the plain EN markup or `bootstrap` for the FR
  Bootstrap-column markup - see `scripts/build-site.js`), add the file to
  `scripts/cms-pages.json` with `"gallery": true`, and seed its photos into
  the `photos` table (see migration 003 for the pattern).
