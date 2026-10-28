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
const A = require('./about-content.js');
const R = require('./reviews-content.js');
const reviewsPath = l => (l === 'en' ? `/${R.slug.en}/` : `/${l}/${R.slug[l]}/`);
const aboutPath = l => (l === 'en' ? `/${A.slug.en}/` : `/${l}/${A.slug[l]}/`);
const BLOG_LANGS = ['en', 'fr', 'ar'];
const PROMO_ON = TODAY <= '2026-12-31'; // blog readers' code CARNET
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
  const links = [`<a href="${aboutPath(l)}">${escHTML(A[l].nav)}</a>`, `<a href="${reviewsPath(l)}">${escHTML(R[l].nav)}</a>`].concat(C.services.map(s => `<a href="${servicePath(s, l)}">${escHTML(s[l].nav)}</a>`))
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
    TERMS: legal(l).terms, PRIVACY: legal(l).privacy, BLOG_HREF: blogPath(BLOG_LANGS.includes(l) ? l : 'en'), REVIEWS_HREF: reviewsPath(l),
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
${l === 'ar' ? ARABIC_FONTS + '\n' : ''}<link rel="stylesheet" href="/css/shop.css?v=9">
<link rel="stylesheet" href="/css/landing.css?v=13">
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
      <a href="${aboutPath(l)}">${escHTML(ui.about)}</a>
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
    <p class="lp-kicker">Melissa Photography · Paris</p>
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
    <div><a href="${aboutPath(l)}">${escHTML(A[l].nav)}</a>${others.map(x => `<a href="${servicePath(x, l)}">${escHTML(x[l].nav)}</a>`).join('')}${BLOG_LANGS.includes(l) ? `<a href="${blogPath(l)}">${escHTML(B.ui[l].blog)}</a>` : ''}</div>
  </nav>
</main>

<footer class="shopfoot">
  <span>Melissa Photography · Paris</span>
  <a href="${reviewsPath(l)}">${escHTML(R[l].nav)}</a>
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
${l === 'ar' ? ARABIC_FONTS + '\n' : ''}<link rel="stylesheet" href="/css/shop.css?v=9">
<link rel="stylesheet" href="/css/landing.css?v=13">
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
      <a href="${aboutPath(l)}">${escHTML(ui.about)}</a>
      <a href="${home}#book">${escHTML(ui.bookNav)}</a>
    </nav>
    ${langSwitch(l, switchTo)}
  </div>
