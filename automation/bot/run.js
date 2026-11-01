// Blog bot, run by .github/workflows/blog-bot.yml.
// Actions (from Telegram through api/telegram.js, or the Monday schedule):
//   ideas   : 5 article ideas sent to Telegram with buttons
//   write   : write an article (FR/EN/AR) on a branch blog/<id>, build the pages, send a preview link
//   revise  : apply Melissa's comment to the draft, rebuild, send a new preview
//   publish : copy the article to main, rebuild, push, tell Bing (IndexNow), send the live link
//   discard : delete the draft
// Needs secrets: GEMINI_API_KEY (free) or ANTHROPIC_API_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID. GH_TOKEN is the workflow token.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const SITE_DIR = path.join(ROOT, 'WEBSITE', 'final-version');
const POSTS = path.join(SITE_DIR, 'scripts', 'posts');
const SITE = 'https://www.melissaphotographyparis.fr';
const REPO = process.env.GITHUB_REPOSITORY || 'Mrxa69K/website1.2';
const MODEL = process.env.BLOG_MODEL || 'claude-sonnet-5-5';
const INDEXNOW_KEY = '205d5aff08d577925f86d50f7aad5062';

const sh = (cmd, opts = {}) => execSync(cmd, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', ...opts }).trim();
const sleep = ms => new Promise(r => setTimeout(r, ms));
const escH = s => String(s || '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const today = () => new Date().toISOString().slice(0, 10);

/* ---------- Telegram ---------- */
async function tg(method, body) {
  const r = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, ...body }),
  });
  const j = await r.json().catch(() => ({}));
  if (!j.ok) console.error('telegram', method, j.description);
  return j;
}
const say = (text, extra = {}) => tg('sendMessage', { text, parse_mode: 'HTML', disable_web_page_preview: true, ...extra });

/* ---------- AI writer: Google Gemini (free tier) or Anthropic Claude ---------- */
// Gemini is used when GEMINI_API_KEY is set (free key from aistudio.google.com),
// otherwise Claude with ANTHROPIC_API_KEY. Set BLOG_PROVIDER=anthropic to force Claude.
const USE_GEMINI = !!process.env.GEMINI_API_KEY && process.env.BLOG_PROVIDER !== 'anthropic';
const GEMINI_MODELS = (process.env.GEMINI_MODEL || 'gemini-3.8-flash,gemini-3.6-flash,gemini-3.5-flash-lite').split(',').map(x => x.trim()).filter(Boolean);

function parseJson(text) {
  const iObj = text.indexOf('{'), iArr = text.indexOf('[');
  const a = iObj >= 0 && (iArr < 0 || iObj < iArr) ? iObj : iArr;
  const b = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
  if (a < 0 || b < a) throw new Error('the AI did not return JSON');
  return JSON.parse(text.slice(a, b + 1));
}

async function gemini(system, user, maxTokens) {
  // free models are sometimes busy: try each model, with one short retry, until one answers
  let last = '';
  for (const model of GEMINI_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: 'user', parts: [{ text: user }] }],
          generationConfig: { maxOutputTokens: Math.max(maxTokens, 8192), responseMimeType: 'application/json', temperature: 0.7 },
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok) {
        const c = (j.candidates || [])[0];
        const text = ((c && c.content && c.content.parts) || []).map(p => p.text || '').join('');
        if (text) { console.log('written by', model); return parseJson(text); }
        last = `${model}: empty answer (${(c && c.finishReason) || 'no candidate'})`;
        break;
      }
      last = `${model}: ${(j.error && j.error.message) || r.status}`;
      if (r.status === 503 || r.status === 429) { await sleep(20000); continue; }
      break; // 404 or other: next model
    }
  }
  throw new Error('Gemini: ' + last.slice(0, 160));
}

async function claude(system, user, maxTokens = 16000) {
  if (USE_GEMINI) return gemini(system, user, maxTokens);
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error('Claude: ' + ((j.error && j.error.message) || r.status));
  return parseJson((j.content || []).filter(b => b.type === 'text').map(b => b.text).join(''));
}

