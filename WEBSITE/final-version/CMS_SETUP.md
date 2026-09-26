# Site-text CMS - setup guide

This adds a second thing the admin dashboard can manage besides photos:
**page text** (titles, paragraphs, FAQ, coverage list, etc.), with changes
auto-publishing to the live site. Three setup steps below are one-time and
need to happen in your Supabase project and GitHub repo (things I can't do
from here) - after that, everything happens from `cpr.html`.

## How it works

1. You edit a photo or a piece of text in the dashboard and hit Save.
2. The dashboard writes to Supabase (a `photos` row, or a `site_content`
   row), then calls a small Supabase function ("trigger-publish").
3. That function asks GitHub Actions to run a workflow which:
   - reads everything from Supabase,
   - regenerates the actual HTML files (swapping in your new text where a
     `<!--cms:...-->` marker is),
   - commits and pushes the result.
4. Netlify sees the push and redeploys, same as always. A minute or two
   after you hit Save, the live site shows your change.

Pages stay plain static HTML (fast, good for SEO) - nothing is fetched
live from the database when a visitor loads a page. The "database" part
only exists to feed the dashboard and the publish step.

## Step 1 - Run the SQL migration

Supabase → SQL Editor → paste the contents of
`supabase/migrations/001_site_content.sql` → Run. This creates the
`site_content` table (same idea as the existing `photos` table: public
read, only logged-in admin can write).

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
just asks GitHub to run the publish workflow; it never touches your data.

## Step 4 - Confirm GitHub Actions can push

Repo → Settings → Actions → General → "Workflow permissions" → set to
**Read and write permissions** → Save. (Needed once, so the publish
workflow is allowed to commit/push the regenerated pages.)

## Using it day to day

Open `cpr.html`, log in as usual. Two tabs now:

- **Photos** - unchanged, same add/edit/delete you already had.
- **Site text** - every editable title/paragraph, grouped by page
  (Home EN, Home FR, About EN, About FR, Contact EN, Contact FR right
  now - more pages coming, see below). Edit a field, hit "Save changes"
  for that section; it publishes automatically.

A "Republish site" button at the top re-runs the publish step by hand -
only needed if something seems stuck.

## What's covered so far, and what's next

Marked up and editable today: the **Home**, **About**, and **Contact**
pages (EN + FR) - hero text, intro copy, FAQ, coverage-area list. That's
103 fields.

Not yet wired up (same idea, just needs the same marker treatment
applied page by page): Services, Reviews, the five gallery pages
(Proposal/Wedding/Portrait/Event/Sport, EN + FR), and the legal pages
(Policy/Terms). I can keep extending this the same way - it's
mechanical once the pipeline exists, which is the part that's now done.

Also still separate from this system: the **photos** that are hardcoded
into the gallery pages' HTML (not yet in the `photos` table) can't be
deleted from the dashboard yet, only photos you've added there. Folding
the static galleries into the same database-driven, auto-published
model is the natural next step - flagging it so it doesn't get lost.

## Troubleshooting

- Dashboard shows "could not reach the auto-publish service" - Steps 2–3
  above haven't been done yet, or the GitHub token expired. Saving to the
  database still works either way; the live site just won't update until
  the publish step is wired up.
- Workflow runs but nothing changes - check the Actions tab on GitHub for
  the "Publish dashboard content" run's logs.
- To add a new editable field on an existing page: wrap the text in the
  HTML with `<!--cms:page:some.key-->text<!--/cms:page:some.key-->`,
  add the file to `scripts/cms-pages.json` if it's a new page, then run
  `node scripts/scan-content.js` and commit `content-manifest.json`.