</header>
${body}
<footer class="shopfoot">
  <span>Melissa Photography · Paris</span>
  <a href="${reviewsPath(l)}">${escHTML(R[l].nav)}</a>
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
const fmtDate = (d, l) => new Date(d + 'T12:00').toLocaleDateString({ fr: 'fr-FR', ar: 'ar-u-nu-latn' }[l] || 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
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
  <g class="sk-mon sk-tower" transform="translate(${cx} 214) scale(.84)">
    <path d="M-50.0 0.0 Q-41.0 -16.0 -31.0 -58.0 L-15.0 -58.0 Q-26.0 -22.0 -31.0 0.0Z" fill="#1f3a4d" fill-opacity=".3" stroke="#1f3a4d" stroke-linejoin="round" stroke-linecap="round" stroke-width="2.4"/>
        <path d="M-50.0 0.0 L-29.8 -5.1 L-46.0 -8.4 L-27.0 -16.2 L-41.8 -19.4 L-23.6 -28.8 L-37.6 -32.9 L-19.6 -42.7 L-33.2 -49.0 L-15.0 -58.0" fill="none" stroke="#1f3a4d" stroke-linejoin="round" stroke-linecap="round" stroke-width="1"/>
        <path d="M-40.8 -22.5 L-24.5 -25.5" fill="none" stroke="#1f3a4d" stroke-linejoin="round" stroke-linecap="round" stroke-width="1.4"/>
        <path d="M31.0 0.0 Q26.0 -22.0 15.0 -58.0 L31.0 -58.0 Q41.0 -16.0 50.0 0.0Z" fill="#1f3a4d" fill-opacity=".3" stroke="#1f3a4d" stroke-linejoin="round" stroke-linecap="round" stroke-width="2.4"/>
        <path d="M50.0 0.0 L29.8 -5.1 L46.0 -8.4 L27.0 -16.2 L41.8 -19.4 L23.6 -28.8 L37.6 -32.9 L19.6 -42.7 L33.2 -49.0 L15.0 -58.0" fill="none" stroke="#1f3a4d" stroke-linejoin="round" stroke-linecap="round" stroke-width="1"/>
        <path d="M40.8 -22.5 L24.5 -25.5" fill="none" stroke="#1f3a4d" stroke-linejoin="round" stroke-linecap="round" stroke-width="1.4"/>
        <path d="M-31 0 C-27 -40 27 -40 31 0" fill="none" stroke="#1f3a4d" stroke-linejoin="round" stroke-linecap="round" stroke-width="3"/>
        <path d="M-28 -5 C-24 -35 24 -35 28 -5" fill="none" stroke="#1f3a4d" stroke-linejoin="round" stroke-linecap="round" stroke-width="1"/>
        <path d="M-25 -40 L25 -40 M-25 -46 L25 -46" fill="none" stroke="#1f3a4d" stroke-linejoin="round" stroke-linecap="round" stroke-width="1.2"/>
        <path d="M-24 -40 L-18 -46 M-18 -40 L-24 -46 M-18 -40 L-12 -46 M-12 -40 L-18 -46 M-12 -40 L-6 -46 M-6 -40 L-12 -46 M-6 -40 L0 -46 M0 -40 L-6 -46 M0 -40 L6 -46 M6 -40 L0 -46 M6 -40 L12 -46 M12 -40 L6 -46 M12 -40 L18 -46 M18 -40 L12 -46 M18 -40 L24 -46 M24 -40 L18 -46" fill="none" stroke="#1f3a4d" stroke-linejoin="round" stroke-linecap="round" stroke-width=".8"/>
        <path d="M-25 -46 L-17 -58 M25 -46 L17 -58 M-8 -46 L-5 -58 M8 -46 L5 -58" fill="none" stroke="#1f3a4d" stroke-linejoin="round" stroke-linecap="round" stroke-width="1"/>
        <rect x="-41" y="-68" width="82" height="10" rx="1.5" fill="#1f3a4d"/>
        <path d="M-39.0 -60 q2.6 -5 5.2 0 M-33.8 -60 q2.6 -5 5.2 0 M-28.6 -60 q2.6 -5 5.2 0 M-23.4 -60 q2.6 -5 5.2 0 M-18.2 -60 q2.6 -5 5.2 0 M-13.0 -60 q2.6 -5 5.2 0 M-7.8 -60 q2.6 -5 5.2 0 M-2.6 -60 q2.6 -5 5.2 0 M2.6 -60 q2.6 -5 5.2 0 M7.8 -60 q2.6 -5 5.2 0 M13.0 -60 q2.6 -5 5.2 0 M18.2 -60 q2.6 -5 5.2 0 M23.4 -60 q2.6 -5 5.2 0 M28.6 -60 q2.6 -5 5.2 0 M33.8 -60 q2.6 -5 5.2 0" fill="none" stroke="#fdf6ea" stroke-width="1" opacity=".75"/>
        <path d="M-41 -66 L41 -66" stroke="#2c4d63" stroke-width="1"/>
        <path d="M-31.0 -68.0 Q-25.5 -92.0 -17.0 -126.0 L17.0 -126.0 Q25.5 -92.0 31.0 -68.0Z" fill="#1f3a4d" fill-opacity=".3" stroke="#1f3a4d" stroke-linejoin="round" stroke-linecap="round" stroke-width="2.2"/>
        <path d="M-31.0 -68.0 L28.7 -78.0 M31.0 -68.0 L-28.7 -78.0 M-28.7 -78.0 L28.7 -78.0 M-28.7 -78.0 L26.1 -88.8 M28.7 -78.0 L-26.1 -88.8 M-26.1 -88.8 L26.1 -88.8 M-26.1 -88.8 L23.3 -100.4 M26.1 -88.8 L-23.3 -100.4 M-23.3 -100.4 L23.3 -100.4 M-23.3 -100.4 L20.3 -112.8 M23.3 -100.4 L-20.3 -112.8 M-20.3 -112.8 L20.3 -112.8 M-20.3 -112.8 L17.0 -126.0 M20.3 -112.8 L-17.0 -126.0 M-17.0 -126.0 L17.0 -126.0" fill="none" stroke="#1f3a4d" stroke-linejoin="round" stroke-linecap="round" stroke-width=".9"/>
        <path d="M-15 -68 C-12 -88 12 -88 15 -68" fill="none" stroke="#1f3a4d" stroke-linejoin="round" stroke-linecap="round" stroke-width="1.8"/>
        <rect x="-24" y="-134" width="48" height="8" rx="1.5" fill="#1f3a4d"/>
        <path d="M-22.0 -126.5 q2.2 -3.5 4.4 0 M-17.6 -126.5 q2.2 -3.5 4.4 0 M-13.2 -126.5 q2.2 -3.5 4.4 0 M-8.8 -126.5 q2.2 -3.5 4.4 0 M-4.4 -126.5 q2.2 -3.5 4.4 0 M0.0 -126.5 q2.2 -3.5 4.4 0 M4.4 -126.5 q2.2 -3.5 4.4 0 M8.8 -126.5 q2.2 -3.5 4.4 0 M13.2 -126.5 q2.2 -3.5 4.4 0 M17.6 -126.5 q2.2 -3.5 4.4 0" fill="none" stroke="#fdf6ea" stroke-width=".9" opacity=".7"/>
        <path d="M-15.0 -134.0 Q-10.5 -162.0 -4.0 -204.0 L4.0 -204.0 Q10.5 -162.0 15.0 -134.0Z" fill="#1f3a4d" fill-opacity=".3" stroke="#1f3a4d" stroke-linejoin="round" stroke-linecap="round" stroke-width="2"/>
        <path d="M-15.0 -134.0 L14.1 -139.7 M15.0 -134.0 L-14.1 -139.7 M-14.1 -139.7 L14.1 -139.7 M-14.1 -139.7 L13.1 -145.8 M14.1 -139.7 L-13.1 -145.8 M-13.1 -145.8 L13.1 -145.8 M-13.1 -145.8 L12.1 -152.1 M13.1 -145.8 L-12.1 -152.1 M-12.1 -152.1 L12.1 -152.1 M-12.1 -152.1 L11.1 -158.6 M12.1 -152.1 L-11.1 -158.6 M-11.1 -158.6 L11.1 -158.6 M-11.1 -158.6 L10.0 -165.5 M11.1 -158.6 L-10.0 -165.5 M-10.0 -165.5 L10.0 -165.5 M-10.0 -165.5 L8.9 -172.6 M10.0 -165.5 L-8.9 -172.6 M-8.9 -172.6 L8.9 -172.6 M-8.9 -172.6 L7.7 -180.1 M8.9 -172.6 L-7.7 -180.1 M-7.7 -180.1 L7.7 -180.1 M-7.7 -180.1 L6.5 -187.8 M7.7 -180.1 L-6.5 -187.8 M-6.5 -187.8 L6.5 -187.8 M-6.5 -187.8 L5.3 -195.7 M6.5 -187.8 L-5.3 -195.7 M-5.3 -195.7 L5.3 -195.7 M-5.3 -195.7 L4.0 -204.0 M5.3 -195.7 L-4.0 -204.0 M-4.0 -204.0 L4.0 -204.0" fill="none" stroke="#1f3a4d" stroke-linejoin="round" stroke-linecap="round" stroke-width=".75"/>
        <rect x="-11.4" y="-171.0" width="22.9" height="4" fill="#1f3a4d"/>
        <rect x="-6.5" y="-213" width="13" height="9" rx="1.2" fill="#1f3a4d"/>
        <rect x="-4" y="-219" width="8" height="6" fill="#1f3a4d"/>
        <path d="M-3 -219 L0 -226 L3 -219Z" fill="#1f3a4d"/>
        <path d="M0 -226 L0 -240" stroke="#1f3a4d" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M-2.4 -233 L2.4 -233" stroke="#1f3a4d" stroke-width="1.2" stroke-linecap="round"/>
    <g class="tw-sparks" fill="#fffaf1"><path class="tw-spark" style="animation-delay:0.00s" d="M-22 -36 Q-22 -30 -16 -30 Q-22 -30 -22 -24 Q-22 -30 -28 -30 Q-22 -30 -22 -36Z"/><path class="tw-spark" style="animation-delay:0.31s" d="M24 -28 Q24 -22 30 -22 Q24 -22 24 -16 Q24 -22 18 -22 Q24 -22 24 -28Z"/><path class="tw-spark" style="animation-delay:0.62s" d="M-14 -102 Q-14 -96 -8 -96 Q-14 -96 -14 -90 Q-14 -96 -20 -96 Q-14 -96 -14 -102Z"/><path class="tw-spark" style="animation-delay:0.93s" d="M15 -114 Q15 -108 21 -108 Q15 -108 15 -102 Q15 -108 9 -108 Q15 -108 15 -114Z"/><path class="tw-spark" style="animation-delay:1.24s" d="M-7 -156 Q-7 -150 -1 -150 Q-7 -150 -7 -144 Q-7 -150 -13 -150 Q-7 -150 -7 -156Z"/><path class="tw-spark" style="animation-delay:1.55s" d="M7 -186 Q7 -180 13 -180 Q7 -180 7 -174 Q7 -180 1 -180 Q7 -180 7 -186Z"/><path class="tw-spark" style="animation-delay:1.86s" d="M0 -228 Q0 -222 6 -222 Q0 -222 0 -216 Q0 -222 -6 -222 Q0 -222 0 -228Z"/><path class="tw-spark" style="animation-delay:2.17s" d="M-40 -14 Q-40 -8 -34 -8 Q-40 -8 -40 -2 Q-40 -8 -46 -8 Q-40 -8 -40 -14Z"/><path class="tw-spark" style="animation-delay:2.48s" d="M40 -16 Q40 -10 46 -10 Q40 -10 40 -4 Q40 -10 34 -10 Q40 -10 40 -16Z"/><path class="tw-spark" style="animation-delay:2.79s" d="M0 -118 Q0 -112 6 -112 Q0 -112 0 -106 Q0 -112 -6 -112 Q0 -112 0 -118Z"/></g>
  </g>
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

const avatarArt = (() => {
  const a = template.indexOf('<g id="avatar-art">');
  let depth = 0, i = a;
  const re = /<g\b|<\/g>/g; re.lastIndex = a;
  let m;
  while ((m = re.exec(template))) { depth += m[0] === '</g>' ? -1 : 1; if (depth === 0) { i = m.index + 4; break; } }
  return template.slice(a, i).replace('id="avatar-art"', '');
})();
// ---- helpers for the pro blog ----
const slugify = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9؀-ۿ]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'section';
function postText(t) {
  const parts = [t.title, t.short, ...(t.intro || [])];
  if (t.honest) parts.push(...t.honest.p);
  (t.sections || []).forEach(s => { parts.push(s.h2, ...(s.p || []), ...(s.list || [])); if (s.table) parts.push(...s.table.rows.flat()); });
  parts.push(...(t.tips || []));
  return parts.join(' ');
}
const readMinutes = (t, l) => Math.max(2, Math.round(postText(t).split(/\s+/).length / (l === 'ar' ? 180 : 220)));
const catLabel = (p, l) => (B.categories[p.category] || {})[l] || '';
const postLangs = p => BLOG_LANGS.filter(l => p[l]);

