// Telegram bot for Melissa's blog. It only talks to Melissa (TELEGRAM_CHAT_ID) and hands every
// real job (ideas, writing, corrections, publishing) to the GitHub Action "Blog bot", which has
// all the time it needs. This function just answers fast.
//
// Vercel environment variables:
//   TELEGRAM_BOT_TOKEN       from @BotFather
//   TELEGRAM_WEBHOOK_SECRET  any long random string (also used once to connect the bot)
//   TELEGRAM_CHAT_ID         Melissa's chat id (the bot tells her what it is on the first message)
//   GITHUB_TOKEN             fine-grained token on Mrxa69K/website1.2 with "Contents: Read and write"
//
// Connect the bot once by opening: https://www.melissaphotographyparis.fr/api/telegram/?setup=<TELEGRAM_WEBHOOK_SECRET>

const REPO = 'Mrxa69K/website1.2';
const L = require('./_lib');

async function tg(method, body) {
  const r = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  return r.json().catch(() => ({}));
}

async function dispatch(payload) {
  const r = await fetch(`https://api.github.com/repos/${REPO}/dispatches`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'melissa-blog-bot',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ event_type: 'blog-bot', client_payload: payload }),
  });
  return r.status === 204;
}

// "1. Title" / "   🔎 query · 📂 category" lines of an ideas message
function ideaFrom(text, n) {
  const lines = String(text || '').split('\n');
  const i = lines.findIndex(l => l.trim().startsWith(n + '. '));
  if (i < 0) return null;
  const title = lines[i].trim().slice(String(n).length + 2).trim();
  const meta = lines[i + 1] || '';
  const query = (meta.match(/🔎\s*([^·\n]+)/) || [])[1];
  const category = (meta.match(/📂\s*([a-z]+)/) || [])[1];
  return { title, query: query ? query.trim() : '', category: category || '' };
}

const HELP = [
  'Voici comment je fonctionne :',
  '',
  '• Chaque lundi, je t’envoie 5 idées d’articles. Touche ✅ sous celles que tu veux.',
  '• J’écris l’article en français, anglais et arabe, puis je t’envoie un aperçu.',
  '• Pour corriger : réponds directement au message de l’aperçu avec ce que tu veux changer.',
  '• Pour publier : touche « Publier ».',
  '',
  'Commandes :',
  '/idees : 5 nouvelles idées maintenant',
  '/ecrire ton sujet : un article sur le sujet de ton choix (ajoute tes notes après le sujet)',
  '/google : vérifier si Google a indexé tes articles récents',
].join('\n');

// status buttons under a client request: lead:<r|b|d|x>:<id>
async function leadStatus(cb, data) {
  const [, code, id] = data.split(':');
  const status = L.CODES[code];
  if (!status || !/^[0-9a-f-]{36}$/.test(id || '')) { await tg('answerCallbackQuery', { callback_query_id: cb.id }); return; }
  if (!L.hasDb()) { await tg('answerCallbackQuery', { callback_query_id: cb.id, text: 'Base de données pas encore reliée (SUPABASE_SECRET_KEY)', show_alert: true }); return; }
  const patch = { status };
  if (L.STAMP[status]) patch[L.STAMP[status]] = new Date().toISOString();
  if (status === 'delivered') patch.review_sent_at = null; // a new delivery date restarts the 2-day wait
  const rows = await L.sb(`leads?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
  const lead = rows && rows[0];
  if (!lead) { await tg('answerCallbackQuery', { callback_query_id: cb.id, text: 'Demande introuvable' }); return; }
  const owner = process.env.TELEGRAM_CHAT_ID;
  await tg('editMessageText', { chat_id: owner, message_id: cb.message.message_id, text: L.leadText(lead), parse_mode: 'HTML', disable_web_page_preview: true, reply_markup: L.leadButtons(lead) });
  let note = L.STATUS[status];
  if (status === 'delivered') {
    if (lead.email) note = '📦 Livré. La demande d’avis partira par e-mail dans 2 jours.';
    else {
      note = '📦 Livré';
      const lc = L.langCode(lead.lang || lead.language);
      const text = L.ASK_REVIEW[lc](lead.name);
      const phone = L.phoneOf(lead.contact);
      await tg('sendMessage', {
        chat_id: owner, reply_to_message_id: cb.message.message_id,
        text: phone
          ? `⭐ ${lead.name} n’a pas laissé d’e-mail. Dans 1 ou 2 jours, envoie-lui la demande d’avis sur WhatsApp :`
          : `⭐ ${lead.name} n’a pas laissé d’e-mail. Dans 1 ou 2 jours, envoie-lui ce message pour demander un avis :\n\n${text}`,
        reply_markup: phone ? { inline_keyboard: [[{ text: '⭐ Demander un avis sur WhatsApp', url: `https://wa.me/${phone}?text=${encodeURIComponent(text)}` }]] } : undefined,
      });
    }
  }
  await tg('answerCallbackQuery', { callback_query_id: cb.id, text: note });
}

