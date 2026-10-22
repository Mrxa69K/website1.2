#!/usr/bin/env node
/*
 * Builds the pages Google reads, from one source of truth:
 *
 *   scripts/shop-template.html + js/shop-i18n.js   ->  /index.html, /fr/index.html, /ar/index.html
 *   scripts/landing-content.js                     ->  one page per service and language
 *   everything above                               ->  sitemap.xml
 *
 * Run from WEBSITE/final-version:   node scripts/build-shop-pages.js
 * Never edit the generated files by hand: edit the sources and run this again.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://www.melissaphotographyparis.fr';
const LANGS = ['en', 'fr', 'ar'];
const TODAY = new Date().toISOString().slice(0, 10);

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js/shop-i18n.js'), 'utf8'), sandbox);
const I18N = sandbox.window.SHOP_I18N;
const C = require('./landing-content.js');
const template = fs.readFileSync(path.join(__dirname, 'shop-template.html'), 'utf8');

const escHTML = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = s => escHTML(s).replace(/"/g, '&quot;');
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const homePath = l => (l === 'en' ? '/' : `/${l}/`);
const servicePath = (s, l) => (l === 'en' ? `/${s.slug.en}/` : `/${l}/${s.slug[l]}/`);
const dirOf = l => (l === 'ar' ? 'rtl' : 'ltr');
const ogLocale = { en: 'en_GB', fr: 'fr_FR', ar: 'ar_AR' };
const ARABIC_FONTS = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lalezar&amp;family=Tajawal:wght@400;500;700;800&amp;family=Aref+Ruqaa:wght@400;700&amp;display=swap">';
const legal = l => (l === 'fr' ? { terms: '/termsfr.html', privacy: '/politique.html' } : { terms: '/terms.html', privacy: '/policy.html' });

function alternates(pathFor) {
  return LANGS.map(l => `<link rel="alternate" hreflang="${l}" href="${SITE}${pathFor(l)}">`).join('\n')
    + `\n<link rel="alternate" hreflang="x-default" href="${SITE}${pathFor('en')}">`;
}
function switchVars(pathFor, cur) {
  const v = {};
  LANGS.forEach(l => {
    v[`HREF_${l.toUpperCase()}`] = pathFor(l);
    v[`CUR_${l.toUpperCase()}`] = l === cur ? ' aria-current="true"' : '';
  });
  return v;
}
function fillVars(html, vars) {
  return html.replace(/%%([A-Z_]+)%%/g, (m, k) => {
    if (!(k in vars)) throw new Error('missing template value ' + k);
    return vars[k];
  });
}

/* ---------- 1. the shop homepage in each language ---------- */
function translateHTML(html, l) {
  if (l === 'en') return html;
  const keys = Object.keys(I18N.dict).filter(k => !k.includes('{')).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    const tr = I18N.dict[k][l];
    if (!tr) continue;
    for (const form of new Set([k, escHTML(k)])) {
      html = html.replace(new RegExp(`(>\\s*)${reEsc(form)}(\\s*<)`, 'g'), (m, a, b) => a + escHTML(tr) + b);
      html = html.replace(new RegExp(`((?:aria-label|placeholder|alt|title)=")${reEsc(escAttr(form))}(")`, 'g'), (m, a, b) => a + escAttr(tr) + b);
    }
  }
  return html;
}
function serviceLinks(l, cls) {
  const links = C.services.map(s => `<a href="${servicePath(s, l)}">${escHTML(s[l].nav)}</a>`).join('\n      ');
  return `<nav class="${cls}" aria-label="${escAttr(C.ui[l].more)}">\n      ${links}\n    </nav>`;
}
function buildHome(l) {
  const meta = I18N.meta[l];
  const html = translateHTML(template, l);
  const out = fillVars(html, {
    LANG: l, DIR: dirOf(l), TITLE: escAttr(meta.title), DESC: escAttr(meta.description),
    CANONICAL: SITE + homePath(l), ALTERNATES: alternates(homePath), OG_LOCALE: ogLocale[l],
    ARABIC_FONTS: l === 'ar' ? ARABIC_FONTS : '',
    CAT_LINKS: serviceLinks(l, 'shelf-links'), SERVICE_LINKS: serviceLinks(l, 'foot-services'),
    TERMS: legal(l).terms, PRIVACY: legal(l).privacy,
    ...switchVars(homePath, l),
  });
  write(homePath(l) + 'index.html', out);
  // English sentences that are still visible after translation = a missing or mismatched key
  if (l !== 'en') {
    const body = out.slice(out.indexOf('<body'));
    const left = Object.keys(I18N.dict).filter(k => !k.includes('{') && I18N.dict[k][l] && I18N.dict[k][l] !== k
      && new RegExp(`>\\s*${reEsc(escHTML(k))}\\s*<`).test(body));
    if (left.length) console.warn(`[${l}] not translated:`, left);
  }
}