function postCard(p, l, i, big) {
  const u = B.ui[l], t = p[l];
  return `<article class="post-card${big ? ' post-card-big' : ''}" data-cat="${p.category}">
      <a href="${postPath(p, l)}">
        <span class="post-cover"><img src="${p.cover}" alt="" loading="${i < 2 ? 'eager' : 'lazy'}" width="667" height="1000"></span>
        <span class="post-card-text">
          <span class="post-meta"><span class="cat-chip">${escHTML(catLabel(p, l))}</span> <time datetime="${p.date}">${escHTML(fmtDate(p.date, l))}</time> · ${escHTML(u.minRead(readMinutes(t, l)))}</span>
          <h2>${escHTML(t.title)}</h2>
          <p>${escHTML(t.short)}</p>
          <span class="post-read">${escHTML(u.read)} →</span>
        </span>
      </a>
    </article>`;
}

function buildBlogIndex(l) {
  const u = B.ui[l], ui = C.ui[l], here = blogPath(l);
  const posts = B.posts.filter(p => p[l]);
  const cats = [...new Set(posts.map(p => p.category))];
  const days = d => (new Date(TODAY) - new Date(d)) / 864e5;
  const row = (p, i) => {
    const t = p[l], url = postPath(p, l);
    const secs = (t.sections || []).map((s, k) => ({ h: String(s.h2).replace(/^\d+\.\s*/, ''), id: `${k + 1}-${slugify(s.h2)}` }));
    const shown = secs.slice(0, 4);
    return `    <li class="bl-row reveal" data-cat="${p.category}">
      <a class="bl-img" href="${url}" tabindex="-1" aria-hidden="true"><img src="${p.cover}" alt="" loading="${i < 2 ? 'eager' : 'lazy'}" width="667" height="1000">${days(p.date) <= 21 ? `<span class="bl-new">${escHTML(u.isNew)}</span>` : ''}</a>
      <div class="bl-body">
        <p class="post-meta"><span class="cat-chip">${escHTML(catLabel(p, l))}</span> <time datetime="${p.date}">${escHTML(fmtDate(p.date, l))}</time> · ${escHTML(u.minRead(readMinutes(t, l)))}</p>
        <h2><a href="${url}">${escHTML(t.title)}</a></h2>
        <p class="bl-short">${escHTML(t.short)}</p>
        ${shown.length ? `<div class="bl-toc"><b>${escHTML(u.toc)}</b><ol>${shown.map(x => `<li><a href="${url}#${x.id}">${escHTML(x.h)}</a></li>`).join('')}</ol>${secs.length > shown.length ? `<span class="bl-more">${escHTML(u.moreParts(secs.length - shown.length))}</span>` : ''}</div>` : ''}
        <a class="btn orange bl-btn" href="${url}">${escHTML(u.readArticle)} <span aria-hidden="true">${l === 'ar' ? '←' : '→'}</span></a>
      </div>
    </li>`;
  };
  const chip = (c, label, n, on) => `<button type="button" data-cat="${c}" aria-pressed="${on}">${escHTML(label)} <span>${n}</span></button>`;
  const body = `<main class="lp-main blog-index">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="${homePath(l)}">${escHTML(ui.home)}</a> <span aria-hidden="true">›</span> <span>${escHTML(u.blog)}</span></nav>
  <header class="lp-hero bl-hero">
    <p class="lp-kicker">Melissa Photography · Paris</p>
    <h1>${escHTML(u.blogTitle)}</h1>
    <p class="lede">${escHTML(u.blogLede)}</p>
  </header>
  <div class="bl-filter" role="group" aria-label="${escAttr(u.blog)}">
    ${chip('all', u.all, posts.length, true)}${cats.map(c => chip(c, (B.categories[c] || {})[l] || c, posts.filter(p => p.category === c).length, false)).join('')}
  </div>
  <ol class="bl-list">
${posts.map(row).join('\n')}
  </ol>
  <section class="post-cta bl-ask reveal">
    <h2>${escHTML(u.askTitle)}</h2>
    <p>${escHTML(u.askText)}</p>
    <div class="lp-cta">
      <a class="btn orange" href="https://ig.me/m/melissa_photography_paris" target="_blank" rel="noopener">${escHTML(u.askBtn)}</a>
      <a class="btn" href="${homePath(l)}?go=book">${escHTML(C.ui[l].bookNav)}</a>
    </div>
  </section>
</main>
${REVEAL}
<script>
  (function () {
    var btns = document.querySelectorAll('.bl-filter button');
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        document.querySelectorAll('.bl-row').forEach(function (c) {
          c.hidden = b.dataset.cat !== 'all' && c.dataset.cat !== b.dataset.cat;
        });
      });
    });
  })();
</script>`;
  write(here + 'index.html', shell({
    l, title: `${u.blogTitle} · Melissa Photography Paris`, desc: u.blogLede, here, alt: blogAlternates(blogPath),
    ogImage: posts[0] ? posts[0].cover : '/images/shop/proposal-22.webp', body, switchTo: x => (BLOG_LANGS.includes(x) ? blogPath(x) : homePath(x)),
    jsonld: [{ '@context': 'https://schema.org', '@type': 'Blog', name: u.blogTitle, url: SITE + here, inLanguage: l,
      blogPost: posts.map(p => ({ '@type': 'BlogPosting', headline: p[l].title, url: SITE + postPath(p, l), datePublished: p.date, dateModified: p.updated || p.date })) }],
  }));
}

