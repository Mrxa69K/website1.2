// Called by the order form (js/shop.js) for every real request: keeps the lead in Supabase
// (table "leads") and alerts Melissa on Telegram with reply and status buttons.
// Answers 503 when Telegram is not configured, so the form does not count it as delivered.
const { tg, sb, hasDb, isEmail, langCode, leadText, leadButtons } = require('./_lib');

const recent = new Map(); // ip -> [timestamps], simple flood guard per instance
const cut = (s, n) => String(s == null ? '' : s).replace(/\r/g, '').trim().slice(0, n);

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).end(); return; }
  const origin = req.headers.origin || '';
  if (origin && !/^https:\/\/(www\.)?melissaphotographyparis\.fr$/.test(origin) && !/\.vercel\.app$/.test(origin)) { res.status(403).end(); return; }
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) { res.status(503).end(); return; }

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const hits = (recent.get(ip) || []).filter(x => now - x < 3600e3);
  if (hits.length >= 5) { console.log('lead: too many requests from one visitor'); res.status(429).end(); return; }
  hits.push(now); recent.set(ip, hits);

  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  b = b || {};
  const name = cut(b.name, 80), contact = cut(b.contact, 160);
  if (!name || contact.length < 3) { res.status(400).end(); return; }

  const lead = {
    name, contact,
    email: isEmail(contact) ? contact : null,
    session: (b.gift && b.gift.to ? '🎁 Bon cadeau : ' : '') + cut(b.session, 120),
    preferred_date: /^\d{4}-\d{2}-\d{2}$/.test(b.preferred_date || '') ? b.preferred_date : null,
    language: cut(b.language, 40),
    lang: langCode(b.language),
    message: cut(b.message, 2000) || null,
    site_lang: cut(b.site_lang, 5),
    status: 'new',
  };

  if (hasDb()) {
    try { const rows = await sb('leads', { method: 'POST', body: JSON.stringify(lead) }); Object.assign(lead, rows[0]); }
    catch (e) { console.error('lead: database', e.message); }
  }
  const sent = await tg('sendMessage', {
    chat_id: process.env.TELEGRAM_CHAT_ID, text: leadText(lead), parse_mode: 'HTML',
    disable_web_page_preview: true, reply_markup: leadButtons(lead),
  });
  if (!sent.ok) { res.status(502).end(); return; }
  if (lead.id) {
    try { await sb(`leads?id=eq.${lead.id}`, { method: 'PATCH', body: JSON.stringify({ tg_message_id: sent.result.message_id }), headers: { Prefer: 'return=minimal' } }); }
    catch (e) { console.error('lead: save message id', e.message); }
  }
  console.log('lead: alert sent', lead.id ? 'and saved' : '(not saved)');
  res.status(200).json({ ok: true });
};
