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
const B = require('./blog-content.js');
const BLOG_LANGS = ['en', 'fr'];
const blogPath = l => (l === 'en' ? '/blog/' : `/${l}/blog/`);
const postPath = (p, l) => blogPath(l) + p.slug[l] + '/';
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
  const links = C.services.map(s => `<a href="${servicePath(s, l)}">${escHTML(s[l].nav)}</a>`)
    .concat(BLOG_LANGS.includes(l) ? [`<a href="${blogPath(l)}">${escHTML(B.ui[l].blog)}</a>`] : []).join('\n      ');
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
    TERMS: legal(l).terms, PRIVACY: legal(l).privacy, BLOG_HREF: blogPath(BLOG_LANGS.includes(l) ? l : 'en'),
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
${l === 'ar' ? ARABIC_FONTS + '\n' : ''}<link rel="stylesheet" href="/css/shop.css?v=4">
<link rel="stylesheet" href="/css/landing.css?v=3">
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
    <div>${others.map(x => `<a href="${servicePath(x, l)}">${escHTML(x[l].nav)}</a>`).join('')}${BLOG_LANGS.includes(l) ? `<a href="${blogPath(l)}">${escHTML(B.ui[l].blog)}</a>` : ''}</div>
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

/* ---------- 3. blog ---------- */
function shell({ l, title, desc, here, alt, ogImage, jsonld, body, switchTo }) {
  const ui = C.ui[l], home = homePath(l);
  return `<!doctype html>
<html lang="${l}" dir="${dirOf(l)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${escHTML(title)}</title>
<meta name="description" content="${escAttr(desc)}">
<meta name="theme-color" content="#7ab8cb">
<link rel="canonical" href="${SITE}${here}">
${alt}
<meta property="og:type" content="${jsonld.some(j => j['@type'] === 'BlogPosting') ? 'article' : 'website'}">
<meta property="og:site_name" content="Melissa Photography Paris">
<meta property="og:locale" content="${ogLocale[l]}">
<meta property="og:url" content="${SITE}${here}">
<meta property="og:title" content="${escAttr(title)}">
<meta property="og:description" content="${escAttr(desc)}">
<meta property="og:image" content="${SITE}${ogImage}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Shrikhand&amp;family=Fraunces:ital,opsz,wght,SOFT@0,9..144,400..800,100;1,9..144,400..700,100&amp;family=Caveat:wght@500;700&amp;display=swap">
<link rel="stylesheet" href="/css/shop.css?v=4">
<link rel="stylesheet" href="/css/landing.css?v=3">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.1.0/dist/cookieconsent.css">
<script>document.documentElement.classList.add('js'); try { localStorage.setItem('shop-lang', '${l}'); } catch (e) {}</script>
${jsonld.map(j => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n')}
${pixel}
<!-- TikTok Events for Photography Website: page view only -->
</head>
<body class="lp lp-blog">
<header class="topbar">
  <div class="topbar-inner">
    <a class="brand" href="${home}">Melissa's</a>
    <nav aria-label="${escAttr(ui.home)}">
      <a href="${home}#catalogue">${escHTML(ui.catalogue)}</a>
      <a href="${home}#me">${escHTML(ui.about)}</a>
      <a href="${home}#book">${escHTML(ui.bookNav)}</a>
    </nav>
    ${langSwitch(l, switchTo)}
  </div>
</header>
${body}
<footer class="shopfoot">
  <span>Melissa Photography · Paris</span>
  <a href="https://www.instagram.com/melissa_photography_paris" target="_blank" rel="noopener">Instagram</a>
  <a href="https://www.tiktok.com/@thegirlwith0tattoo" target="_blank" rel="noopener">TikTok</a>
  <a href="${legal(l).terms}">${escHTML(I18N.dict['Terms of use'][l] || 'Terms of use')}</a>
  <a href="${legal(l).privacy}">${escHTML(I18N.dict['Privacy'][l] || 'Privacy')}</a>
  ${langSwitch(l, switchTo)}
</footer>
<script defer src="https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.1.0/dist/cookieconsent.umd.js"></script>
<script src="/js/cookieconsent-config.js" type="module"></script>
</body>
</html>
`;
}
function langSwitch(l, to) {
  return `<div class="lang-switch" role="group" aria-label="${escAttr(I18N.dict['Choose your language'][l] || 'Choose your language')}">${LANGS.map(x => `<a href="${to(x)}" lang="${x}" hreflang="${x}" data-lang="${x}"${x === l ? ' aria-current="true"' : ''}>${x === 'ar' ? 'ع' : x.toUpperCase()}</a>`).join('')}</div>`;
}
const blogAlternates = pathFor => BLOG_LANGS.map(x => `<link rel="alternate" hreflang="${x}" href="${SITE}${pathFor(x)}">`).join('\n')
  + `\n<link rel="alternate" hreflang="x-default" href="${SITE}${pathFor('en')}">`;