function buildPost(p, l) {
  const u = B.ui[l], ui = C.ui[l], t = p[l], here = postPath(p, l), home = homePath(l);
  const svc = C.services.find(s => s.key === p.service);
  const minutes = readMinutes(t, l);
  const sections = (t.sections || []).map((s, i) => ({ ...s, id: `${i + 1}-${slugify(s.h2)}` }));
  let k = 0;
  const heroLabel = { fr: "Illustration animée : le pont de Bir-Hakeim, un métro qui passe, la tour Eiffel qui scintille et une demande en mariage", ar: 'رسم متحرّك: جسر بير حكيم، مترو يمرّ، برج إيفل يتلألأ وطلب زواج' }[l] || 'Animated illustration: Bir-Hakeim bridge, a metro passing, the Eiffel Tower sparkling and a proposal';
  const related = B.posts.filter(x => x !== p && x[l]).sort((a, b) => (b.category === p.category) - (a.category === p.category)).slice(0, 3);
  const shareUrl = encodeURIComponent(SITE + here), shareText = encodeURIComponent(t.title);
  const sectionHTML = s => `      <section class="post-spot reveal" id="${s.id}">
        <h2>${escHTML(s.h2)}</h2>
        ${s.kicker ? `<p class="spot-kicker"><span>${escHTML(u.practical)}</span> ${escHTML(s.kicker)}</p>` : ''}
        ${s.place ? `<p class="spot-addr"><span class="addr" dir="ltr" lang="fr">${escHTML(s.place.addr)}</span><a class="map-btn" href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(s.place.q)}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" fill="currentColor"/></svg>${escHTML(u.mapBtn)}</a></p>` : ''}
        ${s.photo ? print(s.photo, [-2, 1.8, -1.2, 2.2][k++ % 4], k === 1) : ''}
