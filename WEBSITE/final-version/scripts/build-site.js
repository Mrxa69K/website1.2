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
// readable; RLS only restricts writes to authenticated users, i.e. the
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
  applyGalleryReplacements,
  escapeHtmlText,
  escapeAttr,
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

function fetchPhotos(url, anonKey) {
  return new Promise((resolve, reject) => {
    const endpoint = `${url.replace(/\/$/, '')}/rest/v1/photos?select=category,order_index,image_url,title,alt_text&order=category.asc,order_index.asc`;
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

// Two exact HTML shapes the gallery grids on the live site use today.
// "grid" = EN pages (plain .item.gallery-item), "bootstrap" = FR pages
// (Bootstrap column classes). Confirmed against the live static markup.
function renderPhotoItem(flavor, photo) {
  const alt = escapeAttr(photo.alt_text || photo.title || '');
  const src = escapeAttr(photo.image_url || '');
  if (flavor === 'bootstrap') {
    return `<div class="col-sm-6 col-md-4 col-lg-3 col-xl-3 item gallery-item" data-aos="fade" style="margin-bottom: 20px; padding: 10px;"><img alt="${alt}" class="img-fluid" loading="lazy" src="${src}"/></div>`;
  }
  return `<div class="item gallery-item" data-aos="fade"><img alt="${alt}" class="img-fluid" loading="lazy" src="${src}"/></div>`;
}

function renderGalleryHtml(photosByCategory, key) {
  const dot = key.indexOf('.');
  if (dot === -1) return null;
  const category = key.slice(0, dot);
  const flavor = key.slice(dot + 1);
  const photos = photosByCategory[category];
  if (!photos) return ''; // category has no photos left -- render an empty grid, not "leave stale HTML"
  return photos.map((p) => renderPhotoItem(flavor, p)).join('');
}

async function main() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const config = url && anonKey ? { url, anonKey } : loadSupabaseConfigFallback();

  console.log(`Fetching site_content from ${config.url} ...`);
  const rows = await fetchSiteContent(config.url, config.anonKey);
  console.log(`Fetched ${rows.length} row(s).`);

  console.log('Fetching photos ...');
  const photos = await fetchPhotos(config.url, config.anonKey);
  console.log(`Fetched ${photos.length} photo(s).`);

  // page -> locale -> key -> {content, content_type}
  const byPageLocale = {};
  for (const row of rows) {
    byPageLocale[row.page] = byPageLocale[row.page] || {};
    byPageLocale[row.page][row.locale] = byPageLocale[row.page][row.locale] || {};
    byPageLocale[row.page][row.locale][row.key] = row;
  }

  // category -> [photo, ...] in order_index order (already sorted by the query)
  const photosByCategory = {};
  for (const photo of photos) {
    photosByCategory[photo.category] = photosByCategory[photo.category] || [];
    photosByCategory[photo.category].push(photo);
  }

  const registry = loadRegistry();
  let changedFiles = 0;

  for (const entry of registry) {
    const rowsForFile = (byPageLocale[entry.page] || {})[entry.locale] || {};
    const replacements = {};
    for (const [key, row] of Object.entries(rowsForFile)) {
      replacements[key] = { value: row.content, contentType: row.content_type };
    }

    let original = readFile(entry.file);
    let updated = original;

    if (Object.keys(replacements).length > 0) {
      updated = applyReplacements(updated, replacements);
    }

    if (entry.gallery) {
      updated = applyGalleryReplacements(updated, (key) => renderGalleryHtml(photosByCategory, key));
    }

    if (updated !== original) {
      writeFile(entry.file, updated);
      changedFiles += 1;
      console.log(`Updated ${entry.file}.`);
    }
  }

  console.log(changedFiles > 0 ? `Done. ${changedFiles} file(s) changed.` : 'Done. No changes needed.');
}

main().catch((err) => {
  console.error('build-site.js failed:', err);
  process.exit(1);
});
