#!/usr/bin/env node
// Scans every registered HTML file for <!--cms:page:key-->...<!--/cms:page:key-->
// markers and writes content-manifest.json: the catalogue of every text
// field the admin dashboard's "Content" tab can show and edit, along with
// its current (fallback) value, before any dashboard edit exists in
// Supabase.
//
// Run this whenever markers are added to/removed from a page:
//   node scripts/scan-content.js
// It's also safe to run in CI; it doesn't touch Supabase at all.

const {
  MANIFEST_PATH,
  GALLERY_PAGE,
  loadRegistry,
  readFile,
  extractMarkers,
  detectContentType,
  humanizeKey,
  parseFieldRaw,
} = require('./cms-lib');

function main() {
  const registry = loadRegistry();
  const pages = {}; // page -> locale -> [{key, label, default, content_type}]

  for (const entry of registry) {
    const html = readFile(entry.file);
    const markers = extractMarkers(html);

    if (!pages[entry.page]) pages[entry.page] = {};
    if (!pages[entry.page][entry.locale]) pages[entry.page][entry.locale] = [];

    for (const { page, key, value } of markers) {
      if (page === GALLERY_PAGE) continue; // photo grid, not a text field -- managed on the Photos tab
      if (page !== entry.page) {
        console.warn(
          `Warning: marker page "${page}" in ${entry.file} doesn't match registry page "${entry.page}" (key: ${key})`
        );
      }
      const parsed = parseFieldRaw(value);
      pages[entry.page][entry.locale].push({
        key,
        label: humanizeKey(key),
        default: parsed.value,
        content_type: parsed.kind === 'title' || parsed.kind === 'meta' ? 'text' : detectContentType(parsed.value),
        field_kind: parsed.kind, // 'title' | 'meta' | 'plain' -- lets the dashboard flag SEO fields
      });
    }
  }

  const manifest = {
    generated_at: new Date().toISOString(),
    pages,
  };

  require('fs').writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  let total = 0;
  for (const page of Object.values(pages)) {
    for (const fields of Object.values(page)) total += fields.length;
  }
  console.log(`content-manifest.json written: ${total} editable fields across ${Object.keys(pages).length} page(s).`);
}

main();