${(s.p || []).map(x => `        <p>${escHTML(x)}</p>`).join('\n')}
${s.list ? `        <ul class="post-list-items">\n${s.list.map(x => `          <li>${escHTML(x)}</li>`).join('\n')}\n        </ul>` : ''}
${s.table ? `        <div class="post-table-wrap"><table class="post-table">
          <thead><tr>${s.table.head.map(h => `<th scope="col">${escHTML(h)}</th>`).join('')}</tr></thead>
          <tbody>
${s.table.rows.map(r => `            <tr>${r.map((c, ci) => ci === 0 ? `<th scope="row">${escHTML(c)}</th>` : `<td>${escHTML(c)}</td>`).join('')}</tr>`).join('\n')}
          </tbody>
        </table></div>${s.table.note ? `\n        <p class="table-note">${escHTML(s.table.note)}</p>` : ''}` : ''}
${(s.after || []).map(x => `        <p>${escHTML(x)}</p>`).join('\n')}
      </section>`;
  const body = `<main class="lp-main post">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="${home}">${escHTML(ui.home)}</a> <span aria-hidden="true">›</span> <a href="${blogPath(l)}">${escHTML(u.blog)}</a> <span aria-hidden="true">›</span> <span>${escHTML(t.title.split(/[:?]/)[0].trim())}</span></nav>
  <article>
    <header class="lp-hero post-hero">
      <p class="lp-kicker"><span class="cat-chip">${escHTML(catLabel(p, l))}</span> · <time datetime="${p.date}">${escHTML(fmtDate(p.date, l))}</time> · ${escHTML(u.minRead(minutes))}</p>
      <h1>${escHTML(t.title)}</h1>
      ${p.hero === 'bir-hakeim' ? heroBirHakeim(heroLabel) : `<figure class="post-cover-hero">${print([p.cover, '', ''], -1.5, true)}</figure>`}
      <p class="lede">${escHTML(t.short)}</p>
      <p class="post-by">${escHTML(u.by)}${p.updated && p.updated !== p.date ? ` · ${escHTML(u.updatedOn)} ${escHTML(fmtDate(p.updated, l))}` : ''}</p>
    </header>
    <div class="post-body">
${sections.length > 2 ? `      <nav class="post-toc" aria-label="${escAttr(u.toc)}">
        <p>${escHTML(u.toc)}</p>
        <ol>
${sections.map(s => `          <li><a href="#${s.id}">${escHTML(s.h2.replace(/^\d+\.\s*/, ''))}</a></li>`).join('\n')}
        </ol>
      </nav>` : ''}
${(t.intro || []).map(x => `      <p class="reveal">${escHTML(x)}</p>`).join('\n')}
${t.honest ? `      <aside class="honest reveal">
        <span class="honest-tape" aria-hidden="true"></span>
        <h2>${escHTML(t.honest.title)}</h2>
${t.honest.p.map(x => `        <p>${escHTML(x)}</p>`).join('\n')}
        <p class="honest-sign">${escHTML(t.honest.sign)}</p>
      </aside>` : ''}
${sections.map(sectionHTML).join('\n')}
${t.tips && t.tips.length ? `      <aside class="lp-card post-tips reveal">
        <h2>${escHTML(u.tipsTitle)}</h2>
        <ul>
${t.tips.map(x => `          <li>${escHTML(x)}</li>`).join('\n')}
        </ul>
      </aside>` : ''}
      ${t.ending && t.ending.photo ? `<div class="post-ending reveal">${print(t.ending.photo, -1.5, false)}</div>` : ''}