/* ---------- 2. one page per service and language ---------- */
const pixel = (() => {
  const a = template.indexOf('<!-- TikTok Pixel Code Start -->');
  const b = template.indexOf('<!-- TikTok Pixel Code End -->') + '<!-- TikTok Pixel Code End -->'.length;
  return template.slice(a, b);
})();

function buildService(s, l) {
  const ui = C.ui[l], t = s[l], here = servicePath(s, l), home = homePath(l);
  const price = p => (p.from ? ui.from(ui.money(p.price)) : ui.money(p.price));
  const others = C.services.filter(x => x !== s);
  const jsonld = [
    {
      '@context': 'https://schema.org', '@type': 'Service', name: t.h1, description: t.desc, url: SITE + here,
      serviceType: t.nav, areaServed: { '@type': 'City', name: 'Paris' },
      provider: { '@type': 'ProfessionalService', name: 'Melissa Photography Paris', alternateName: "Melissa's Photography", url: SITE + '/', image: SITE + '/images/proposal/16.webp',
        aggregateRating: { '@type': 'AggregateRating', ratingValue: '5.0', reviewCount: '12', bestRating: '5' } },
      offers: s.packages.map(p => ({ '@type': 'Offer', name: p.name[l], price: String(p.price), priceCurrency: 'EUR' })),
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: t.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: ui.home, item: SITE + home },
      { '@type': 'ListItem', position: 2, name: t.nav, item: SITE + here },
    ] },
  ];
  const tilt = i => [-2.2, 1.6, -1, 2.4, -1.8, 1.2][i % 6];
  const html = `<!doctype html>
<html lang="${l}" dir="${dirOf(l)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${escHTML(t.title)}</title>
<meta name="description" content="${escAttr(t.desc)}">
<meta name="theme-color" content="#7ab8cb">
<link rel="canonical" href="${SITE}${here}">
${alternates(x => servicePath(s, x))}
<meta property="og:type" content="website">
<meta property="og:site_name" content="Melissa's Photography Paris">
<meta property="og:locale" content="${ogLocale[l]}">
<meta property="og:url" content="${SITE}${here}">
<meta property="og:title" content="${escAttr(t.title)}">
<meta property="og:description" content="${escAttr(t.desc)}">
<meta property="og:image" content="${SITE}${s.photos[0][0]}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Shrikhand&amp;family=Fraunces:ital,opsz,wght,SOFT@0,9..144,400..800,100;1,9..144,400..700,100&amp;family=Caveat:wght@500;700&amp;display=swap">
${l === 'ar' ? ARABIC_FONTS + '\n' : ''}<link rel="stylesheet" href="/css/shop.css?v=3">
<link rel="stylesheet" href="/css/landing.css?v=1">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.1.0/dist/cookieconsent.css">
<script>try { localStorage.setItem('shop-lang', '${l}'); } catch (e) {}</script>
${jsonld.map(j => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n')}
${pixel}
<!-- TikTok Events for Photography Website: page view only -->
</head>
<body class="lp">
<header class="topbar">
  <div class="topbar-inner">
    <a class="brand" href="${home}">Melissa's</a>
    <nav aria-label="${escAttr(ui.home)}">
      <a href="${home}#catalogue">${escHTML(ui.catalogue)}</a>
      <a href="${home}#me">${escHTML(ui.about)}</a>
      <a href="${home}?go=book&amp;session=${s.session}">${escHTML(ui.bookNav)}</a>
    </nav>
    <div class="lang-switch" role="group" aria-label="${escAttr(I18N.dict['Choose your language'][l] || 'Choose your language')}">
      ${LANGS.map(x => `<a href="${servicePath(s, x)}" lang="${x}" hreflang="${x}" data-lang="${x}"${x === l ? ' aria-current="true"' : ''}>${x === 'ar' ? 'ع' : x.toUpperCase()}</a>`).join('')}
    </div>
  </div>
</header>

<main class="lp-main">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="${home}">${escHTML(ui.home)}</a> <span aria-hidden="true">›</span> <span>${escHTML(t.nav)}</span></nav>

  <header class="lp-hero">
    <p class="lp-kicker">Melissa's Photography · Paris</p>
    <h1>${escHTML(t.h1)}</h1>
    <p class="lede">${escHTML(t.lede)}</p>
    <p class="lp-stars"><span aria-hidden="true">★★★★★</span> ${escHTML(ui.reviews)}</p>
    <div class="lp-cta">
      <a class="btn orange" href="${home}?go=book&amp;session=${s.session}">${escHTML(ui.book)}</a>
      <a class="btn" href="${home}#album/${s.album}">${escHTML(ui.album)}</a>
    </div>
  </header>

  <section class="lp-prints" aria-label="${escAttr(t.nav)}">
${s.photos.map(([src, alt, cap], i) => `    <figure style="--tilt:${tilt(i)}deg"><span class="lp-print"><img src="${src}" alt="${escAttr(alt[l])}" loading="${i < 3 ? 'eager' : 'lazy'}" width="667" height="1000"></span><figcaption>${escHTML(cap[l])}</figcaption></figure>`).join('\n')}
  </section>

  <section class="lp-story">
${t.story.map(p => `    <p>${escHTML(p)}</p>`).join('\n')}
  </section>

  <section class="lp-cards">
    <div class="lp-card">
      <h2>${escHTML(ui.included)}</h2>
      <ul>
${t.included.map(x => `        <li>${escHTML(x)}</li>`).join('\n')}
      </ul>
    </div>
    <div class="lp-card lp-price">
      <h2>${escHTML(ui.price)}</h2>
      <ul class="lp-packages">
${s.packages.map(p => `        <li><a href="${home}?go=book&amp;session=${p.session}"><b>${escHTML(p.name[l])}</b><span>${escHTML(p.info[l])}</span><em>${escHTML(price(p))}</em></a></li>`).join('\n')}
      </ul>
    </div>
  </section>

  <section class="lp-faq">
    <h2>${escHTML(ui.faq)}</h2>
${t.faq.map(([q, a]) => `    <details><summary>${escHTML(q)}</summary><p>${escHTML(a)}</p></details>`).join('\n')}
  </section>

  <section class="lp-final">
    <h2>${escHTML(ui.finalTitle)}</h2>
    <p>${escHTML(ui.finalText)}</p>
    <a class="btn orange" href="${home}?go=book&amp;session=${s.session}">${escHTML(ui.book)}</a>
  </section>

  <nav class="lp-more" aria-label="${escAttr(ui.more)}">
    <h2>${escHTML(ui.more)}</h2>
    <div>${others.map(x => `<a href="${servicePath(x, l)}">${escHTML(x[l].nav)}</a>`).join('')}</div>
  </nav>
</main>

<footer class="shopfoot">
  <span>Melissa Photography · Paris</span>
  <a href="https://www.instagram.com/melissa_photography_paris" target="_blank" rel="noopener">Instagram</a>
  <a href="https://www.tiktok.com/@thegirlwith0tattoo" target="_blank" rel="noopener">TikTok</a>
  <a href="${legal(l).terms}">${escHTML(I18N.dict['Terms of use'][l] || 'Terms of use')}</a>
  <a href="${legal(l).privacy}">${escHTML(I18N.dict['Privacy'][l] || 'Privacy')}</a>
  <div class="lang-switch" role="group" aria-label="${escAttr(I18N.dict['Choose your language'][l] || 'Choose your language')}">
    ${LANGS.map(x => `<a href="${servicePath(s, x)}" lang="${x}" hreflang="${x}" data-lang="${x}"${x === l ? ' aria-current="true"' : ''}>${x === 'ar' ? 'ع' : x.toUpperCase()}</a>`).join('')}
  </div>
</footer>
<script defer src="https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.1.0/dist/cookieconsent.umd.js"></script>
<script src="/js/cookieconsent-config.js" type="module"></script>
</body>
</html>
`;
  write(here + 'index.html', html);
}

/* ---------- 3. sitemap ---------- */
function sitemap() {
  const groups = [homePath, ...C.services.map(s => l => servicePath(s, l))];
  const urls = [];
  groups.forEach((pathFor, gi) => {
    LANGS.forEach(l => {
      urls.push(`  <url>
    <loc>${SITE}${pathFor(l)}</loc>
    <lastmod>${TODAY}</lastmod>
    <priority>${gi === 0 ? (l === 'en' ? '1.0' : '0.9') : '0.8'}</priority>
${LANGS.map(x => `    <xhtml:link rel="alternate" hreflang="${x}" href="${SITE}${pathFor(x)}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${pathFor('en')}"/>
  </url>`);
    });
  });
  ['/terms.html', '/termsfr.html', '/policy.html', '/politique.html'].forEach(p => urls.push(`  <url><loc>${SITE}${p}</loc><priority>0.2</priority></url>`));
  write('/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`);
}

function write(rel, content) {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  console.log('wrote', rel);
}

LANGS.forEach(buildHome);
C.services.forEach(s => LANGS.forEach(l => buildService(s, l)));
sitemap();