const fmtDate = (d, l) => new Date(d + 'T12:00').toLocaleDateString(l === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
const print = ([src, alt, cap], tilt, eager) => `<figure class="post-print" style="--tilt:${tilt}deg"><span class="lp-print"><img src="${src}" alt="${escAttr(alt)}" loading="${eager ? 'eager' : 'lazy'}" width="667" height="1000"></span><figcaption>${escHTML(cap)}</figcaption></figure>`;

// Animated illustration: Bir-Hakeim bridge, the metro crossing it, the tower sparkling, a proposal.
function heroBirHakeim(label) {
  const cx = 432, cy = 214, rays = [];
  for (let i = 0; i < 24; i++) {
    const a1 = Math.PI + (i / 24) * Math.PI * 2, a2 = a1 + Math.PI / 24;
    rays.push(`<polygon points="${cx},${cy} ${(cx + 190 * Math.cos(a1)).toFixed(1)},${(cy + 190 * Math.sin(a1)).toFixed(1)} ${(cx + 190 * Math.cos(a2)).toFixed(1)},${(cy + 190 * Math.sin(a2)).toFixed(1)}"/>`);
  }
  const cols = [];
  for (let x = 6; x < 600; x += 38) cols.push(`<rect x="${x}" y="176" width="7" height="38" rx="2"/>`);
  const sparks = [[396, 70], [470, 96], [420, 132], [452, 40], [398, 160], [478, 150]]
    .map(([x, y], i) => `<path class="bh-spark" style="animation-delay:${(i * 0.35).toFixed(2)}s" d="M${x} ${y - 7} Q${x} ${y} ${x + 7} ${y} Q${x} ${y} ${x} ${y + 7} Q${x} ${y} ${x - 7} ${y} Q${x} ${y} ${x} ${y - 7}Z"/>`).join('');
  return `<svg class="bh" viewBox="0 0 600 300" role="img" aria-label="${escAttr(label)}">
  <defs><clipPath id="bh-sky"><rect x="0" y="0" width="600" height="214"/></clipPath></defs>
  <g clip-path="url(#bh-sky)">
    <g class="sk-sunrise"><circle cx="${cx}" cy="${cy}" r="130" fill="#fdf6ea"/><g class="bh-rays" fill="#f6c3cf">${rays.join('')}</g><circle cx="${cx}" cy="${cy}" r="40" fill="#f5d67f"/></g>
  </g>
  <g class="sk-mon sk-tower" transform="translate(${cx} 214)" fill="#1f3a4d">
    <path d="M-46 0 L-31 -56 L-37 -59 L-37 -66 L37 -66 L37 -59 L31 -56 L46 0 L27 0 Q0 -42 -27 0 Z"/>
    <path d="M-27 -66 L-16 -122 L-21 -124 L-21 -130 L21 -130 L21 -124 L16 -122 L27 -66 Z"/>
    <path d="M-14 -130 L-4 -186 L-3 -192 L3 -192 L4 -186 L14 -130 Z"/>
    <path d="M-1.6 -192 L-1 -206 L1 -206 L1.6 -192 Z"/>
  </g>
  <g class="bh-sparks" fill="#fffaf1">${sparks}</g>
  <!-- the metro deck, its columns and a train crossing -->
  <g class="bh-train"><rect x="0" y="150" width="128" height="18" rx="5" fill="#e58aa2"/><rect x="8" y="154" width="18" height="8" rx="2" fill="#fdf6ea"/><rect x="34" y="154" width="18" height="8" rx="2" fill="#fdf6ea"/><rect x="60" y="154" width="18" height="8" rx="2" fill="#fdf6ea"/><rect x="86" y="154" width="18" height="8" rx="2" fill="#fdf6ea"/><rect x="110" y="154" width="12" height="8" rx="2" fill="#fdf6ea"/></g>
  <rect x="0" y="168" width="600" height="9" fill="#1f3a4d"/>
  <g fill="#2c4d63">${cols.join('')}</g>
  <rect x="0" y="212" width="600" height="6" fill="#1f3a4d"/>
  <!-- the couple on the walkway -->
  <g class="sk-couple" transform="translate(214 212) scale(.64)">
    <g stroke="#1f3a4d" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M-22 -14 L-30 0 L-14 0"/><path d="M-8 -14 L6 -14 L6 0"/><path d="M-10 -32 L4 -40"/></g>
    <path d="M-24 -40 L-8 -40 L-6 -14 L-24 -14 Z" fill="#1f3a4d"/><circle cx="-16" cy="-50" r="8" fill="#1f3a4d"/>
    <path d="M18 -48 L32 -48 L42 0 L10 0 Z" fill="#e58aa2"/><path d="M20 -46 L10 -40" stroke="#e58aa2" stroke-width="6" stroke-linecap="round"/>
    <circle cx="25" cy="-58" r="8" fill="#1f3a4d"/><path d="M18 -62 q7 -10 15 0 q4 8 1 14" fill="#1f3a4d"/>
    <path class="sk-ring" d="M7 -46 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2Z" fill="#f5d67f"/>
    <path class="sk-heart" d="M0 -70 c-4 -6 -12 -2 -8 4 l8 7 8 -7 c4 -6 -4 -10 -8 -4Z" fill="#e58aa2"/>
  </g>
  <!-- the Seine -->
  <g class="bh-river" stroke="#fdf6ea" stroke-width="3" stroke-linecap="round" fill="none" opacity=".75">
    <path d="M-40 240 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0"/>
    <path d="M-20 262 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0"/>
    <path d="M-40 284 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0"/>
  </g>
</svg>`;
}
const REVEAL = `<script>
  // fade the sections in as they scroll into view (skipped if the visitor prefers less motion)
  (function () {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) { entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) { io.observe(e); });
  })();
</script>`;

function buildBlogIndex(l) {
  const u = B.ui[l], ui = C.ui[l], here = blogPath(l);
  const posts = B.posts.filter(p => p[l]);
  const body = `<main class="lp-main">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="${homePath(l)}">${escHTML(ui.home)}</a> <span aria-hidden="true">›</span> <span>${escHTML(u.blog)}</span></nav>
  <header class="lp-hero">
    <p class="lp-kicker">Melissa Photography · Paris</p>
    <h1>${escHTML(u.blogTitle)}</h1>
    <p class="lede">${escHTML(u.blogLede)}</p>
  </header>
  <section class="post-list">
${posts.map((p, i) => `    <article class="post-card">
      <a href="${postPath(p, l)}">
        <span class="lp-print"><img src="${p.cover}" alt="" loading="${i < 2 ? 'eager' : 'lazy'}" width="667" height="1000"></span>
        <span class="post-card-text">
          <time datetime="${p.date}">${escHTML(fmtDate(p.date, l))}</time>
          <h2>${escHTML(p[l].title)}</h2>
          <p>${escHTML(p[l].short)}</p>
          <span class="post-read">${escHTML(u.read)} →</span>
        </span>
      </a>
    </article>`).join('\n')}
  </section>
</main>`;
  write(here + 'index.html', shell({
    l, title: `${u.blogTitle} · Melissa Photography Paris`, desc: u.blogLede, here, alt: blogAlternates(blogPath),
    ogImage: posts[0].cover, body, switchTo: x => (BLOG_LANGS.includes(x) ? blogPath(x) : homePath(x)),
    jsonld: [{ '@context': 'https://schema.org', '@type': 'Blog', name: u.blogTitle, url: SITE + here, inLanguage: l,
      blogPost: posts.map(p => ({ '@type': 'BlogPosting', headline: p[l].title, url: SITE + postPath(p, l), datePublished: p.date })) }],
  }));
}

function buildPost(p, l) {
  const u = B.ui[l], ui = C.ui[l], t = p[l], here = postPath(p, l), home = homePath(l);
  const svc = C.services.find(s => s.key === p.service);
  let k = 0;
  const heroLabel = l === 'fr' ? "Illustration animée : le pont de Bir-Hakeim, un métro qui passe, la tour Eiffel qui scintille et une demande en mariage" : 'Animated illustration: Bir-Hakeim bridge, a metro passing, the Eiffel Tower sparkling and a proposal';
  const body = `<main class="lp-main post">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="${home}">${escHTML(ui.home)}</a> <span aria-hidden="true">›</span> <a href="${blogPath(l)}">${escHTML(u.blog)}</a> <span aria-hidden="true">›</span> <span>${escHTML(t.title.split(':')[0].trim())}</span></nav>
  <article>
    <header class="lp-hero post-hero">
      <p class="lp-kicker">${escHTML(u.blog)} · <time datetime="${p.date}">${escHTML(fmtDate(p.date, l))}</time></p>
      <h1>${escHTML(t.title)}</h1>
      ${p.hero === 'bir-hakeim' ? heroBirHakeim(heroLabel) : ''}
      <p class="lede">${escHTML(t.short)}</p>
      <p class="post-by">${escHTML(u.by)}</p>
    </header>
    <div class="post-body">
${t.intro.map(x => `      <p class="reveal">${escHTML(x)}</p>`).join('\n')}
${t.honest ? `      <aside class="honest reveal">
        <span class="honest-tape" aria-hidden="true"></span>
        <h2>${escHTML(t.honest.title)}</h2>
${t.honest.p.map(x => `        <p>${escHTML(x)}</p>`).join('\n')}
        <p class="honest-sign">${escHTML(t.honest.sign)}</p>
      </aside>` : ''}
${t.spots.map(sp => `      <section class="post-spot reveal">
        <h2>${escHTML(sp.h2)}</h2>
        ${sp.kicker ? `<p class="spot-kicker"><span>${escHTML(u.practical)}</span> ${escHTML(sp.kicker)}</p>` : ''}
        ${sp.photo ? print(sp.photo, [-2, 1.8, -1.2, 2.2][k++ % 4], k === 1) : ''}
${sp.p.map(x => `        <p>${escHTML(x)}</p>`).join('\n')}
      </section>`).join('\n')}
      <aside class="lp-card post-tips reveal">
        <h2>${escHTML(u.tipsTitle)}</h2>
        <ul>
${t.tips.map(x => `          <li>${escHTML(x)}</li>`).join('\n')}
        </ul>
      </aside>
      ${t.ending && t.ending.photo ? `<div class="post-ending reveal">${print(t.ending.photo, -1.5, false)}</div>` : ''}
    </div>
  </article>
  <section class="lp-final post-cta reveal">
    <h2>${escHTML(u.ctaTitle)}</h2>
    <p>${escHTML(u.ctaText)}</p>
    <div class="lp-cta">
      <a class="btn orange" href="${home}?go=book&amp;session=${p.session}">${escHTML(u.ctaBtn)}</a>
      ${svc ? `<a class="btn" href="${servicePath(svc, l)}">${escHTML(u.ctaMore)}</a>` : ''}
    </div>
  </section>
  <p class="post-back"><a href="${blogPath(l)}">← ${escHTML(u.back)}</a></p>
</main>
${REVEAL}`;
  write(here + 'index.html', shell({
    l, title: `${t.title} · Melissa Photography Paris`, desc: t.desc, here, alt: blogAlternates(x => postPath(p, x)),
    ogImage: p.cover, body, switchTo: x => (BLOG_LANGS.includes(x) && p[x] ? postPath(p, x) : homePath(x)),
    jsonld: [
      { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: t.title, description: t.desc, image: SITE + p.cover,
        datePublished: p.date, dateModified: p.updated || p.date, inLanguage: l, mainEntityOfPage: SITE + here,
        author: { '@type': 'Person', name: 'Melissa', url: SITE + home },
        publisher: { '@type': 'Organization', name: 'Melissa Photography Paris', url: SITE + '/' } },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: ui.home, item: SITE + home },
        { '@type': 'ListItem', position: 2, name: u.blog, item: SITE + blogPath(l) },
        { '@type': 'ListItem', position: 3, name: t.title, item: SITE + here },
      ] },
    ],
  }));
}

/* ---------- 4. sitemap ---------- */
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
  const blogGroups = [blogPath, ...B.posts.map(p => l => postPath(p, l))];
  blogGroups.forEach(pathFor => BLOG_LANGS.forEach(l => urls.push(`  <url>
    <loc>${SITE}${pathFor(l)}</loc>
    <lastmod>${TODAY}</lastmod>
    <priority>0.7</priority>
${BLOG_LANGS.map(x => `    <xhtml:link rel="alternate" hreflang="${x}" href="${SITE}${pathFor(x)}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${pathFor('en')}"/>
  </url>`)));
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
BLOG_LANGS.forEach(buildBlogIndex);
B.posts.forEach(p => BLOG_LANGS.forEach(l => p[l] && buildPost(p, l)));
sitemap();