${t.sources && t.sources.length ? `      <aside class="post-sources reveal">
        <h2>${escHTML(u.sources)}</h2>
        <ul>
${t.sources.map(([name, url]) => `          <li><a href="${escAttr(url)}" target="_blank" rel="noopener nofollow">${escHTML(name)}</a></li>`).join('\n')}
        </ul>
      </aside>` : ''}
      <div class="post-share reveal">
        <span>${escHTML(u.share)}</span>
        <a href="https://wa.me/?text=${shareText}%20${shareUrl}" target="_blank" rel="noopener">WhatsApp</a>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank" rel="noopener">Facebook</a>
        <a href="https://pinterest.com/pin/create/button/?url=${shareUrl}&amp;media=${encodeURIComponent(SITE + p.cover)}&amp;description=${shareText}" target="_blank" rel="noopener">Pinterest</a>
      </div>
      <aside class="author-box reveal">
        <div class="about-avatar small"><svg viewBox="0 0 300 360" aria-hidden="true">${avatarArt}</svg></div>
        <div>
          <h2>${escHTML(u.authorTitle)}</h2>
          <p>${escHTML(u.authorBio)}</p>
          <a href="${aboutPath(l)}">${escHTML(u.authorLink)} →</a>
        </div>
      </aside>
    </div>
  </article>
  <section class="lp-final post-cta reveal">
    <h2>${escHTML(u.ctaTitle)}</h2>
    <p>${escHTML(u.ctaText)}</p>
    ${PROMO_ON ? `<p class="promo-note">${escHTML(u.promo)}</p>` : ''}
    <div class="lp-cta">
      <a class="btn orange" href="${home}?go=book&amp;session=${p.session}${PROMO_ON ? '&amp;promo=CARNET' : ''}">${escHTML(u.ctaBtn)}</a>
      ${svc ? `<a class="btn" href="${servicePath(svc, l)}">${escHTML(u.ctaMore)}</a>` : ''}
    </div>
  </section>
${related.length ? `  <section class="post-related reveal">
    <h2>${escHTML(u.related)}</h2>
    <div class="post-grid">
${related.map((x, i) => '      ' + postCard(x, l, 3, false)).join('\n')}
    </div>
  </section>` : ''}
  <p class="post-back"><a href="${blogPath(l)}">← ${escHTML(u.back)}</a></p>
</main>
${REVEAL}`;
  write(here + 'index.html', shell({
    l, title: `${t.title} · Melissa Photography Paris`, desc: t.desc, here,
    alt: postLangs(p).map(x => `<link rel="alternate" hreflang="${x}" href="${SITE}${postPath(p, x)}">`).join('\n') + `\n<link rel="alternate" hreflang="x-default" href="${SITE}${postPath(p, p.en ? 'en' : postLangs(p)[0])}">`,
    ogImage: p.cover, body, switchTo: x => (BLOG_LANGS.includes(x) && p[x] ? postPath(p, x) : blogPath(BLOG_LANGS.includes(x) ? x : 'en')),
    jsonld: [
      { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: t.title, description: t.desc, image: SITE + p.cover,
        datePublished: p.date, dateModified: p.updated || p.date, inLanguage: l, mainEntityOfPage: SITE + here,
        articleSection: catLabel(p, l), wordCount: postText(t).split(/\s+/).length, timeRequired: `PT${minutes}M`,
        author: { '@type': 'Person', name: 'Melissa', url: SITE + aboutPath(l) },
        publisher: { '@type': 'Organization', name: 'Melissa Photography Paris', url: SITE + '/' } },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: ui.home, item: SITE + home },
        { '@type': 'ListItem', position: 2, name: u.blog, item: SITE + blogPath(l) },
        { '@type': 'ListItem', position: 3, name: t.title, item: SITE + here },
      ] },
    ],
  }));
}

/* ---------- about page ---------- */

function buildAbout(l) {
  const t = A[l], ui = C.ui[l], home = homePath(l), here = aboutPath(l);
  const body = `<main class="lp-main about">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="${home}">${escHTML(ui.home)}</a> <span aria-hidden="true">›</span> <span>${escHTML(t.nav)}</span></nav>
  <header class="lp-hero about-hero">
    <div class="about-avatar"><svg viewBox="0 0 300 360" role="img" aria-label="Melissa">${avatarArt}</svg></div>
    <div>
      <p class="lp-kicker">Melissa Photography · Paris</p>
      <h1>${escHTML(t.h1)}</h1>
      <p class="lede">${escHTML(t.lede)}</p>
    </div>
  </header>
  <section class="lp-card about-facts reveal">
    <h2>${escHTML(t.factsTitle)}</h2>
    <dl>
${t.facts.map(([k, v]) => `      <div><dt>${escHTML(k)}</dt><dd>${escHTML(v)}</dd></div>`).join('\n')}
    </dl>
  </section>
  <section class="lp-story reveal">
    <h2 class="about-h2">${escHTML(t.storyTitle)}</h2>
${t.story.map(x => `    <p>${escHTML(x)}</p>`).join('\n')}
  </section>
  <section class="about-steps reveal">
    <h2 class="about-h2">${escHTML(t.stepsTitle)}</h2>
    <ol>
${t.steps.map(([h, x]) => `      <li><b>${escHTML(h)}</b><span>${escHTML(x)}</span></li>`).join('\n')}
    </ol>
  </section>
  <section class="lp-faq reveal">
    <h2 class="about-h2">${escHTML(ui.faq)}</h2>
