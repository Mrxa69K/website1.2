// Shared helpers for the client-follow-up functions (lead.js, telegram.js, daily.js).
// Files starting with "_" are not turned into endpoints by Vercel.
//
// Vercel environment variables used here:
//   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID   the blog bot, also used for client alerts
//   SUPABASE_SECRET_KEY                    Supabase secret key (sb_secret_...) or legacy service_role key
//   GOOGLE_REVIEW_URL                      optional, the "leave a review" link of the Google profile
//   MAIL_USER, MAIL_APP_PASSWORD           Gmail, for the review request email

const SB_URL = 'https://amrzoqmnkfnewujbeqdn.supabase.co';
const SITE = 'https://www.melissaphotographyparis.fr';
// "leave a review" link of the Google Business Profile (can be overridden with GOOGLE_REVIEW_URL)
const REVIEW_URL = process.env.GOOGLE_REVIEW_URL || 'https://g.page/r/CXUNvsfIdXCOEAE/review';
const INSTA = 'https://www.instagram.com/melissa_photography_paris';

async function tg(method, body) {
  const r = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!j.ok) console.error('telegram', method, j.description);
  return j;
}

const hasDb = () => !!process.env.SUPABASE_SECRET_KEY;
async function sb(pathq, opts = {}) {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error('SUPABASE_SECRET_KEY missing');
  const headers = { apikey: key, 'Content-Type': 'application/json', Prefer: 'return=representation', ...(opts.headers || {}) };
  if (key.startsWith('eyJ')) headers.Authorization = 'Bearer ' + key; // legacy service_role JWT
  const r = await fetch(`${SB_URL}/rest/v1/${pathq}`, { ...opts, headers });
  const text = await r.text();
  if (!r.ok) throw new Error(`supabase ${r.status} ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const isEmail = s => /^[^\s@<>]+@[^\s@<>]+\.[a-z]{2,}$/i.test(String(s || '').trim());
const langCode = s => (/^ar|arab/i.test(s || '') ? 'ar' : /^fr|fren|fran/i.test(s || '') ? 'fr' : 'en');

// phone number in international form for wa.me, or '' (French numbers 06... become 336...)
function phoneOf(contact) {
  const c = String(contact || '').trim();
  if (isEmail(c) || /[a-z]/i.test(c.replace(/^(tel|whatsapp)\s*:?/i, ''))) return '';
  let d = c.replace(/[^\d+]/g, '');
  if (d.startsWith('+')) d = d.slice(1);
  else if (d.startsWith('00')) d = d.slice(2);
  else if (/^0[1-9]\d{8}$/.test(d)) d = '33' + d.slice(1);
  return d.length >= 8 && d.length <= 15 ? d : '';
}
function instaOf(contact) {
  const c = String(contact || '').trim();
  const m = c.match(/instagram\.com\/([A-Za-z0-9._]+)/i) || c.match(/^@([A-Za-z0-9._]{2,30})$/) || c.match(/^(?:insta(?:gram)?)\s*:?\s*@?([A-Za-z0-9._]{2,30})$/i);
  return m ? m[1] : '';
}

const STATUS = {
  new: '🆕 Nouvelle', replied: '✉️ Répondu', booked: '📅 Réservé', delivered: '📦 Livré', lost: '❌ Annulé',
};
const CODES = { r: 'replied', b: 'booked', d: 'delivered', x: 'lost', n: 'new' };
const STAMP = { replied: 'replied_at', booked: 'booked_at', delivered: 'delivered_at' };

const GREET = {
  fr: (n, s) => `Bonjour ${n}, c'est Melissa de Melissa Photography Paris. Merci pour votre demande (${s}) !`,
  en: (n, s) => `Hi ${n}, it's Melissa from Melissa Photography Paris. Thank you for your request (${s})!`,
  ar: (n, s) => `مرحباً ${n}، معكم ميليسا من Melissa Photography Paris. شكراً على طلبكم (${s})!`,
};
const ASK_REVIEW = {
  fr: n => `Bonjour ${n}, merci encore pour votre confiance ! Si vos photos vous ont plu, un petit avis Google m'aiderait énormément : ${REVIEW_URL}`,
  en: n => `Hi ${n}, thank you again! If you loved your photos, a short Google review would help me so much: ${REVIEW_URL}`,
  ar: n => `مرحباً ${n}، شكراً مرة أخرى على ثقتكم! إذا أعجبتكم الصور، فإن تقييماً قصيراً على Google سيساعدني كثيراً: ${REVIEW_URL}`,
};

const fmtDate = d => {
  if (!d) return 'à choisir ensemble';
  const x = new Date(String(d).length === 10 ? d + 'T12:00:00Z' : d);
  return isNaN(x) ? String(d) : x.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });
};

