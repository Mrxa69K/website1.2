#!/usr/bin/env node
// Publishes dashboard content: fetches every row from Supabase's
// site_content table and writes it into the matching <!--cms:page:key-->
// marker in the registered static HTML files, in place.
//
// This is what turns "auto-publication" into real static HTML: the
// output of this script is exactly what Netlify serves, so pages stay
// fast/SEO-friendly (no client-side fetch-and-inject for text), and the
// dashboard only ever changes a database row plus, via this script, the
// generated HTML.
//
// Run in GitHub Actions (see .github/workflows/publish-content.yml),
// pointed at the project's public anon key (site_content is publicly
// readable — RLS only restricts writes to authenticated users, i.e. the
// dashboard). Nothing here needs a service-role key.
//
// Usage: node scripts/build-site.js
// Requires: SUPABASE_URL, SUPABASE_ANON_KEY env vars (falls back to
// reading js/supabase-config.js if unset, so it also runs locally with
// zero setup).

const fs = require('fs');
const path = require('path');
const https = require('https');
const {
  ROOT,
  loadRegistry,
  readFile,
  writeFile,
  applyReplacements,
} = require('./cms-lib');

function loadSupabaseConfigFallback() {
  const configPath = path.join(ROOT, 'js', 'supabase-config.js');
  const src = fs.readFileSync(configPath, 'utf8');
  const urlMatch = src.match(/url:\s*'([^']+)'/);
  const keyMatch = src.match(/anonKey:\s*'([^']+)'/);
  if (!urlMatch || !keyMatch) {
    throw new Error('Could not parse js/supabase-config.js for a Supabase URL/anon key fallback.');
  }
  return { url: urlMatch[1], anonKey: keyMatch[1] };
}

function fetchSiteContent(url, anonKey) {
  return new Promise((resolve, reject) => {
    const endpoint = `${url.replace(/\/$/, '')}/rest/v1/site_content?select=page,locale,key,content,content_type`;
    https
      .get(endpoint, { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } }, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          if (res.statusCode !== 200) {
            reject(new Error(`Supabase REST error ${res.statusCode}: ${body}`));
            return;
          }
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

// Escape a plain-text value before it goes back into HTML (dashboard
// edits are free-form text; content_type 'html' rows are trusted as-is
// since only the authenticated admin -- i.e. Melissa -- can write them).
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function main() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const config = url && anonKey ? { url, anonKey } : loadSupabaseConfigFallback();

  console.log(`Fetching site_content from ${config.url} ...`);
  const rows = await fetchSiteContent(config.url, config.anonKey);
  console.log(`Fetched ${rows.length} row(s).`);

  // page -> locale -> key -> {content, content_type}
  const byPageLocale = {};
  for (const row of rows) {
    byPageLocale[row.page] = byPageLocale[row.page] || {};
    byPageLocale[row.page][row.locale] = byPageLocale[row.page][row.locale] || {};
    byPageLocale[row.page][row.locale][row.key] = row;
  }

  const registry = loadRegistry();
  let changedFiles = 0;

  for (const entry of registry) {
    const rowsForFile = (byPageLocale[entry.page] || {})[entry.locale] || {};
    const replacements = {};
    for (const [key, row] of Object.entries(rowsForFile)) {
      replacements[key] = row.content_type === 'html' ? row.content : escapeHtml(row.content);
    }

    if (Object.keys(replacements).length === 0) {
      continue; // nothing in the DB for this page/locale yet -> leave file's fallback text as-is
    }

    const original = readFile(entry.file);
    const updated = applyReplacements(original, replacements);
    if (updated !== original) {
      writeFile(entry.file, updated);
      changedFiles += 1;
      console.log(`Updated ${entry.file} (${Object.keys(replacements).length} field(s) considered).`);
    }
  }

  console.log(changedFiles > 0 ? `Done. ${changedFiles} file(s) changed.` : 'Done. No changes needed.');
}

main().catch((err) => {
  console.error('build-site.js failed:', err);
  process.exit(1);
});