${t.faq.map(([q, a]) => `    <details><summary>${escHTML(q)}</summary><p>${escHTML(a)}</p></details>`).join('\n')}
  </section>
  <section class="lp-final post-cta reveal">
    <h2>${escHTML(t.ctaTitle)}</h2>
    <div class="lp-cta">
      <a class="btn orange" href="${home}?go=book">${escHTML(t.ctaBtn)}</a>
      <a class="btn" href="${blogPath(l)}">${escHTML(t.ctaMore)}</a>
    </div>
  </section>
  <nav class="lp-more" aria-label="${escAttr(ui.more)}">
    <div>${C.services.map(x => `<a href="${servicePath(x, l)}">${escHTML(x[l].nav)}</a>`).join('')}</div>
  </nav>
</main>
${REVEAL}`;
  write(here + 'index.html', shell({
    l, title: t.title, desc: t.desc, here, alt: alternates(aboutPath), ogImage: '/images/shop/proposal-22.webp', body,
    switchTo: aboutPath,
    jsonld: [
      { '@context': 'https://schema.org', '@type': 'AboutPage', url: SITE + here, name: t.title, inLanguage: l,
        mainEntity: { '@type': 'Person', name: 'Melissa', jobTitle: l === 'fr' ? 'Photographe' : l === 'ar' ? 'مصوّرة' : 'Photographer',
          knowsLanguage: ['fr', 'en', 'ar'], homeLocation: { '@type': 'City', name: 'Paris' },
          worksFor: { '@type': 'ProfessionalService', name: 'Melissa Photography Paris', url: SITE + '/' },
          sameAs: ['https://www.instagram.com/melissa_photography_paris', 'https://www.tiktok.com/@thegirlwith0tattoo'] } },
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: t.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    ],
  }));
}

/* ---------- reviews page: real client words, never invented ---------- */
function buildReviews(l) {
  const t = R[l], ui = C.ui[l], home = homePath(l), here = reviewsPath(l);
  const stars = '<span class="rv-stars" aria-hidden="true">★★★★★</span>';
  const ext = (href, label, cls) => `<a class="btn${cls ? ' ' + cls : ''}" href="${escAttr(href)}" target="_blank" rel="noopener">${escHTML(label)}</a>`;
  const tilts = [-1.4, 1.1, -0.7, 1.6, -1.1, 0.8, -0.4];
  const notes = R.reviews.map((r, i) => {
    const tag = r.service && R.tags[r.service] ? `<span class="rv-tag">${escHTML(R.tags[r.service][l])}</span>` : '';
    const src = `<span class="rv-src rv-src-${r.source}">${escHTML(R.sources[r.source][l])}</span>`;
    const dir = r.lang === 'ar' ? ' dir="rtl"' : (l === 'ar' ? ' dir="ltr"' : '');
    const when = r.date ? `<time datetime="${r.date}">${escHTML(new Date(r.date + '-15T12:00').toLocaleDateString({ fr: 'fr-FR', ar: 'ar-u-nu-latn' }[l] || 'en-GB', { month: 'long', year: 'numeric' }))}</time>` : '';
    const more = r.more ? `… <a class="rv-more" href="${escAttr(R.links.google)}" target="_blank" rel="noopener" lang="${l}">${escHTML(t.moreLink)}</a>` : '';
    const reply = r.reply ? `\n        <p class="rv-reply"><span>${escHTML(t.replyLabel)}</span> <q lang="${r.lang}"${dir}>${escHTML(r.reply)}</q></p>` : '';
    return `      <figure class="rv-note reveal" data-src="${r.source}" style="--tilt:${tilts[i % tilts.length]}deg">
        <div class="rv-top">${stars}${when}</div>
        <blockquote lang="${r.lang}"${dir}><p>${escHTML(r.text)}${more}</p></blockquote>
        <figcaption><b>${escHTML(r.name)}</b>${tag}${src}</figcaption>${reply}
      </figure>`;
  }).join('\n');
  const score = l === 'fr' ? R.airbnb.score.replace('.', ',') : R.airbnb.score;
  const body = `<main class="lp-main reviews">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="${home}">${escHTML(ui.home)}</a> <span aria-hidden="true">›</span> <span>${escHTML(t.nav)}</span></nav>
  <header class="lp-hero">
    <p class="lp-kicker">${escHTML(t.kicker)}</p>
    <h1>${escHTML(t.h1)}</h1>
    <p class="lede">${escHTML(t.lede)}</p>
  </header>
  <section class="rv-platforms">
    <div class="lp-card rv-platform rv-airbnb reveal">
      <h2>${escHTML(t.airbnbTitle)}</h2>
      <p class="rv-score"><b>${score}</b>${stars}</p>
      <p>${escHTML(t.airbnbLine(R.airbnb.count))}</p>
      ${R.links.airbnb ? ext(R.links.airbnb, t.airbnbBtn) : ''}
    </div>
    <div class="lp-card rv-platform rv-google reveal">
      <h2>${escHTML(t.googleTitle)}</h2>
      <p class="rv-score"><b>${l === 'fr' ? R.google.score.replace('.', ',') : R.google.score}</b>${stars}</p>
      <p>${escHTML(t.googleLine)}</p>
      ${ext(R.links.google, t.googleBtn, 'orange')}
    </div>
  </section>
  <section class="rv-wall-wrap">
    <h2 class="about-h2">${escHTML(t.wallTitle)}</h2>
    <p class="rv-orig">${escHTML(t.origNote)}</p>
    <div class="rv-filters" role="group" aria-label="${escAttr(t.wallTitle)}" hidden>
      ${['all', 'google', 'airbnb', 'client'].map(k => { const n = k === 'all' ? R.reviews.length : R.reviews.filter(r => r.source === k).length; return n ? `<button type="button" data-f="${k}"${k === 'all' ? ' aria-pressed="true"' : ' aria-pressed="false"'}>${escHTML(t.filters[k])} <span>${n}</span></button>` : ''; }).join('')}
    </div>
    <div class="rv-wall">
