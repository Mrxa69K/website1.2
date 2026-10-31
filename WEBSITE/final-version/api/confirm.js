// Sends the client an automatic "I received your request" email, from Melissa's Gmail.
// Needs two environment variables in Vercel (Settings > Environment Variables):
//   MAIL_USER          the Gmail address that sends (e.g. melissa.photography.paris@gmail.com)
//   MAIL_APP_PASSWORD  a Gmail "app password" (16 letters), not the normal password
// Without them the endpoint does nothing (204), so the site keeps working.
const nodemailer = require('nodemailer');

const SITE = 'https://www.melissaphotographyparis.fr';
const recent = new Map(); // ip -> [timestamps], simple flood guard per instance

const T = {
  en: {
    subject: 'Your request is received ✨ Melissa Photography Paris',
    hi: n => `Hi ${n},`,
    thanks: 'Thank you for your request, I am so happy you thought of me!',
    recap: 'Your request',
    session: 'Session', date: 'Date', toPick: 'to pick together',
    next: 'I will reply personally within 24 hours with my availability and a few questions to plan everything perfectly.',
    meanwhile: 'In the meantime, you can see more of my work and read what other couples say:',
    reviews: '★ Read my 5.0 reviews', insta: 'See my work on Instagram',
    sign: 'Speak soon!', foot: 'Paris · French, English, Arabic',
    note: 'This is an automatic confirmation. Simply reply to this email if you want to add anything.',
    dir: 'ltr', reviewsPath: '/reviews/',
  },
  fr: {
    subject: 'Votre demande est bien reçue ✨ Melissa Photography Paris',
    hi: n => `Bonjour ${n},`,
    thanks: 'Merci pour votre demande, je suis ravie que vous ayez pensé à moi !',
    recap: 'Votre demande',
    session: 'Séance', date: 'Date', toPick: 'à choisir ensemble',
    next: 'Je vous réponds personnellement sous 24 h avec mes disponibilités et quelques questions pour tout préparer.',
    meanwhile: 'En attendant, vous pouvez voir mon travail et lire ce que disent les autres couples :',
    reviews: '★ Lire mes avis 5,0', insta: 'Voir mon travail sur Instagram',
    sign: 'À très vite !', foot: 'Paris · français, anglais, arabe',
    note: 'Ceci est une confirmation automatique. Répondez simplement à cet e-mail pour ajouter quelque chose.',
    dir: 'ltr', reviewsPath: '/fr/avis/',
  },
  ar: {
    subject: 'وصل طلبكم ✨ Melissa Photography Paris',
    hi: n => `مرحباً ${n}،`,
    thanks: 'شكراً على طلبكم، سعيدة جداً لأنكم فكّرتم بي!',
    recap: 'طلبكم',
    session: 'الجلسة', date: 'التاريخ', toPick: 'نختاره معاً',
    next: 'سأردّ عليكم شخصياً خلال 24 ساعة بمواعيدي المتاحة وبعض الأسئلة لتحضير كل شيء.',
    meanwhile: 'في الأثناء، يمكنكم مشاهدة أعمالي وقراءة آراء الأزواج الآخرين:',
    reviews: '★ آراء عملائي 5.0', insta: 'أعمالي على إنستغرام',
    sign: 'إلى اللقاء قريباً!', foot: 'باريس · العربية والفرنسية والإنجليزية',
    note: 'هذا تأكيد تلقائي. يكفي أن تردّوا على هذا البريد لإضافة أي شيء.',
    dir: 'rtl', reviewsPath: '/ar/reviews/',
  },
};

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clean = (s, max) => String(s || '').replace(/https?:\/\/\S+|www\.\S+/gi, '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);

function html(t, { name, session, date }) {
  const row = (k, v) => `<tr><td style="padding:8px 18px;font-size:14px;color:#4b6474;">${esc(k)}</td><td style="padding:8px 18px;font-size:15px;font-weight:bold;color:#1f3a4d;text-align:${t.dir === 'rtl' ? 'left' : 'right'};">${esc(v)}</td></tr>`;
  const btn = (href, label, dark) => `<a href="${href}" style="display:inline-block;margin:6px;padding:12px 22px;background:${dark ? '#1f3a4d' : '#f6c3cf'};color:${dark ? '#fdf6ea' : '#1f3a4d'};font-family:Georgia,serif;font-style:italic;font-weight:bold;font-size:16px;text-decoration:none;border-radius:999px;${dark ? '' : 'border:2px solid #1f3a4d;'}">${esc(label)}</a>`;
  return `<!doctype html><html dir="${t.dir}"><body style="margin:0;padding:0;background:#7ab8cb;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#7ab8cb;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" dir="${t.dir}" style="width:100%;max-width:600px;background:#fdf6ea;border:3px solid #1f3a4d;border-radius:14px;">
<tr><td align="center" style="padding:22px 24px 14px;background:#f6c3cf;border-radius:11px 11px 0 0;border-bottom:3px solid #1f3a4d;">
<div style="font-family:Georgia,serif;font-size:26px;font-weight:bold;font-style:italic;color:#1f3a4d;" dir="ltr">&#9728; Melissa Photography Paris</div>
<div style="font-family:Arial,sans-serif;font-size:11px;font-weight:bold;letter-spacing:3px;color:#a83a5a;text-transform:uppercase;padding-top:6px;" dir="ltr">Proposals &middot; Weddings &middot; Couples</div></td></tr>
<tr><td style="padding:0;"><img src="${SITE}/images/email/louvre-couple.jpg" width="600" alt="" style="display:block;width:100%;max-width:600px;height:auto;border:0;"></td></tr>
<tr><td style="padding:26px 30px 8px;font-family:Georgia,serif;font-size:17px;line-height:1.6;color:#1f3a4d;text-align:${t.dir === 'rtl' ? 'right' : 'left'};">
<p style="margin:0 0 14px;">${esc(t.hi(name))}</p><p style="margin:0 0 14px;">${esc(t.thanks)}</p></td></tr>
<tr><td style="padding:0 30px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:2px dashed #e58aa2;border-radius:12px;font-family:Arial,sans-serif;">
<tr><td colspan="2" style="padding:14px 18px 4px;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#a83a5a;">${esc(t.recap)}</td></tr>
${row(t.session, session)}${row(t.date, date || t.toPick)}<tr><td colspan="2" style="height:8px;"></td></tr></table></td></tr>
<tr><td style="padding:20px 30px 6px;font-family:Georgia,serif;font-size:17px;line-height:1.6;color:#1f3a4d;text-align:${t.dir === 'rtl' ? 'right' : 'left'};">
<p style="margin:0 0 14px;"><b>${esc(t.next)}</b></p><p style="margin:0;">${esc(t.meanwhile)}</p></td></tr>
<tr><td align="center" style="padding:14px 24px 6px;">${btn(SITE + t.reviewsPath, t.reviews, true)}${btn('https://www.instagram.com/melissa_photography_paris', t.insta, false)}</td></tr>
<tr><td style="padding:16px 30px 22px;font-family:Georgia,serif;font-size:17px;color:#1f3a4d;text-align:${t.dir === 'rtl' ? 'right' : 'left'};">
<p style="margin:0 0 4px;">${esc(t.sign)}</p><p style="margin:0;font-size:22px;font-style:italic;font-weight:bold;color:#a83a5a;">Melissa</p>
<p style="margin:14px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#6b7d8a;">${esc(t.note)}</p></td></tr>
<tr><td align="center" style="padding:14px 24px;background:#1f3a4d;border-radius:0 0 11px 11px;font-family:Arial,sans-serif;font-size:12px;line-height:1.6;color:#fdf6ea;">
<a href="${SITE}/" style="color:#fdf6ea;">melissaphotographyparis.fr</a> &middot; <a href="https://www.instagram.com/melissa_photography_paris" style="color:#fdf6ea;">@melissa_photography_paris</a><br>${esc(t.foot)}</td></tr>
</table></td></tr></table></body></html>`;
}

function text(t, { name, session, date }) {
  return [t.hi(name), '', t.thanks, '', `${t.session}: ${session}`, `${t.date}: ${date || t.toPick}`, '', t.next, '', t.meanwhile,
    SITE + t.reviewsPath, 'https://www.instagram.com/melissa_photography_paris', '', t.sign, 'Melissa', 'Melissa Photography Paris', '', t.note].join('\n');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).end(); return; }
  const origin = req.headers.origin || '';
  if (origin && !/^https:\/\/(www\.)?melissaphotographyparis\.fr$/.test(origin) && !/\.vercel\.app$/.test(origin)) { console.log('confirm: blocked origin', origin); res.status(403).end(); return; }
  if (!process.env.MAIL_USER || !process.env.MAIL_APP_PASSWORD) { res.status(204).end(); return; }

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const hits = (recent.get(ip) || []).filter(x => now - x < 3600e3);
  if (hits.length >= 5) { console.log('confirm: too many requests from one visitor'); res.status(429).end(); return; }
  hits.push(now); recent.set(ip, hits);

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};
  const email = String(body.email || '').trim().slice(0, 120);
  if (!/^[^\s@<>]+@[^\s@<>]+\.[a-z]{2,}$/i.test(email)) { console.log('confirm: not an email address'); res.status(400).end(); return; }
  const lang = T[body.lang] ? body.lang : 'en';
  const t = T[lang];
  const data = { name: clean(body.name, 60) || '', session: clean(body.session, 80), date: clean(body.date, 60) };

  try {
    const tx = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_APP_PASSWORD } });
    await tx.sendMail({
      from: { name: 'Melissa Photography Paris', address: process.env.MAIL_USER },
      to: email,
      replyTo: process.env.MAIL_USER,
      subject: t.subject,
      text: text(t, data),
      html: html(t, data),
    });
    console.log('confirm: sent to', email.replace(/^(.).*(@.*)$/, '$1***$2'), 'lang', lang);
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('confirm mail failed', e && e.message);
    res.status(502).json({ ok: false });
  }
};

module.exports.preview = (lang, data) => html(T[lang] || T.en, data);
