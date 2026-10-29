/* Melissa's Photography Paris - the photo shop.
 *
 * One page, several "screens": storefront -> welcome -> two doors ->
 * catalogue / album / about me / order envelope.
 *
 * - Text is written in English in index.html and translated by
 *   js/shop-i18n.js (FR / EN / AR, Arabic right-to-left).
 * - Albums start with hand-picked photos (images/shop/) and add any photo
 *   uploaded from the admin page (Supabase "photos" table).
 * - The order envelope emails Melissa through Formspree and also saves the
 *   order in Supabase ("orders" table) once that table exists.
 */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const I18N = window.SHOP_I18N;
  const SB = window.SUPABASE_CONFIG || (typeof SUPABASE_CONFIG !== 'undefined' ? SUPABASE_CONFIG : null);
  const FORMSPREE = 'https://formspree.io/f/manjpdzw';

  /* ---------- Language ---------- */
  let lang = document.documentElement.lang || 'en';
  const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => (vars && k in vars ? vars[k] : `{${k}}`));
  function t(en, vars) {
    const e = I18N.dict[en];
    const s = lang !== 'en' && e && e[lang] ? e[lang] : en;
    return vars ? fill(s, vars) : s;
  }
  function money(n) {
    if (lang === 'fr') return n.toLocaleString('fr-FR').replace(/ | /g, ' ') + ' €';
    if (lang === 'ar') return n.toLocaleString('en-US') + ' €';
    return '€' + n.toLocaleString('en-US');
  }
  const fromPrice = n => t('from {price}', { price: money(n) });

  // Remember the English text of every text node / attribute once, then translate from it.
  const ATTRS = ['aria-label', 'placeholder', 'alt', 'title'];
  const textNodes = [];
  const attrNodes = [];
  function collect(root) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        if (!n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const p = n.parentElement;
        if (!p || p.closest('script, style, noscript, [data-no-i18n], [data-dyn]')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    let n;
    while ((n = w.nextNode())) {
      const raw = n.nodeValue, key = raw.trim();
      if (I18N.dict[key]) textNodes.push({ n, key, lead: raw.match(/^\s*/)[0], trail: raw.match(/\s*$/)[0] });
    }
    root.querySelectorAll('*').forEach(el => {
      if (el.closest('[data-dyn]')) return;
      ATTRS.forEach(a => {
        const v = el.getAttribute(a);
        if (v && I18N.dict[v]) attrNodes.push({ el, a, key: v });
      });
    });
  }
  function translateStatic() {
    textNodes.forEach(({ n, key, lead, trail }) => { n.nodeValue = lead + t(key) + trail; });
    attrNodes.forEach(({ el, a, key }) => el.setAttribute(a, t(key)));
    document.querySelectorAll('[data-from]').forEach(el => { el.textContent = fromPrice(+el.dataset.from); });
    document.querySelectorAll('[data-href-fr]').forEach(el => {
      if (!el.dataset.hrefEn) el.dataset.hrefEn = el.getAttribute('href');
      el.setAttribute('href', lang === 'fr' ? el.dataset.hrefFr : el.dataset.hrefEn);
    });
    const m = I18N.meta[lang];
    document.title = m.title;
    const d = document.querySelector('meta[name="description"]');
    if (d) d.setAttribute('content', m.description);
  }
  let arabicFontsLoaded = false;
  function loadArabicFonts() {
    if (arabicFontsLoaded) return;
    arabicFontsLoaded = true;
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Lalezar&family=Tajawal:wght@400;500;700;800&family=Aref+Ruqaa:wght@400;700&display=swap';
    document.head.appendChild(l);
  }
  function setLang(l, opts = {}) {
    if (!I18N.langs.includes(l)) l = 'en';
    lang = l;
    document.documentElement.lang = l;
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    if (l === 'ar') loadArabicFonts();
    try { localStorage.setItem('shop-lang', l); } catch (e) { /* private mode */ }
    document.querySelectorAll('.lang-switch [data-lang]').forEach(b => { if (b.dataset.lang === l) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    translateStatic();
    renderShelves();
    renderSessions();
    const orderLang = document.getElementById('o-' + l);
    if (orderLang && !opts.keepOrderLang) orderLang.checked = true;
    if (current === 'album') { setAlbumTitle(); buildAlbum(albumKey, true); }
    else updateCounter();
  }
  // Each language has its own address (/, /fr/, /ar/). Remember the choice and keep the current screen.
  document.addEventListener('click', e => {
    const a = e.target.closest('.lang-switch a[data-lang]');
    if (!a) return;
    try { localStorage.setItem('shop-lang', a.dataset.lang); } catch (err) { /* private mode */ }
    if (location.hash) { e.preventDefault(); location.href = a.getAttribute('href') + location.hash; }
  });

  /* ---------- Content ---------- */
  const S = '/images/shop/';
  const ALBUMS = {
    // each inner array is one album page: one or two photos [file, caption, orientation p|l]
    proposals: {
      title: 'Proposals', category: 'proposal', color: '#e58aa2', ink: '#1f3a4d', from: 150, cover: S + 'proposal-16.webp',
      note: 'Hidden in the crowd, waiting for the knee to drop.',
      pages: [
        [[S + 'proposal-16.webp', 'Trocadéro, after dark', 'p'], [S + 'proposal-13.webp', 'Candles & a yes', 'p']],
        [[S + 'proposal-proposal2.webp', 'Sunset at the Troca', 'p'], [S + 'proposal-22.webp', 'When the tower sparkles', 'p']],
        [[S + 'proposal-2.webp', 'Louvre arcades', 'p'], [S + 'proposal-7.webp', 'Off as fiancés', 'p']],
      ],
    },
    weddings: {
      title: 'Weddings', category: 'wedding', color: '#fdf6ea', ink: '#1f3a4d', from: 250, cover: S + 'wedding-016.webp',
      note: 'The whole day, from the first look to the last dance.',
      pages: [
        [[S + 'wedding-016.webp', 'At the château gates', 'p'], [S + 'wedding-013.webp', 'Showing off the rings', 'p']],
        [[S + 'wedding-09.webp', 'Just married!', 'p'], [S + 'wedding-03.webp', 'A walk in the woods', 'p']],
        [[S + 'wedding-2.webp', 'Paris, pink sky', 'p']],
        [[S + 'wedding-019.webp', 'Hand in hand', 'l'], [S + 'wedding-00.webp', 'Lace and a ring', 'l']],
      ],
    },
    portraits: {
      title: 'Portraits', category: 'portrait', color: '#5e9fb4', from: 150, cover: S + 'portrait-2p.webp',
      note: 'Just you, good light, and a city that loves the camera.',
      pages: [
        [[S + 'portrait-2p.webp', 'Golden light', 'p']],
        [[S + 'portrait-5p.webp', 'Evening in the city', 'l'], [S + 'portrait-6p.webp', "The sky's the limit", 'l']],
        [[S + 'proposal-proposal3.webp', 'Couples count too', 'p']],
      ],
    },
    concerts: {
      title: 'Concerts', category: 'event', color: '#e2b445', ink: '#1f3a4d', from: 300, cover: S + 'live-fever333-red.webp', shelf: 'night',
      note: 'Front row, no flash, all feeling.',
      // replaced by the live list from the admin page when it loads
      pages: [
        [[S + 'live-fever333.webp', 'Fever 333, Lollapalooza Paris 2023', 'p'], [S + 'live-guitar.webp', 'Fever 333, Lollapalooza', 'p']],
        [[S + 'live-fever333-red.webp', 'Fever 333, red hot', 'p']],
        [[S + 'live-celia.webp', 'Celia Maqam', 'l'], [S + 'live-maqam.webp', 'Celia Maqam, the band', 'l']],
        [[S + 'live-owen.webp', 'Owen, Lollapalooza Paris 2023', 'p'], [S + 'live-kader.webp', 'Kader', 'p']],
        [[S + 'live-chemsou.webp', 'Chemsou Freeklane', 'l']],
      ],
    },
    sport: {
      title: 'Sport', category: 'sport', color: '#1f3a4d', from: 100, cover: S + 'sport-12b.webp', shelf: 'night',
      note: 'Combat sports, mat-side, catching every grip.',
      pages: [
        [[S + 'sport-10.webp', 'Game face', 'l'], [S + 'sport-5.webp', 'On the mat', 'l']],
        [[S + 'sport-12b.webp', 'Between rounds', 'p']],
        [[S + 'sport-13.webp', 'After the fight', 'l']],
      ],
    },
  };

  // grouped so the order envelope reads like a menu: category first, then the package
  const SESSION_GROUPS = [
    { id: 'g-prop', label: 'Marriage proposal' },
    { id: 'g-portrait', label: 'Portrait & couple' },
    { id: 'g-wed', label: 'Wedding' },
    { id: 'g-event', label: 'Event & sport' },
  ];
  const SESSIONS = [
    { id: 's-prop-x10', group: 'g-prop', name: 'Express proposal', info: '30 min · 10 photos · 24h delivery', price: 150, album: null },
    { id: 's-prop-x20', group: 'g-prop', name: 'Express proposal, 20+ photos', info: '30 min · 20+ photos · 24h delivery', price: 200, album: null },
    { id: 's-prop', group: 'g-prop', name: 'Proposal', info: '1h · 20+ photos · 24h delivery', price: 290, from: true, album: 'proposals' },
    { id: 's-propdeco', group: 'g-prop', name: 'Proposal + decoration', info: '2h · lights, candles, carpet', price: 690, from: true, album: null },
    { id: 's-portrait', group: 'g-portrait', name: 'Portrait session', info: 'Solo portrait', price: 150, from: true, album: null },
    { id: 's-couple', group: 'g-portrait', name: 'Couple session', info: '1h30 · 25+ photos', price: 250, from: true, album: 'portraits' },
    { id: 's-wed-hall', group: 'g-wed', name: 'Town hall wedding', info: 'From 2h · up to €400', price: 250, from: true, album: null },
    { id: 's-wed-half', group: 'g-wed', name: 'Wedding, half day', info: '6h · 120+ photos', price: 500, album: null },
    { id: 's-wed', group: 'g-wed', name: 'Wedding, full day', info: '8 to 10h · 200+ photos', price: 750, album: 'weddings' },
    { id: 's-event', group: 'g-event', name: 'Concert or event', info: '2h · 60+ photos', price: 300, from: true, album: 'concerts' },
    { id: 's-sport', group: 'g-event', name: 'Sport', info: 'Competition coverage', price: 100, from: true, album: 'sport' },
  ];

  /* ---------- Photos from the admin page (Supabase) ---------- */
  // Some older uploads are huge (up to 13 MB). Light copies of those live in images/live/;
  // anything uploaded since then is already resized by the admin page.
  const LIGHT = new Set(['1790200390392-6m8veg', '1790200514571-l44u2', '1790200535508-08iyk', '1790200582838-eg5v2v',
    '1790200737974-00zcz', '1790200777055-a85wf7', '1790200799271-uga9j', '1790200818854-w25go8', '1790200858613-kltmt',
    '1790200870601-ck8mbo', '1790200883372-luv3lv', '1790200921384-oibita', '1790200956751-r57q7l', '1790200972663-va7ti8',
    '1790201426158-whqkwp', '1790201440471-97l05', '1792614636066-sh867v']);
  function sized(src) {
    const m = /\/([^/?#]+)\.(?:jpe?g|png|webp)(?:[?#].*)?$/i.exec(src);
    return m && LIGHT.has(m[1]) ? `/images/live/${m[1]}.webp` : src;
  }
  const CAT_TO_ALBUM = {};
  Object.entries(ALBUMS).forEach(([k, a]) => { CAT_TO_ALBUM[a.category] = k; });
  async function loadLivePhotos() {
    if (!SB) return;
    try {
      const r = await fetch(`${SB.url}/rest/v1/photos?select=title,alt_text,image_url,category,order_index,created_at&order=order_index.asc,created_at.asc`, {
        headers: { apikey: SB.anonKey, Authorization: `Bearer ${SB.anonKey}` },
      });
      if (!r.ok) return;
      const rows = await r.json();
      const byAlbum = {};
      rows.forEach(p => {
        const key = CAT_TO_ALBUM[p.category];
        if (!key || !p.image_url) return;
        (byAlbum[key] = byAlbum[key] || []).push([p.image_url, (p.title || p.alt_text || '').trim(), 'p', true]);
      });
      Object.entries(byAlbum).forEach(([key, photos]) => {
        const a = ALBUMS[key];
        const pages = photos.map(ph => [ph]);
        // concerts live entirely in the admin page; other albums keep the hand-picked prints first
        a.pages = key === 'concerts' ? pages : a.pages.concat(pages);
      });
      if (current === 'album' && byAlbum[albumKey]) buildAlbum(albumKey, true);
    } catch (e) { /* offline or blocked: the hand-picked albums still work */ }
  }

  /* ---------- Screen routing (with the browser's back button) ---------- */
  const screens = [...document.querySelectorAll('.screen')];
  const topbar = document.getElementById('topbar');
  const navBtns = [...topbar.querySelectorAll('nav button')];
  let current = 'shop';
  const SCREENS = ['shop', 'welcome', 'choice', 'catalogue', 'album', 'me', 'book'];

  function show(id, opts = {}) {
    current = id;
    screens.forEach(s => { s.hidden = s.id !== id; });
    topbar.hidden = (id === 'shop' || id === 'welcome');
    navBtns.forEach(b => {
      const on = b.dataset.go === id || (id === 'album' && b.dataset.go === 'catalogue');
      if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    if (id === 'welcome') sparkles.start(); else sparkles.stop();
    window.scrollTo(0, 0);
    const h = document.getElementById(id).querySelector('h1, h2');
    if (h && !opts.noFocus) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    if (id === 'album') sizeBook();
    stageTheme(id === 'album' && albumKey === 'concerts');
    track('ViewContent', id === 'album' ? 'album-' + albumKey : id);
  }
  /* ---------- Concerts: lights down, red stage, a curtain that opens ---------- */
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  let beams = null;
  function stageTheme(on) {
    document.body.classList.toggle('theme-concert', on);
    if (themeMeta) themeMeta.setAttribute('content', on ? '#090405' : '#7ab8cb');
    if (on && !beams) {
      beams = document.createElement('div');
      beams.className = 'stage-beams'; beams.setAttribute('aria-hidden', 'true');
      beams.innerHTML = '<i></i><i></i>';
      document.body.appendChild(beams);
    }
  }
  /* ---------- Album intros: a little show before each album opens ----------
     concerts: red curtain · proposals: ring box · weddings: château gates
     sport: tatami countdown · portraits: photo booth.
     Plays once per album per visit, tap to skip, never with reduced motion. */
  const INTROS = {
    concerts: { hold: 1050, out: 1900, html: () => `<div class="drape l"></div><div class="drape r"></div><div class="valance"></div>
        <div class="curtain-sign"><b>${esc(t('Concerts'))}</b><span>${esc(t('Live in Paris'))}</span></div>` },
    proposals: { hold: 1700, out: 900, html: () => `<div class="rb-glow"></div>
        <div class="rb"><div class="rb-inside"></div><div class="rb-lid"></div><div class="rb-base"><div class="rb-cushion"></div>
          <svg class="rb-ring" viewBox="0 0 120 120" aria-hidden="true">
            <ellipse cx="60" cy="78" rx="30" ry="25" fill="none" stroke="#e8c36a" stroke-width="8"/>
            <ellipse cx="60" cy="78" rx="30" ry="25" fill="none" stroke="#fff3c4" stroke-width="2" stroke-dasharray="22 120" stroke-dashoffset="-6"/>
            <path d="M44 50 L52 38 H68 L76 50 L60 66 Z" fill="#eaf6ff" stroke="#9fc4dd" stroke-width="2" stroke-linejoin="round"/>
            <path d="M44 50 H76 M52 38 L56 50 L60 66 M68 38 L64 50 L60 66" fill="none" stroke="#9fc4dd" stroke-width="1.4"/>
          </svg>
          <svg class="rb-glint" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 0 L23 17 L40 20 L23 23 L20 40 L17 23 L0 20 L17 17 Z" fill="#fff"/></svg>
        </div></div>
        <p class="intro-title">${esc(t('Proposals'))}</p>` },
    weddings: { hold: 1250, out: 1500, html: () => {
        const leaf = side => `<svg class="gate-leaf ${side}" viewBox="0 0 400 760" preserveAspectRatio="none" aria-hidden="true">
            <defs><linearGradient id="gold-${side}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f3d27a"/><stop offset="1" stop-color="#b98a2e"/></linearGradient></defs>
            <path d="${side === 'l' ? 'M0 230 Q220 230 400 60' : 'M400 230 Q180 230 0 60'}" fill="none" stroke="#1d1a17" stroke-width="10"/>
            <g stroke="#1d1a17" stroke-width="7">${Array.from({ length: 10 }, (_, i) => { const x = 20 + i * 40; const top = side === 'l' ? 230 - Math.pow(x / 400, 2) * 170 : 230 - Math.pow((400 - x) / 400, 2) * 170; return `<line x1="${x}" y1="${top}" x2="${x}" y2="760"/>`; }).join('')}</g>
            <g fill="url(#gold-${side})">${Array.from({ length: 10 }, (_, i) => { const x = 20 + i * 40; const top = side === 'l' ? 230 - Math.pow(x / 400, 2) * 170 : 230 - Math.pow((400 - x) / 400, 2) * 170; return `<path d="M${x - 8} ${top} L${x} ${top - 26} L${x + 8} ${top} Z"/>`; }).join('')}</g>
            <path d="M0 330 H400 M0 640 H400" stroke="#1d1a17" stroke-width="10"/>
            <g fill="none" stroke="url(#gold-${side})" stroke-width="5">${Array.from({ length: 5 }, (_, i) => `<path d="M${20 + i * 80} 330 q40 -60 80 0 M${20 + i * 80} 640 q40 60 80 0"/>`).join('')}</g>
            <circle cx="${side === 'l' ? 400 : 0}" cy="470" r="70" fill="none" stroke="url(#gold-${side})" stroke-width="9"/>
          </svg>`;
        return `<div class="wg-sky"></div><div class="wg-pillar l"></div><div class="wg-pillar r"></div>${leaf('l')}${leaf('r')}
          <span class="wg-mono">M</span>
          <div class="petals">${Array.from({ length: 16 }, (_, i) => `<i style="--x:${(i * 6.3 + 3) % 100}vw;--d:${(i % 5) * 0.14}s;--r:${(i * 47) % 360}deg"></i>`).join('')}</div>
          <p class="intro-title">${esc(t('Weddings'))}</p>`;
      } },
    sport: { hold: 1900, out: 1100, html: () => {
        // a blue puzzle-mat floor in perspective, with the red competition band
        const s = innerWidth < 600 ? 54 : 78;
        const cols = Math.ceil(innerWidth * 1.7 / s), rows = Math.ceil(innerHeight * 1.25 / s);
        const c0 = Math.round(cols * .31), c1 = cols - 1 - c0, r0 = Math.round(rows * .1), r1 = Math.round(rows * .5);
        const cx = (cols - 1) / 2, cy = rows - 1;
        const tiles = [];
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          const band = ((r === r0 || r === r1) && c >= c0 && c <= c1) || ((c === c0 || c === c1) && r >= r0 && r <= r1);
          const d = Math.hypot((c - cx) * .8, r - cy);
          tiles.push(`<i style="--d:${(d * 0.03).toFixed(3)}s"${band ? ' class="red"' : ''}></i>`);
        }
        return `<div class="dojo-wall"><span class="bag"></span><span class="bag"></span><span class="bag"></span><span class="wall-pad"></span><span class="wall-pad r"></span></div>
          <div class="dojo-floor"><div class="tatami" style="--s:${s}px;grid-template-columns:repeat(${cols},var(--s))">${tiles.join('')}</div></div>
          <div class="scoreboard"><span class="sb-l">${esc(t('Sport'))}</span><b class="sb-time">00:03</b></div>`;
      }, run: el => {
        const tm = el.querySelector('.sb-time');
        [['00:02', 450], ['00:01', 900], [t('COMBATE!'), 1350]].forEach(([v, ms]) => setTimeout(() => { tm.textContent = v; if (ms === 1350) el.classList.add('go'); }, ms));
      } },
    portraits: { hold: 2750, out: 900, html: () => {
        const pics = [].concat(...ALBUMS.portraits.pages).map(p => p[0]).slice(0, 4);
        while (pics.length < 4) pics.push(pics[0]);
        return `<div class="booth">
            <div class="booth-sign">PHOTO<small>4 POSES</small></div>
            <div class="booth-body">
              <div class="booth-window"><div class="booth-curtain"></div><div class="booth-flash"></div><span class="booth-count"></span></div>
              <div class="booth-slot"></div>
              <div class="strip">${pics.map(src => `<span><img src="${src}" alt=""></span>`).join('')}</div>
            </div>
          </div>
          <p class="intro-title">${esc(t('Portraits'))}</p>`;
      }, run: el => {
        const n = el.querySelector('.booth-count'), f = el.querySelector('.booth-flash');
        [0, 1, 2, 3].forEach(i => setTimeout(() => {
          n.textContent = i + 1; f.classList.remove('pop'); void f.offsetWidth; f.classList.add('pop');
        }, 300 + i * 360));
        setTimeout(() => el.classList.add('printed'), 300 + 4 * 360);
      } },
  };
  let introBusy = false;
  const introSeen = k => { try { return sessionStorage.getItem('intro-' + k) === '1'; } catch (e) { return false; } };
  function playIntro(key, then) {
    const I = INTROS[key];
    if (!I || reduce || introBusy || (introSeen(key) && !/[?&]intro=1/.test(location.search))) { then(); return; }
    try { sessionStorage.setItem('intro-' + key, '1'); } catch (e) { /* private mode */ }
    introBusy = true;
    const el = document.createElement('div');
    el.className = `intro intro-${key}${key === 'concerts' ? ' curtain' : ''}`;
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = I.html() + `<span class="intro-skip">${esc(t('Tap to skip'))}</span>`;
    document.body.appendChild(el);
    let opened = false, done = false;
    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const open = () => { if (opened) return; opened = true; then(); setTimeout(() => el.classList.add('open'), 120); };
    const finish = () => { if (done) return; done = true; timers.forEach(clearTimeout); open(); el.remove(); introBusy = false; };
    el.addEventListener('click', finish);
    requestAnimationFrame(() => requestAnimationFrame(() => { el.classList.add('on'); if (I.run) I.run(el); }));
    later(open, I.hold);
    later(finish, I.hold + 120 + I.out);
  }
  function go(id, opts = {}) {
    const hash = id === 'shop' ? '' : id === 'album' ? `#album/${albumKey}` : `#${id}`;
    if (!opts.noPush && location.hash !== hash) history.pushState(null, '', location.pathname + location.search + (hash || ''));
    show(id, opts);
  }
  function route(opts = {}) {
    const h = location.hash.slice(1);
    if (h.startsWith('album/') && ALBUMS[h.slice(6)]) { openAlbum(h.slice(6), { noPush: true, ...opts }); return; }
    show(SCREENS.includes(h) ? h : 'shop', { noFocus: true, ...opts });
  }
  addEventListener('popstate', () => { if (!zoom.hidden) closeZoom(); route(); });
  document.addEventListener('click', e => {
    const tgt = e.target.closest('[data-go]');
    if (tgt) { e.preventDefault(); go(tgt.dataset.go); }
  });

  /* ---------- Storefront door ---------- */
  document.getElementById('enter-btn').addEventListener('click', () => {
    const door = document.getElementById('door');
    door.classList.add('open');
    setTimeout(() => { go('welcome'); door.classList.remove('open'); }, reduce ? 0 : 900);
  });

  /* ---------- Sparkles ---------- */
  const sparkles = (() => {
    const c = document.getElementById('sparkles');
    const ctx = c.getContext('2d');
    let raf = 0, parts = [];
    const colors = ['#ffffff', '#f6c3cf', '#f5d67f', '#fdf6ea'];
    function resize() {
      const r = c.getBoundingClientRect(), d = devicePixelRatio || 1;
      c.width = r.width * d; c.height = r.height * d; ctx.setTransform(d, 0, 0, d, 0, 0);
      const n = Math.round(Math.min(90, r.width * r.height / 9000));
      parts = Array.from({ length: n }, () => ({
        x: Math.random() * r.width, y: Math.random() * r.height,
        s: 3 + Math.random() * 9, p: Math.random() * Math.PI * 2, v: .6 + Math.random() * 1.6,
        dy: -.1 - Math.random() * .3, col: colors[(Math.random() * colors.length) | 0],
      }));
    }
    function star(x, y, s, a, col) {
      ctx.globalAlpha = a; ctx.fillStyle = col; ctx.beginPath();
      ctx.moveTo(x, y - s); ctx.quadraticCurveTo(x, y, x + s, y);
      ctx.quadraticCurveTo(x, y, x, y + s); ctx.quadraticCurveTo(x, y, x - s, y);
      ctx.quadraticCurveTo(x, y, x, y - s); ctx.fill();
    }
    function frame(time) {
      const r = c.getBoundingClientRect();
      ctx.clearRect(0, 0, r.width, r.height);
      for (const p of parts) {
        const a = .25 + .75 * Math.max(0, Math.sin(time / 1000 * p.v + p.p));
        if (!reduce) { p.y += p.dy; if (p.y < -12) p.y = r.height + 12; }
        star(p.x, p.y, p.s * (.6 + .4 * a), a, p.col);
      }
      ctx.globalAlpha = 1;
      if (!reduce) raf = requestAnimationFrame(frame);
    }
    return {
      start() { cancelAnimationFrame(raf); requestAnimationFrame(() => { resize(); raf = requestAnimationFrame(frame); }); },
      stop() { cancelAnimationFrame(raf); },
      resize,
    };
  })();

  /* ---------- Catalogue shelf ---------- */
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function renderShelves() {
    const love = document.getElementById('shelf-love'), night = document.getElementById('shelf-night');
    love.innerHTML = ''; night.innerHTML = '';
    Object.entries(ALBUMS).forEach(([key, a]) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'album-btn';
      b.setAttribute('aria-label', t('Open the {title} album, {price}', { title: t(a.title), price: fromPrice(a.from) }));
      b.innerHTML = `
        <span class="cover" style="background:${a.color}">
          <img class="thumb" src="${a.cover}" alt="">
          <span class="label">${esc(t(a.title))}</span>
        </span>
        <span class="price-tag"><small>${esc(t('from'))}</small>${esc(money(a.from))}</span>`;
      b.addEventListener('click', () => playIntro(key, () => openAlbum(key)));
      (a.shelf === 'night' ? night : love).appendChild(b);
    });
  }

  /* ---------- The album ---------- */
  const book = document.getElementById('flipbook');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const counter = document.getElementById('page-count');
  let leaves = [], cur = 0, albumKey = 'proposals', builtForPhone = null;

  function printHTML([img, cap, o, live], k) {
    const tilt = (Math.random() * 4 - 2).toFixed(2);
    const deckle = !live && k % 4 === 3;  // every so often, an old deckle-edged print
    const label = esc(live ? cap : t(cap));
    const src = live ? sized(img) : img;
    const full = src;
    const onload = live ? ' data-live="1"' : '';
    const inner = `<span class="print ${o}${deckle ? ' deckle' : ''}">${deckle ? '' : '<span class="tape"></span>'}<img src="${esc(src)}" data-full="${esc(full)}" data-orig="${esc(img)}" alt="${label}" loading="lazy"${onload}>${deckle || o === 'l' ? '' : '<span class="tape b"></span>'}</span>`;
    return `<figure style="transform:rotate(${tilt}deg)">${deckle ? `<span class="deckle-wrap">${inner}</span>` : inner}${label ? `<figcaption>${label}</figcaption>` : ''}</figure>`;
  }
  const CLIP = `<svg class="clip" viewBox="0 0 40 100" aria-hidden="true"><path d="M28 30 V82 a10 10 0 0 1 -20 0 V18 a14 14 0 0 1 28 0 V76 a6 6 0 0 1 -12 0 V30" fill="none" stroke="#6b5a4a" stroke-width="4" stroke-linecap="round"/><path d="M28 30 V82 a10 10 0 0 1 -20 0 V18 a14 14 0 0 1 28 0 V76 a6 6 0 0 1 -12 0 V30" fill="none" stroke="#c9bba8" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  let printCount = 0;

  function pageHTML(p, a, side) {
    const cls = `face ${side} pg`;
    if (p.type === 'cover') {
      const ink = a.ink ? `color:${a.ink}` : '', bg = a.ink ? `background:${a.ink}` : '';
      return `<div class="${cls} cover-face" style="background:${a.color}">
        <span class="small" style="${ink}">Melissa · Paris</span>
        <span class="ornament" style="${bg}"></span>
        <span class="emboss" style="${ink}">${esc(t(a.title))}</span>
        <span class="ornament" style="${bg}"></span>
        <span class="small" style="${ink}">${esc(t('Photo album'))}</span></div>`;
    }
    if (p.type === 'opener') {
      const d = `<span class="deckle-wrap"><span class="print deckle p"><img src="${a.cover}" alt=""></span></span>`;
      return `<div class="${cls} opener"><div class="pile" aria-hidden="true">${d}${d}${d}${CLIP}</div>
        <p class="handnote">${esc(t(a.note))}</p><p class="sig">xo Melissa</p></div>`;
    }
    if (p.type === 'end') {
      return `<div class="${cls} end-page"><p class="handnote">${esc(t('Want your story in an album like this?'))}</p>
        <button class="btn orange end-book" type="button">${esc(t('Book a session'))}</button></div>`;
    }
    if (p.type === 'waiting') {
      return `<div class="${cls} waiting"><div class="slot"><span class="tape"></span>${esc(t('your photo here'))}</div>
        <p class="handnote">${esc(t('This spot is saving room for yours.'))}</p></div>`;
    }
    const photos = p.photos;
    const layout = photos.length === 1 ? 'single' : (photos.every(x => x[2] === 'p') ? 'side' : 'stack');
    return `<div class="${cls} ${layout}">${photos.map(ph => printHTML(ph, printCount++)).join('')}</div>`;
  }

  function buildAlbum(key, keepPage) {
    const a = ALBUMS[key];
    const keep = keepPage ? cur : 0;
    printCount = 0;
    const phone = matchMedia('(max-width: 720px)').matches;
    builtForPhone = phone;
    // on a phone, give every photo its own page so it can be big
    const groups = phone ? a.pages.flat().map(ph => [ph]) : a.pages;
    const pages = [{ type: 'cover' }, { type: 'opener' }, ...groups.map(photos => ({ photos })), { type: 'end' }];
    if (pages.length % 2) pages.splice(pages.length - 1, 0, { type: 'waiting' });
    book.innerHTML = '';
    leaves = [];
    for (let i = 0; i < pages.length; i += 2) {
      const leaf = document.createElement('div');
      leaf.className = 'leaf';
      leaf.innerHTML = pageHTML(pages[i], a, 'front') + pageHTML(pages[i + 1], a, 'back');
      book.appendChild(leaf);
      leaves.push(leaf);
    }
    book.querySelectorAll('.end-book').forEach(b => b.addEventListener('click', () => bookFor(key)));
    // photos from the admin page: pick the print's shape once we know the photo's shape,
    // and fall back to the original file if the resized one is unavailable
    book.querySelectorAll('img[data-live]').forEach(img => {
      const fit = () => {
        const pr = img.closest('.print');
        if (pr && img.naturalWidth > img.naturalHeight * 1.05) { pr.classList.remove('p'); pr.classList.add('l'); pr.querySelector('.tape.b')?.remove(); }
      };
      if (img.complete && img.naturalWidth) fit(); else img.addEventListener('load', fit, { once: true });
      img.addEventListener('error', () => {
        if (img.src.includes('/images/live/')) { img.src = img.dataset.orig; img.dataset.full = img.dataset.orig; }
      }, { once: true });
    });
    cur = Math.min(keep, leaves.length); render(true);
  }

  function updateCounter() {
    const n = leaves.length;
    if (!n) return;
    counter.textContent = cur === 0 ? t('Cover') : cur === n ? t('The end') : t('Pages {a} and {b} of {n}', { a: cur * 2, b: cur * 2 + 1, n: n * 2 });
  }
  function render(instant) {
    const n = leaves.length;
    leaves.forEach((l, i) => {
      if (instant) l.style.transition = 'none';
      l.classList.toggle('flipped', i < cur);
      l.style.zIndex = i < cur ? i + 1 : n * 2 - i;
      if (instant) { void l.offsetWidth; l.style.transition = ''; }
    });
    book.classList.toggle('closed-front', cur === 0);
    book.classList.toggle('closed-back', cur === n);
    prevBtn.disabled = cur === 0;
    nextBtn.disabled = cur === n;
    updateCounter();
  }
  function turn(dir) {
    const n = leaves.length;
    const target = Math.max(0, Math.min(n, cur + dir));
    if (target === cur) return;
    const moving = leaves[dir > 0 ? cur : cur - 1];
    moving.style.zIndex = n * 3;
    cur = target;
    leaves.forEach((l, i) => l.classList.toggle('flipped', i < cur));
    book.classList.toggle('closed-front', cur === 0);
    book.classList.toggle('closed-back', cur === n);
    prevBtn.disabled = cur === 0; nextBtn.disabled = cur === n;
    clearTimeout(turn.t);
    turn.t = setTimeout(() => render(false), reduce ? 0 : 1000);
    updateCounter();
  }
  prevBtn.addEventListener('click', () => turn(-1));
  nextBtn.addEventListener('click', () => turn(1));
  book.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); turn(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); turn(-1); }
  });
  document.addEventListener('keydown', e => {
    if (current !== 'album' || !zoom.hidden || e.target.closest('input, textarea')) return;
    if (e.target === book) return;
    if (e.key === 'ArrowRight') turn(1);
    if (e.key === 'ArrowLeft') turn(-1);
  });
  // swipe
  let sx = null;
  book.addEventListener('pointerdown', e => { sx = e.clientX; });
  book.addEventListener('pointerup', e => {
    if (sx === null) return;
    const dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 40) turn(dx < 0 ? 1 : -1);
    else if (e.target.closest('.print')) {
      const img = e.target.closest('.print').querySelector('img');
      openZoom(img.dataset.full || img.src, img.alt);
    }
    else if (!e.target.closest('button')) {
      // tap: right half = next, left half = previous
      const r = book.getBoundingClientRect();
      const phone = matchMedia('(max-width: 720px)').matches;
      if (phone) turn(1);
      else turn(e.clientX > r.left + r.width / 2 ? 1 : -1);
    }
  });

  function sizeBook() {
    const vw = document.documentElement.clientWidth, vh = window.innerHeight;
    const phone = vw <= 720;
    const avail = phone ? vw - 32 : (Math.min(vw, 1100) - 48) / 2;
    const byHeight = (vh - (phone ? 230 : 250)) / 1.36;
    const pw = Math.max(220, Math.min(phone ? 440 : 420, avail, byHeight));
    document.documentElement.style.setProperty('--pw', pw + 'px');
    document.documentElement.style.setProperty('--ph', Math.round(pw * 1.36) + 'px');
  }
  addEventListener('resize', () => {
    sizeBook();
    if (current === 'welcome') sparkles.resize();
    if (current === 'album' && builtForPhone !== matchMedia('(max-width: 720px)').matches) buildAlbum(albumKey);
  });

  const zoom = document.getElementById('zoom');
  let zoomReturn = null;
  function openZoom(src, cap) {
    zoomReturn = document.activeElement;
    const zi = document.getElementById('zoom-img');
    zi.src = src; zi.alt = cap;
    document.getElementById('zoom-cap').textContent = cap;
    zoom.hidden = false;
    document.getElementById('zoom-close').focus();
  }
  function closeZoom() { zoom.hidden = true; if (zoomReturn) zoomReturn.focus({ preventScroll: true }); }
  document.getElementById('zoom-close').addEventListener('click', closeZoom);
  zoom.addEventListener('click', e => { if (e.target === zoom) closeZoom(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !zoom.hidden) closeZoom(); });

  function setAlbumTitle() { document.getElementById('album-title').textContent = t(ALBUMS[albumKey].title); }
  function openAlbum(key, opts = {}) {
    albumKey = key;
    setAlbumTitle();
    buildAlbum(key);
    go('album', opts);
  }
  document.getElementById('album-book').addEventListener('click', () => bookFor(albumKey));

  /* ---------- Booking ---------- */
  const sessWrap = document.getElementById('sessions');
  const priceOf = x => (x.from ? fromPrice(x.price) : money(x.price));
  function renderSessions() {
    const was = sessWrap.querySelector('input:checked')?.id || 's-prop';
    sessWrap.innerHTML = '';
    const cats = document.createElement('div');
    cats.className = 'sess-cats';
    cats.setAttribute('role', 'group');
    cats.setAttribute('aria-label', t('Pick a category, then a package.'));
    SESSION_GROUPS.forEach(g => {
      const b = document.createElement('button');
      b.type = 'button'; b.dataset.group = g.id; b.textContent = t(g.label);
      b.addEventListener('click', () => {
        const first = SESSIONS.find(x => x.group === g.id);
        document.getElementById(first.id).checked = true;
        syncSessions();
      });
      cats.appendChild(b);
    });
    sessWrap.appendChild(cats);
    SESSION_GROUPS.forEach(g => {
      const box = document.createElement('div');
      box.className = 'sess-opts'; box.dataset.group = g.id;
      SESSIONS.filter(x => x.group === g.id).forEach(x => {
        const d = document.createElement('div');
        d.className = 'sess';
        d.innerHTML = `<input type="radio" name="session" id="${x.id}" value="${esc(x.name)}" ${x.id === was ? 'checked' : ''}>
          <label for="${x.id}"><em>${esc(priceOf(x))}</em><b>${esc(t(x.name))}</b><span>${esc(t(x.info))}</span></label>`;
        d.querySelector('input').addEventListener('change', syncSessions);
        box.appendChild(d);
      });
      sessWrap.appendChild(box);
    });
    const sum = document.createElement('p');
    sum.className = 'sess-choice'; sum.setAttribute('aria-live', 'polite');
    sessWrap.appendChild(sum);
    syncSessions();
  }
  // show the category of the chosen package, and spell out the choice
  function syncSessions() {
    const cur = SESSIONS.find(x => document.getElementById(x.id)?.checked) || SESSIONS[2];
    sessWrap.querySelectorAll('.sess-cats button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.group === cur.group)));
    sessWrap.querySelectorAll('.sess-opts').forEach(o => { o.hidden = o.dataset.group !== cur.group; });
    const sum = sessWrap.querySelector('.sess-choice');
    if (sum) sum.innerHTML = `<span>${esc(t('Your choice:'))}</span> <b>${esc(t(cur.name))}</b> · ${esc(priceOf(cur))}`;
  }
  function bookFor(key) {
    const s = SESSIONS.find(x => x.album === key);
    if (s) { document.getElementById(s.id).checked = true; syncSessions(); }
    go('book');
  }

  const form = document.getElementById('order-form');

  /* ---------- Blog readers' offer: code CARNET (?promo=CARNET), until 31 Dec 2026 ---------- */
  const PROMOS = { CARNET: { until: '2026-12-31', text: 'Blog readers: code CARNET applied. You get 5 extra edited photos (sessions booked by 31 December 2026).' } };
  let promo = null;
  (() => {
    let code = null;
    try { code = (new URLSearchParams(location.search).get('promo') || sessionStorage.getItem('shop-promo') || '').toUpperCase(); } catch (e) { /* ignore */ }
    const p = PROMOS[code];
    if (!p || new Date().toISOString().slice(0, 10) > p.until) return;
    promo = code;
    try { sessionStorage.setItem('shop-promo', code); } catch (e) { /* ignore */ }
    const box = document.createElement('p');
    box.className = 'promo-note';
    box.textContent = t(p.text);
    const row = form.querySelector('.submit-row');
    row.parentNode.insertBefore(box, row);
  })();
  const ticket = document.getElementById('ticket');
  const oops = document.getElementById('oops');
  const mail = document.getElementById('mail');
  let lastOrder = null;

  async function sendOrder(o) {
    const jobs = [];
    // 1. email to Melissa (Formspree)
    jobs.push(fetch(FORMSPREE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: `New order: ${o.session} · ${o.name}`,
        name: o.name,
        email: /@/.test(o.contact) ? o.contact : undefined,
        contact: o.contact,
        session: o.session,
        date: o.preferred_date || 'to pick together',
        language: o.language,
        message: o.message || '',
        site_language: o.site_lang,
        promo: promo || undefined,
      }),
    }).then(r => { if (!r.ok) throw new Error('formspree ' + r.status); }));
    // 2. copy in the database, for the admin page
    if (SB) {
      jobs.push(fetch(`${SB.url}/rest/v1/orders`, {
        method: 'POST',
        headers: { apikey: SB.anonKey, Authorization: `Bearer ${SB.anonKey}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify(o),
      }).then(r => { if (!r.ok) throw new Error('supabase ' + r.status); }));
    }
    const res = await Promise.allSettled(jobs);
    return res.some(r => r.status === 'fulfilled');
  }

  function playEnvelope() {
    mail.hidden = false; mail.classList.remove('go');
    void mail.offsetWidth;
    mail.classList.add('go');
    mail.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    return new Promise(r => setTimeout(r, reduce ? 0 : 3000));
  }

  async function submitOrder(o, view) {
    form.hidden = true; ticket.hidden = true; oops.hidden = true;
    document.getElementById('l-body').textContent = view.letter;
    document.getElementById('l-sign').textContent = o.name;
    const [ok] = await Promise.all([o.spam ? Promise.resolve(true) : sendOrder(o.row), playEnvelope()]);
    if (ok) {
      document.getElementById('ticket-text').textContent = view.ticket;
      ticket.hidden = false; ticket.focus({ preventScroll: true });
      track('Contact', o.row.session);
    } else {
      mail.hidden = true;
      oops.hidden = false; oops.focus({ preventScroll: true });
    }
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const fName = document.getElementById('o-name'), fContact = document.getElementById('o-email');
    const name = fName.value.trim(), contact = fContact.value.trim();
    const err = document.getElementById('o-err');
    if (!name || contact.length < 3) { err.hidden = false; (name ? fContact : fName).focus(); return; }
    err.hidden = true;
    const sess = form.querySelector('input[name="session"]:checked').value;
    const ol = form.querySelector('input[name="lang"]:checked').value;
    const dv = document.getElementById('o-date').value;
    const locale = lang === 'fr' ? 'fr-FR' : lang === 'ar' ? 'ar-u-nu-latn' : 'en-GB';
    const date = dv ? new Date(dv + 'T12:00').toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    const langName = I18N.langNames[lang][ol];
    const sessLabel = t(sess);
    lastOrder = {
      name,
      spam: !!document.getElementById('o-company').value,
      row: {
        session: sess, name, contact,
        preferred_date: dv || null,
        language: I18N.langNames.en[ol],
        message: ((document.getElementById('o-msg').value.trim() || '') + (promo ? `\n\n[Code ${promo} : 5 photos retouchées en plus]` : '')).trim() || null,
        site_lang: lang,
      },
    };
    const view = {
      letter: dv
        ? t("We'd love a {session} session on {date}, in {lang}.", { session: lang === 'en' ? sessLabel.toLowerCase() : sessLabel, date, lang: langName })
        : t("We'd love a {session} session, on a date we pick together, in {lang}.", { session: lang === 'en' ? sessLabel.toLowerCase() : sessLabel, lang: langName }),
      ticket: t('{session}, {date}, in {lang}. Melissa will reply at {contact} within 24 hours.', { session: sessLabel, date: date || t('a date we pick together'), lang: langName, contact }),
    };
    lastOrder.view = view;
    submitOrder(lastOrder, view);
  });
  document.getElementById('retry').addEventListener('click', () => { if (lastOrder) submitOrder(lastOrder, lastOrder.view); });
  document.getElementById('new-order').addEventListener('click', () => {
    form.reset(); renderSessions();
    const ol = document.getElementById('o-' + lang); if (ol) ol.checked = true;
    form.hidden = false; ticket.hidden = true; oops.hidden = true;
    mail.hidden = true; mail.classList.remove('go');
    document.getElementById('o-name').focus();
  });

  /* ---------- TikTok pixel events (only if the pixel loaded) ---------- */
  function track(ev, what) {
    try { if (window.ttq && ttq.track) ttq.track(ev, { contents: [{ content_id: String(what), content_type: 'product', content_name: String(what) }], value: 0, currency: 'EUR' }); } catch (e) { /* ignore */ }
  }

  /* ---------- Start ---------- */
  const adSlot = document.getElementById('ad-slot-cat');
  adSlot.replaceWith(document.querySelector('section#book .ad').cloneNode(true));
  collect(document.body);
  setLang(lang, { keepOrderLang: false });
  sizeBook();

  // old links (?go=proposals, ?go=book …) and bookmarks (#book, #album/weddings)
  const params = new URLSearchParams(location.search);
  const goParam = params.get('go');
  const sessParam = params.get('session');
  if (sessParam && SESSIONS.some(x => x.id === sessParam)) { document.getElementById(sessParam).checked = true; syncSessions(); }
  if (sessParam) params.delete('session');
  if ((goParam || sessParam) && !location.hash) {
    const hash = !goParam ? '' : ALBUMS[goParam] ? `#album/${goParam}` : SCREENS.includes(goParam) ? `#${goParam}` : '';
    params.delete('go');
    const qs = params.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + hash);
  }
  route({ noFocus: true });
  loadLivePhotos();
})();