/* ---------- site knowledge ---------- */
const FACTS = `Melissa Photography Paris (melissaphotographyparis.fr) : Melissa est photographe à Paris et dans tout l'ouest parisien (Hauts-de-Seine, de Boulogne à Versailles). Elle photographie les demandes en mariage, les mariages (dont les mariages religieux et orientaux, en tant que photographe femme), les séances couple et portrait, les concerts et événements, et le sport (jiu-jitsu brésilien). Elle parle français, anglais et arabe. Photo uniquement, pas de vidéo, prix doux.
Lieux préférés pour les demandes : pont de Bir-Hakeim, allée des Cygnes, avenue de Camoëns, square du Vert-Galant, Palais-Royal. Elle évite le Trocadéro pour les demandes (trop de monde), sans parler d'incident.
Concerts déjà photographiés : Fever 333 et Owen au Lollapalooza Paris 2023, Celia Maqam, Kader, Chemsou Freeklane, Kamel Aziz (octobre 2026). Toujours sans flash.
Tarifs : demande express 30 min 150 € (10 photos) ou 200 € (20+ photos), livrées en 24 h ; demande 1 h dès 290 € (20+ photos, livrées en 24 h) ; demande + décoration dès 690 € ; portrait dès 150 € ; séance couple dès 250 € (1 h 30, 25+ photos) ; mariage à la mairie dès 250 € pour 2 h (jusqu'à 400 € selon la durée) ; demi-journée 500 € ; journée complète 750 € ; concert ou événement dès 300 € (2 h, 60+ photos) ; sport dès 100 €. Galerie privée en ligne.
Avis : 5,0 sur Airbnb (12 avis) et 5,0 sur Google.
Pour les mariages, dire « mariage religieux ou oriental » plutôt que « mariage musulman ». Ne jamais écrire que Melissa est basée à Boulogne.`;

const RULES = `Règles strictes :
1. N'invente aucun fait : pas de chiffres, de noms de clients, d'anecdotes, de récompenses ou d'expériences qui ne sont pas dans ce message ou dans les notes de Melissa. Les faits généraux et vérifiables sur des lieux publics sont permis s'ils sont exacts ; dans le doute, reste général. Si une autorisation peut être nécessaire pour photographier un lieu, dis-le.
2. N'utilise JAMAIS de tiret cadratin ni de tiret demi-cadratin. Pour une fourchette, écris « de 3 à 4 h ».
3. Ton : chaleureux, honnête, première personne (Melissa), vouvoiement en français. Phrases simples, pas de jargon marketing.
4. SEO : le titre fait au maximum 60 caractères, reprend le sujet proposé et contient l'idée de la recherche visée. Chaque titre est entièrement écrit dans la langue de sa version : si la recherche visée est en anglais, le titre français utilise son équivalent français (« demande en mariage surprise », pas « surprise proposal »), et inversement. Jamais de mots anglais dans le titre français. « desc » fait moins de 155 caractères. « short » est une phrase d'accroche.
5. Longueur : 700 à 1000 mots en français ; mêmes contenus en anglais et en arabe (arabe standard simple).
6. Structure : 4 à 7 sections, titres numérotés « 1. ... ». Une section peut avoir "p" (paragraphes), "list" (puces) et "after" (paragraphes après la liste). Pour un guide de lieux, une section peut avoir "kicker" (conseil pratique court) et "place": {"addr": "adresse exacte", "q": "requête Google Maps"} seulement si tu es sûr de l'adresse.`;

const SCHEMA = `Réponds uniquement avec un objet JSON valide, sans texte autour :
{"slug":{"fr":"...","en":"...","ar":"(identique à en)"},
 "service":"proposal|wedding|couple|concert|oriental|west",
 "fr":{"title":"...","short":"...","desc":"...","coverAlt":"description de la photo de couverture si pertinente","intro":["..."],
       "sections":[{"h2":"1. ...","p":["..."],"list":["(optionnel)"],"after":["(optionnel)"]}],
       "tips":["3 à 5 conseils courts"],
       "cta":{"title":"...","text":"...","btn":"...","more":"..."}},
 "en":{ même structure },
 "ar":{ même structure }}
Slugs : minuscules, mots séparés par des tirets simples, sans accents, 3 à 7 mots.`;

const CATEGORIES = ['places', 'prices', 'weddings', 'stories', 'live'];
const SESSION_FOR = { proposal: 's-prop', wedding: 's-wed', couple: 's-couple', concert: 's-event', oriental: 's-wed', west: 's-wed-hall' };
const PHOTO_CAT_FOR = { proposal: 'proposal', wedding: 'wedding', couple: 'portrait', concert: 'event', oriental: 'wedding', west: 'wedding' };

function existingPosts() {
  return fs.readdirSync(POSTS).filter(f => f.endsWith('.json')).map(f => ({ file: f, ...JSON.parse(fs.readFileSync(path.join(POSTS, f), 'utf8')) }));
}