module.exports = async (req, res) => {
  const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!process.env.TELEGRAM_BOT_TOKEN || !SECRET) { res.status(204).end(); return; }

  // one-time setup: connect Telegram to this URL
  if (req.method === 'GET') {
    if (!req.query || req.query.setup !== SECRET) { res.status(404).end(); return; }
    const url = `https://${req.headers.host}/api/telegram/`;
    const hook = await tg('setWebhook', { url, secret_token: SECRET, allowed_updates: ['message', 'callback_query'] });
    await tg('setMyCommands', { commands: [
      { command: 'idees', description: '5 nouvelles idées d’articles' },
      { command: 'ecrire', description: 'Écrire un article sur un sujet' },
      { command: 'google', description: 'Google a-t-il indexé mes articles ?' },
      { command: 'aide', description: 'Comment ça marche' },
    ] });
    res.status(200).json({ connected: !!hook.ok, url, telegram: hook.description || '' });
    return;
  }

  if (req.headers['x-telegram-bot-api-secret-token'] !== SECRET) { res.status(401).end(); return; }
  const u = req.body || {};
  const cb = u.callback_query;
  const msg = u.message;
  const chatId = String((msg && msg.chat && msg.chat.id) || (cb && cb.message && cb.message.chat.id) || '');
  const OWNER = String(process.env.TELEGRAM_CHAT_ID || '');

  if (!OWNER) {
    if (chatId) await tg('sendMessage', { chat_id: chatId, text: `Bonjour ! Ton identifiant Telegram est ${chatId}.\nAjoute-le dans Vercel sous le nom TELEGRAM_CHAT_ID (et dans GitHub), puis redéploie le site.` });
    res.status(200).end(); return;
  }
  if (chatId !== OWNER) { res.status(200).end(); return; }

  const say = text => tg('sendMessage', { chat_id: OWNER, text });
  const go = async (payload, okText) => {
    const ok = await dispatch(payload);
    await say(ok ? okText : '❌ Je n’arrive pas à joindre GitHub. Vérifie le GITHUB_TOKEN dans Vercel.');
  };

  try {
    if (cb) {
      const data = String(cb.data || '');
      if (data.startsWith('lead:')) {
        await leadStatus(cb, data);
      } else if (data.startsWith('pick:')) {
        const idea = ideaFrom(cb.message.text, data.slice(5));
        await tg('answerCallbackQuery', { callback_query_id: cb.id, text: idea ? 'C’est parti ✍️' : 'Idée introuvable' });
        if (idea) await go({ action: 'write', ...idea }, `✍️ J’écris « ${idea.title} ». Je t’envoie l’aperçu dans quelques minutes.`);
      } else if (data === 'more') {
        await tg('answerCallbackQuery', { callback_query_id: cb.id, text: 'Je cherche…' });
        await go({ action: 'ideas' }, '💡 Je cherche 5 autres idées…');
      } else if (data.startsWith('pub:')) {
        await tg('answerCallbackQuery', { callback_query_id: cb.id, text: 'Publication…' });
        await tg('editMessageReplyMarkup', { chat_id: OWNER, message_id: cb.message.message_id, reply_markup: { inline_keyboard: [] } });
        await go({ action: 'publish', id: data.slice(4) }, '🚀 Je publie l’article…');
      } else if (data.startsWith('drop:')) {
        await tg('answerCallbackQuery', { callback_query_id: cb.id, text: 'Brouillon abandonné' });
        await tg('editMessageReplyMarkup', { chat_id: OWNER, message_id: cb.message.message_id, reply_markup: { inline_keyboard: [] } });
        await go({ action: 'discard', id: data.slice(5) }, '🗑 Brouillon abandonné.');
      } else {
        await tg('answerCallbackQuery', { callback_query_id: cb.id });
      }
    } else if (msg && typeof msg.text === 'string') {
      const text = msg.text.trim();
      const reply = msg.reply_to_message && msg.reply_to_message.text;
      const ref = reply && (reply.match(/Réf\s*:\s*blog\/([a-z0-9]+)/) || [])[1];
      if (ref && !text.startsWith('/')) {
        // the old version can no longer be published by mistake: the corrected draft comes with new buttons
        await tg('editMessageReplyMarkup', { chat_id: OWNER, message_id: msg.reply_to_message.message_id, reply_markup: { inline_keyboard: [] } });
        await go({ action: 'revise', id: ref, comment: text.slice(0, 2000) }, '✏️ Bien noté, je corrige et je te renvoie l’aperçu.');
      } else if (/^\/idees?\b/i.test(text)) {
        await go({ action: 'ideas' }, '💡 Je cherche 5 idées…');
      } else if (/^\/google\b/i.test(text)) {
        await go({ action: 'check', all: true }, '🔎 Je demande à Google, réponse dans une minute…');
      } else if (/^\/ecrire\b/i.test(text)) {
        const rest = text.replace(/^\/ecrire(@\w+)?/i, '').trim();
        if (!rest) await say('Écris le sujet juste après la commande, par exemple :\n/ecrire Photos de mariage au parc de Sceaux. Mes notes : …');
        else {
          const [title, ...notes] = rest.split(/\n|Mes notes\s*:/i);
          await go({ action: 'write', title: title.trim().slice(0, 160), notes: notes.join(' ').trim().slice(0, 2000) }, `✍️ J’écris « ${title.trim().slice(0, 80)} ». Je t’envoie l’aperçu dans quelques minutes.`);
        }
      } else if (/^\/(start|aide|help)\b/i.test(text)) {
        await say(HELP);
      } else {
        await say('Pour corriger un brouillon, réponds directement à son message (appui long, puis « Répondre »).\nSinon : /idees, /ecrire ton sujet ou /google.');
      }
    }
  } catch (e) {
    console.error('telegram bot error', e && e.message);
  }
  res.status(200).end();
};