${notes}
    </div>
  </section>
  <section class="post-cta rv-leave reveal">
    <h2>${escHTML(t.leaveTitle)}</h2>
    <p>${escHTML(t.leaveText)}</p>
    <div class="lp-cta">${ext(R.links.google, t.leaveBtn, 'orange')}</div>
    <p class="rv-small">${escHTML(t.leaveAirbnb)}</p>
  </section>
  <section class="lp-final reveal">
    <h2>${escHTML(t.ctaTitle)}</h2>
    <div class="lp-cta">
      <a class="btn orange" href="${home}?go=book">${escHTML(t.ctaBtn)}</a>
      <a class="btn" href="${home}#catalogue">${escHTML(t.ctaMore)}</a>
    </div>
  </section>
  <nav class="lp-more" aria-label="${escAttr(ui.more)}">
    <div><a href="${aboutPath(l)}">${escHTML(A[l].nav)}</a>${C.services.map(x => `<a href="${servicePath(x, l)}">${escHTML(x[l].nav)}</a>`).join('')}<a href="${blogPath(l)}">${escHTML(B.ui[l].blog)}</a></div>
  </nav>
</main>
${REVEAL}
<script>
(function () {
  var box = document.querySelector('.rv-filters'); if (!box) return;
  box.hidden = false;
  box.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var f = b.getAttribute('data-f');
    box.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    document.querySelectorAll('.rv-note').forEach(function (n) { n.hidden = f !== 'all' && n.getAttribute('data-src') !== f; });
  });
})();
</script>`;
  write(here + 'index.html', shell({
    l, title: t.title, desc: t.desc, here, alt: alternates(reviewsPath), ogImage: '/images/shop/proposal-16.webp', body,
    switchTo: reviewsPath,
    jsonld: [
      { '@context': 'https://schema.org', '@type': 'WebPage', url: SITE + here, name: t.title, description: t.desc, inLanguage: l,
        about: { '@type': 'ProfessionalService', name: 'Melissa Photography Paris', url: SITE + '/', sameAs: [R.links.google, 'https://www.instagram.com/melissa_photography_paris'] } },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: ui.home, item: SITE + home },
        { '@type': 'ListItem', position: 2, name: t.nav, item: SITE + here } ] },
    ],
  }));
}

/* ---------- llms.txt: a plain summary for AI assistants ---------- */
function llms() {
  const svc = C.services.map(s => `- [${s.en.nav}](${SITE}${servicePath(s, 'en')}): ${s.en.desc}`).join('\n');
  const posts = B.posts.map(p => `- [${p.en.title}](${SITE}${postPath(p, 'en')}): ${p.en.desc}`).join('\n');
  write('/llms.txt', `# Melissa Photography Paris

> Melissa is an independent photographer based in Paris, France, specialising in marriage proposals, weddings and couple sessions. She also photographs concerts, events and combat sports. She speaks French, English and Arabic, delivers proposal photos within 24 hours in a private online gallery, and is rated 5.0 on Airbnb (12 reviews) and 5.0 on Google.

## Key facts
- Area: Paris and Île-de-France
- Languages: French, English, Arabic
- Prices (photography only): express proposal 30 min €150 (10 photos) or €200 (20+ photos) delivered within 24 hours, proposal 1 hour from €290, proposal with decoration from €690, portrait session from €150, couple session from €250, town hall wedding from €250 for 2 hours (up to €400), wedding half day €500, wedding full day €750, concert or event from €300, sport from €100
- Favourite proposal spots: Bir-Hakeim bridge, Allée des Cygnes, Avenue de Camoëns, Square du Vert-Galant, Palais-Royal
- Booking: ${SITE}/?go=book (replies within 24 hours)
- Instagram: https://www.instagram.com/melissa_photography_paris

## Pages
- [About Melissa](${SITE}${aboutPath('en')})
- [Client reviews](${SITE}${reviewsPath('en')}): what clients wrote after their session; Google profile: ${R.links.google}
${svc}

## Guides
${posts}

## Other languages
- French: ${SITE}/fr/
- Arabic: ${SITE}/ar/
`);
}

/* ---------- 4. sitemap ---------- */
function sitemap() {
  const groups = [homePath, aboutPath, reviewsPath, ...C.services.map(s => l => servicePath(s, l))];
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
LANGS.forEach(buildAbout);
LANGS.forEach(buildReviews);
llms();
BLOG_LANGS.forEach(buildBlogIndex);
B.posts.forEach(p => postLangs(p).forEach(l => buildPost(p, l)));
sitemap();
