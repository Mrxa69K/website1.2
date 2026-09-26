// Shared helpers for the site-content CMS (scan-content.js + build-site.js).
// No dependencies beyond Node's fs/path, so it can run in GitHub Actions
// without a package.json.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const REGISTRY_PATH = path.join(__dirname, 'cms-pages.json');
const MANIFEST_PATH = path.join(ROOT, 'content-manifest.json');

// A marker whose "page" segment is literally the word "gallery" (e.g.
// <!--cms:gallery:wedding.grid-->) isn't a text field at all: it wraps a
// page's photo grid, and gets regenerated wholesale from the `photos`
// table at build time. scan-content.js skips these (there's nothing to
// show as a text field -- that editing happens on the Photos tab);
// build-site.js handles them with renderGalleryHtml, not text replacement.
const GALLERY_PAGE = 'gallery';

// Matches <!--cms:PAGE:KEY--> ... <!--/cms:PAGE:KEY-->
// PAGE/KEY are [a-zA-Z0-9_.-]+, content can span multiple lines.
const MARKER_RE = /<!--cms:([a-zA-Z0-9_.-]+):([a-zA-Z0-9_.-]+)-->([\s\S]*?)<!--\/cms:\1:\2-->/g;

function loadRegistry() {
  const raw = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  return raw.files;
}

function readFile(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function writeFile(file, contents) {
  fs.writeFileSync(path.join(ROOT, file), contents, 'utf8');
}

// Extract every <!--cms:page:key-->...<!--/cms:page:key--> block from one
// file's HTML. Returns [{ page, key, value }], value = raw inner HTML
// (untouched, no trimming beyond stripping a single leading/trailing
// newline that formatting tends to add).
function extractMarkers(html) {
  const found = [];
  let m;
  MARKER_RE.lastIndex = 0;
  while ((m = MARKER_RE.exec(html)) !== null) {
    const [, page, key, rawValue] = m;
    const value = rawValue.replace(/^\n/, '').replace(/\n\s*$/, '');
    found.push({ page, key, value });
  }
  return found;
}

// ---------------------------------------------------------------------
// <title> and <meta ... content="..."> markers
//
// A plain marker's raw content IS the editable value. But a marker can
// also wrap exactly one <title>...</title> or <meta ... content="...">
// tag (used for per-page SEO fields) -- an HTML comment can't legally
// sit *inside* a <title> or inside an attribute value, so those two get
// wrapped from the *outside* instead:
//   <!--cms:home:seo.title--><title>Text</title><!--/cms:home:seo.title-->
//   <!--cms:home:seo.description--><meta name="description" content="Text"/><!--/cms:home:seo.description-->
// parseFieldRaw pulls the human-editable plain string out of either
// shape (or returns the raw value unchanged for a normal field).
// renderFieldRaw does the reverse: given the CURRENT raw content (so it
// can preserve a meta tag's other attributes) and a new plain value,
// produces the new raw content to splice back between the markers.
// ---------------------------------------------------------------------
const TITLE_RE = /^<title>([\s\S]*)<\/title>$/i;
const META_RE = /^(<meta\b[^>]*\bcontent=")([^"]*)("[^>]*\/?>)$/i;

const ENTITY_MAP = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" };

function decodeHtmlEntities(value) {
  return String(value).replace(/&(#?[a-zA-Z0-9]+);/g, (whole, ent) => {
    return Object.prototype.hasOwnProperty.call(ENTITY_MAP, ent) ? ENTITY_MAP[ent] : whole;
  });
}

function escapeHtmlText(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

// { kind: 'title' | 'meta' | 'plain', value }
function parseFieldRaw(rawValue) {
  const trimmed = rawValue.trim();
  const titleMatch = trimmed.match(TITLE_RE);
  if (titleMatch) {
    return { kind: 'title', value: decodeHtmlEntities(titleMatch[1]) };
  }
  const metaMatch = trimmed.match(META_RE);
  if (metaMatch) {
    return { kind: 'meta', value: decodeHtmlEntities(metaMatch[2]) };
  }
  return { kind: 'plain', value: rawValue };
}

// Given the marker's CURRENT raw content and a new plain-text value,
// produce the new raw content. contentType ('text'|'html') only matters
// for the 'plain' case -- 'text' values get HTML-escaped, 'html' values
// (rich fields like the locations list) are trusted as-is.
function renderFieldRaw(rawValue, newPlainValue, contentType) {
  const trimmed = rawValue.trim();
  const titleMatch = trimmed.match(TITLE_RE);
  if (titleMatch) {
    return `<title>${escapeHtmlText(newPlainValue)}</title>`;
  }
  const metaMatch = trimmed.match(META_RE);
  if (metaMatch) {
    return `${metaMatch[1]}${escapeAttr(newPlainValue)}${metaMatch[3]}`;
  }
  return contentType === 'html' ? newPlainValue : escapeHtmlText(newPlainValue);
}

// Replace the inner content of <!--cms:page:key-->...<!--/cms:page:key-->
// for every key present in replacements ({key: {value, contentType}}).
// Leaves markers whose key isn't in replacements untouched (their current
// file content stays the fallback), and leaves gallery markers untouched
// (those are handled separately by renderGalleryHtml).
function applyReplacements(html, replacements) {
  return html.replace(MARKER_RE, (whole, page, key, rawValue) => {
    if (page === GALLERY_PAGE) return whole;
    if (!Object.prototype.hasOwnProperty.call(replacements, key)) {
      return whole;
    }
    const { value, contentType } = replacements[key];
    const newRaw = renderFieldRaw(rawValue, value, contentType);
    return `<!--cms:${page}:${key}-->\n${newRaw}\n<!--/cms:${page}:${key}-->`;
  });
}

// Replace every <!--cms:gallery:key-->...<!--/cms:gallery:key--> block
// using renderKey(key) => new inner HTML (string) | null (null = leave
// as-is, e.g. rendering failed and the existing fallback is safer than
// nothing).
function applyGalleryReplacements(html, renderKey) {
  return html.replace(MARKER_RE, (whole, page, key) => {
    if (page !== GALLERY_PAGE) return whole;
    const rendered = renderKey(key);
    if (rendered === null || rendered === undefined) return whole;
    return `<!--cms:${page}:${key}-->\n${rendered}\n<!--/cms:${page}:${key}-->`;
  });
}

// Content that contains tags is edited as HTML in the dashboard; plain
// copy is edited as a plain textarea. Heuristic: any '<' means HTML.
// (Only applies to 'plain'-kind fields -- title/meta fields are always
// edited as plain single-line text regardless of the tag they're wrapped
// in.)
function detectContentType(value) {
  return /</.test(value) ? 'html' : 'text';
}

// Turn "hero.slide1.title" into "Hero > Slide1 > Title" for a readable
// dashboard label. Not fancy, just enough to orient Melissa.
function humanizeKey(key) {
  return key
    .split('.')
    .map((part) => part.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(' › ');
}

module.exports = {
  ROOT,
  MANIFEST_PATH,
  GALLERY_PAGE,
  loadRegistry,
  readFile,
  writeFile,
  extractMarkers,
  applyReplacements,
  applyGalleryReplacements,
  detectContentType,
  humanizeKey,
  parseFieldRaw,
  renderFieldRaw,
  escapeHtmlText,
  escapeAttr,
  decodeHtmlEntities,
};
