// Shared helpers for the site-content CMS (scan-content.js + build-site.js).
// No dependencies beyond Node's fs/path, so it can run in GitHub Actions
// without a package.json.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const REGISTRY_PATH = path.join(__dirname, 'cms-pages.json');
const MANIFEST_PATH = path.join(ROOT, 'content-manifest.json');

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

// Replace the inner content of <!--cms:page:key-->...<!--/cms:page:key-->
// with newValue, for every key present in replacements ({key: value}).
// Leaves markers whose key isn't in replacements untouched (their current
// file content stays the fallback).
function applyReplacements(html, replacements) {
  return html.replace(MARKER_RE, (whole, page, key, rawValue) => {
    if (!Object.prototype.hasOwnProperty.call(replacements, key)) {
      return whole;
    }
    const newValue = replacements[key];
    return `<!--cms:${page}:${key}-->\n${newValue}\n<!--/cms:${page}:${key}-->`;
  });
}

// Content that contains tags is edited as HTML in the dashboard; plain
// copy is edited as a plain textarea. Heuristic: any '<' means HTML.
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
  loadRegistry,
  readFile,
  writeFile,
  extractMarkers,
  applyReplacements,
  detectContentType,
  humanizeKey,
};