function clean(v) {
  if (typeof v === 'string') return v.replace(/\s*[—–]\s*/g, ', ').replace(/,\s*,/g, ',');
  if (Array.isArray(v)) return v.map(clean);
  if (v && typeof v === 'object') { const o = {}; for (const k of Object.keys(v)) o[k] = clean(v[k]); return o; }
  return v;
}

async function pickCover(service, used) {
  try {
    const cfg = fs.readFileSync(path.join(SITE_DIR, 'js', 'supabase-config.js'), 'utf8');
    const url = cfg.match(/url:\s*'([^']+)'/)[1], key = cfg.match(/anonKey:\s*'([^']+)'/)[1];
    const r = await fetch(`${url}/rest/v1/photos?select=image_url,alt_text,category&category=eq.${PHOTO_CAT_FOR[service] || 'proposal'}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
    const rows = (await r.json()).filter(x => x.image_url && !used.has(x.image_url));
    if (rows.length) { const x = rows[Math.floor(Math.random() * rows.length)]; return { cover: x.image_url, alt: x.alt_text || '' }; }
  } catch (e) { console.error('cover', e.message); }
  const blog = fs.readdirSync(path.join(SITE_DIR, 'images', 'blog')).map(f => '/images/blog/' + f).filter(f => !used.has(f));
  return { cover: blog[0] || '/images/blog/bir-hakeim-night.webp', alt: '' };
}

function validate(a) {
  for (const l of ['fr', 'en', 'ar']) {
    const t = a[l];
    if (!t || !t.title || !t.desc || !Array.isArray(t.sections) || !t.sections.length) throw new Error('article incomplet en ' + l);
    if (t.desc.length > 158) t.desc = t.desc.slice(0, 155).replace(/\s+\S*$/, '') + '…';
  }
  if (!a.slug || !a.slug.fr || !a.slug.en) throw new Error('slugs manquants');
}

/* ---------- git helpers ---------- */
function gitSetup() {
  sh('git config user.name "melissa-blog-bot"');
  sh('git config user.email "actions@github.com"');
  sh('git fetch origin --prune');
}
const build = () => sh('node scripts/build-shop-pages.js', { cwd: SITE_DIR });
// '' when the draft branch is gone (already published or discarded)
const draftFile = id => {
  try { return sh(`git diff --name-only origin/main...origin/blog/${id} -- WEBSITE/final-version/scripts/posts`).split('\n').filter(Boolean)[0] || ''; }
  catch (e) { return ''; }
};

async function previewUrl(sha) {
  for (let i = 0; i < 36; i++) {
    try {
      const st = JSON.parse(sh(`gh api repos/${REPO}/commits/${sha}/statuses`));
      const v = st.find(s => /vercel/i.test(s.context || '') && s.state === 'success');
      if (v) {
        // the status links to the Vercel dashboard; the real preview address is on the GitHub deployment
        const deps = JSON.parse(sh(`gh api "repos/${REPO}/deployments?sha=${sha}"`));
        for (const d of deps) {
          const ds = JSON.parse(sh(`gh api repos/${REPO}/deployments/${d.id}/statuses`));
          const ok = ds.find(x => x.state === 'success' && /\.vercel\.app/.test(x.environment_url || ''));
          if (ok) return ok.environment_url.replace(/\/$/, '');
        }
        if (/\.vercel\.app/.test(v.target_url || '')) return v.target_url.replace(/\/$/, '');
      }
      if (st.find(s => /vercel/i.test(s.context || '') && (s.state === 'failure' || s.state === 'error'))) return '';
    } catch (e) { /* not yet */ }
    await sleep(10000);
  }
  return '';
}

async function sendDraft(id, post, sha, isRevision) {
  const t = post.fr;
  const url = await previewUrl(sha);
  const heads = (t.sections || []).map(s => '• ' + escH(String(s.h2).replace(/^\d+\.\s*/, ''))).join('\n');
  const text = [
    isRevision ? '✏️ <b>Brouillon corrigé</b>' : '📝 <b>Brouillon prêt</b>',
    '',
    `<b>${escH(t.title)}</b>`,
    escH(t.short || ''),
    '',
    escH((t.intro || [])[0] || '').slice(0, 600),
    '',
    '<b>Au sommaire</b>',
    heads,
    '',
    url ? `👀 Aperçu : ${url}/fr/blog/${post.slug.fr}/` : '👀 L’aperçu Vercel arrive (regarde la pull request sur GitHub).',
    '',
    'Pour corriger, <b>réponds à ce message</b> avec ce que tu veux changer.',
    `Réf : blog/${id}`,
  ].join('\n');
  await say(text, { reply_markup: { inline_keyboard: [[{ text: '✅ Publier', callback_data: 'pub:' + id }, { text: '🗑 Abandonner', callback_data: 'drop:' + id }]] } });
}

/* ---------- actions ---------- */
async function ideas() {
  const posts = existingPosts().map(p => '- ' + p.fr.title).join('\n');
  let queries = '';
  try { queries = fs.readFileSync(path.join(__dirname, 'queries.txt'), 'utf8'); } catch (e) { /* none */ }
  const list = await claude(
    `Tu proposes des idées d'articles de blog pour Melissa Photography Paris. ${FACTS}\nRéponds uniquement avec un tableau JSON de 5 objets : [{"title":"titre en français, 60 caractères max","query":"recherche Google visée","category":"${CATEGORIES.join('|')}"}]. Pas de tiret cadratin ni demi-cadratin.`,
    `Articles déjà publiés (ne pas refaire le même sujet) :\n${posts}\n\nRecherches Google où le site apparaît déjà ou qui intéressent Melissa :\n${queries}\n\nPropose 5 idées variées (lieux, conseils, mariages, concerts, saisons), utiles pour de vrais clients et qui peuvent se classer sur Google. Pense à la saison actuelle (${today()}).`,
    2000);
  const lines = ['💡 <b>5 idées d’articles</b>', 'Touche ✅ sous celles que tu veux, j’écris et je t’envoie un aperçu.', ''];
  list.slice(0, 5).forEach((x, i) => {
    lines.push(`${i + 1}. ${escH(clean(x.title))}`);
    lines.push(`   🔎 ${escH(x.query)} · 📂 ${CATEGORIES.includes(x.category) ? x.category : 'places'}`);
  });
  await say(lines.join('\n'), { reply_markup: { inline_keyboard: [
    [1, 2, 3].map(n => ({ text: `✅ ${n}`, callback_data: `pick:${n}` })),
    [4, 5].map(n => ({ text: `✅ ${n}`, callback_data: `pick:${n}` })),
    [{ text: '🔄 Autres idées', callback_data: 'more' }],
  ] } });
}

async function write({ title, query, category, notes }) {
  gitSetup();
  const posts = existingPosts();
  const id = Math.random().toString(36).slice(2, 8);
  const user = [
    `Sujet : ${title}`,
    `Recherche Google visée : ${query || '(choisis la plus naturelle)'}`,
    `Catégorie : ${category || '(choisis)'}`,
    `Notes de Melissa : ${notes || '(aucune : reste général et honnête, sans inventer d’expérience vécue)'}`,
    '',
    'Articles déjà publiés (tu peux citer leur sujet, sans copier) :',
    posts.map(p => `- ${p.fr.title}`).join('\n'),
  ].join('\n');
  const a = clean(await claude(`Tu es la plume du blog de Melissa Photography Paris. ${FACTS}\n\n${RULES}\n\n${SCHEMA}`, user));
  validate(a);
  const taken = new Set(posts.flatMap(p => Object.values(p.slug || {})));
  for (const l of ['fr', 'en']) { let s = a.slug[l], n = 2; while (taken.has(s)) s = `${a.slug[l]}-${n++}`; a.slug[l] = s; }
  a.slug.ar = a.slug.en;
  const service = SESSION_FOR[a.service] ? a.service : 'proposal';
  const used = new Set(posts.map(p => p.cover));
  const { cover, alt } = await pickCover(service, used);
  const post = {
    key: a.slug.en, date: today(), updated: today(),
    category: CATEGORIES.includes(category) ? category : (CATEGORIES.includes(a.category) ? a.category : 'places'),
    service, session: SESSION_FOR[service], cover,
    slug: a.slug, fr: a.fr, en: a.en, ar: a.ar,
  };
  if (alt && !post.en.coverAlt) post.en.coverAlt = alt;
  sh(`git checkout -B blog/${id} origin/main`);
  const file = path.join(POSTS, `${today()}-${a.slug.en.slice(0, 50)}.json`);
  fs.writeFileSync(file, JSON.stringify(post, null, 2) + '\n');
  build();
  sh('git add -A WEBSITE/final-version');
  sh(`git commit -q -m "Draft article: ${post.fr.title.replace(/"/g, "'")}"`);
  sh(`git push -q origin blog/${id}`);
  const sha = sh('git rev-parse HEAD');
  try { sh(`gh pr create --head blog/${id} --base main --title "Brouillon : ${post.fr.title.replace(/"/g, "'")}" --body "Écrit par le bot. Corriger ou publier depuis Telegram."`); } catch (e) { console.error('pr', e.message); }
  await sendDraft(id, post, sha, false);
}

async function revise({ id, comment }) {
  gitSetup();
  const rel = draftFile(id);
  if (!rel) { await say('ℹ️ Ce brouillon est déjà publié ou abandonné, je ne peux plus le corriger d’ici.'); return; }
  sh(`git checkout -B blog/${id} origin/blog/${id}`);
  const file = path.join(ROOT, rel);
  const post = JSON.parse(fs.readFileSync(file, 'utf8'));
  const current = { fr: post.fr, en: post.en, ar: post.ar };
  const fixed = clean(await claude(
    `Tu es la plume du blog de Melissa Photography Paris. ${FACTS}\n\n${RULES}\nTu reçois un article (JSON avec fr, en, ar) et une correction demandée par Melissa. Applique la correction dans les trois langues, garde tout le reste, et réponds uniquement avec le JSON complet {"fr":{...},"en":{...},"ar":{...}} dans la même structure.`,
    `Correction de Melissa : ${comment}\n\nArticle actuel :\n${JSON.stringify(current)}`));
  for (const l of ['fr', 'en', 'ar']) if (fixed[l] && fixed[l].title) post[l] = fixed[l];
  validate({ ...post });
  post.updated = today();
  fs.writeFileSync(file, JSON.stringify(post, null, 2) + '\n');
  build();
  sh('git add -A WEBSITE/final-version');
  sh(`git commit -q -m "Draft revised: ${comment.slice(0, 60).replace(/"/g, "'")}"`);
  sh(`git push -q origin blog/${id}`);
  await sendDraft(id, post, sh('git rev-parse HEAD'), true);
}

async function publish({ id }) {
  gitSetup();
  const rel = draftFile(id);
  if (!rel) { await say('ℹ️ Ce brouillon est déjà publié ou abandonné.'); return; }
  const content = sh(`git show origin/blog/${id}:${rel}`);
  sh('git checkout -B main origin/main');
  const post = JSON.parse(content);
  post.date = today(); post.updated = today();
  fs.writeFileSync(path.join(ROOT, rel), JSON.stringify(post, null, 2) + '\n');
  build();
  sh('git add -A WEBSITE/final-version');
  sh(`git commit -q -m "Publish article: ${post.fr.title.replace(/"/g, "'")}"`);
  sh('git push -q origin main');
  try { sh('git push -q origin main:new-shop'); } catch (e) { /* optional mirror */ }
  try { sh(`gh pr close blog/${id} --delete-branch`); } catch (e) { try { sh(`git push -q origin --delete blog/${id}`); } catch (e2) { /* gone */ } }
  const urls = ['fr', 'en', 'ar'].map(l => `${SITE}${l === 'en' ? '' : '/' + l}/blog/${post.slug[l]}/`).concat([`${SITE}/blog/`, `${SITE}/fr/blog/`, `${SITE}/ar/blog/`]);
  await sleep(120000); // let Vercel publish
  try {
    await fetch('https://api.indexnow.org/indexnow', { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: 'www.melissaphotographyparis.fr', key: INDEXNOW_KEY, keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`, urlList: urls }) });
  } catch (e) { console.error('indexnow', e.message); }
  await say(`✅ <b>Publié !</b>\n${escH(post.fr.title)}\n\n${urls[0]}\n\nBing est prévenu. Pour Google : Search Console, Inspection de l’URL, puis « Demander l’indexation ».`);
}

async function discard({ id }) {
  gitSetup();
  try { sh(`gh pr close blog/${id} --delete-branch`); } catch (e) { try { sh(`git push -q origin --delete blog/${id}`); } catch (e2) { /* gone */ } }
}

/* ---------- main ---------- */
(async () => {
  let p = {};
  try { p = JSON.parse(process.env.PAYLOAD || '{}') || {}; } catch (e) { p = {}; }
  const action = p.action || 'ideas'; // the Monday schedule sends ideas
  try {
    if (action === 'ideas') await ideas();
    else if (action === 'write') await write(p);
    else if (action === 'revise') await revise(p);
    else if (action === 'publish') await publish(p);
    else if (action === 'discard') await discard(p);
  } catch (e) {
    console.error(e);
    await say('❌ Oups, ça n’a pas marché (' + escH(String(e.message || e).slice(0, 200)) + '). Réessaie, ou regarde l’onglet Actions sur GitHub.');
    process.exitCode = 1;
  }
})();