// gift details, read back from the message the form writes ("🎁 BON CADEAU pour X (de Y)\nMessage sur le bon : ...")
function giftOf(l) {
  const m = String(l.message || '').match(/^🎁 BON CADEAU pour (.+?)(?: \(de (.+?)\))?\n(?:Message sur le bon : (.*)\n)?/);
  return m ? { to: m[1], from: m[2] || '', msg: m[3] || '' } : null;
}
const voucherCode = l => 'MPP-' + String(l.id || Math.random().toString(16).slice(2)).replace(/-/g, '').slice(0, 6).toUpperCase();
function voucherUrl(l) {
  const g = giftOf(l);
  if (!g) return '';
  const q = new URLSearchParams({ to: g.to, from: g.from, msg: g.msg, s: String(l.session || '').replace(/^🎁 Bon cadeau : /, ''), lang: langCode(l.lang || l.language), code: voucherCode(l) });
  return `${SITE}/bon-cadeau/?${q}`;
}

function leadText(l) {
  const lines = [
    giftOf(l) ? `🎁 <b>Nouveau bon cadeau</b> · code ${voucherCode(l)}` : `🔔 <b>Nouvelle demande</b>`,
    '',
    `👤 <b>${esc(l.name)}</b>`,
    `📸 ${esc(l.session)}`,
    `📅 ${esc(fmtDate(l.preferred_date))}`,
    `🗣 ${esc(l.language || '')}`,
    `📩 ${esc(l.contact)}`,
  ];
  if (l.message) lines.push('', `💬 ${esc(String(l.message).slice(0, 700))}`);
  lines.push('', `Statut : <b>${STATUS[l.status] || STATUS.new}</b>`);
  return lines.join('\n');
}

function leadButtons(l) {
  const rows = [];
  const lc = langCode(l.lang || l.language);
  const phone = phoneOf(l.contact), insta = instaOf(l.contact);
  if (phone) rows.push([{ text: '💬 Répondre sur WhatsApp', url: `https://wa.me/${phone}?text=${encodeURIComponent(GREET[lc](l.name, l.session))}` }]);
  else if (insta) rows.push([{ text: '📷 Répondre sur Instagram', url: `https://ig.me/m/${insta}` }]);
  const vurl = voucherUrl(l);
  if (vurl) rows.push([{ text: '🎁 Préparer le bon cadeau (PDF)', url: vurl }]);
  if (l.id) {
    const b = (code, label) => ({ text: (CODES[code] === l.status ? '• ' : '') + label, callback_data: `lead:${code}:${l.id}` });
    rows.push([b('r', '✉️ Répondu'), b('b', '📅 Réservé')]);
    rows.push([b('d', '📦 Livré'), b('x', '❌ Annulé')]);
  }
  return { inline_keyboard: rows };
}

module.exports = {
  SITE, REVIEW_URL, INSTA, tg, sb, hasDb, esc, isEmail, langCode, phoneOf, instaOf,
  STATUS, CODES, STAMP, ASK_REVIEW, leadText, leadButtons, giftOf, voucherCode,
};
