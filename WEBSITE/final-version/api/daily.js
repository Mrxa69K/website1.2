// Runs every morning (Vercel cron, see vercel.json):
//  1. sends the review request email 2 days after a session is marked "Livré" on Telegram
//  2. reminds Melissa of requests she has not answered yet (more than 8 hours old)
// Protected by CRON_SECRET when it is set; otherwise only the Vercel cron can call it.
const nodemailer = require('nodemailer');
const L = require('./_lib');

const T = {
  en: {
    subject: 'Thank you ✨ Melissa Photography Paris',
    hi: n => `Hi ${n},`,
    p1: 'Thank you again for trusting me, I hope you love your photos as much as I do!',
    p2: 'If you have two minutes, a short Google review would help me enormously: your words are how other people find me.',
    btn: '★ Leave a Google review',
    p3: 'And if you share a photo on Instagram, tag me @melissa_photography_paris, it always makes my day.',
    sign: 'With all my gratitude,', foot: 'Paris · French, English, Arabic', dir: 'ltr',
  },
  fr: {
    subject: 'Merci ✨ Melissa Photography Paris',
    hi: n => `Bonjour ${n},`,
    p1: 'Merci encore pour votre confiance, j’espère que vos photos vous plaisent autant qu’à moi !',
    p2: 'Si vous avez deux minutes, un petit avis sur Google m’aiderait énormément : c’est grâce à vos mots que d’autres personnes me trouvent.',
    btn: '★ Laisser un avis Google',
    p3: 'Et si vous partagez une photo sur Instagram, identifiez-moi @melissa_photography_paris, ça me fait toujours très plaisir.',
    sign: 'Avec toute ma gratitude,', foot: 'Paris · français, anglais, arabe', dir: 'ltr',
  },
  ar: {
    subject: 'شكراً ✨ Melissa Photography Paris',
    hi: n => `مرحباً ${n}،`,
    p1: 'شكراً مرة أخرى على ثقتكم، أتمنى أن تعجبكم الصور بقدر ما أعجبتني!',
    p2: 'إذا كان لديكم دقيقتان، فإن تقييماً قصيراً على Google سيساعدني كثيراً: بفضل كلماتكم يجدني أشخاص آخرون.',
    btn: '★ اكتبوا تقييماً على Google',
    p3: 'وإذا شاركتم صورة على إنستغرام، أشيروا إليّ ‎@melissa_photography_paris، فهذا يسعدني دائماً.',
    sign: 'مع خالص امتناني،', foot: 'باريس · العربية والفرنسية والإنجليزية', dir: 'rtl',
  },
};

function html(t, name) {
  const al = t.dir === 'rtl' ? 'right' : 'left';
  const p = s => `<p style="margin:0 0 14px;">${L.esc(s)}</p>`;
  return `<!doctype html><html dir="${t.dir}"><body style="margin:0;padding:0;background:#7ab8cb;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#7ab8cb;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" dir="${t.dir}" style="width:100%;max-width:600px;background:#fdf6ea;border:3px solid #1f3a4d;border-radius:14px;">
<tr><td align="center" style="padding:22px 24px 14px;background:#f6c3cf;border-radius:11px 11px 0 0;border-bottom:3px solid #1f3a4d;">
<div style="font-family:Georgia,serif;font-size:26px;font-weight:bold;font-style:italic;color:#1f3a4d;" dir="ltr">&#9728; Melissa Photography Paris</div>
<div style="font-family:Arial,sans-serif;font-size:11px;font-weight:bold;letter-spacing:3px;color:#a83a5a;text-transform:uppercase;padding-top:6px;" dir="ltr">Proposals &middot; Weddings &middot; Couples</div></td></tr>
<tr><td style="padding:0;"><img src="${L.SITE}/images/email/louvre-couple.jpg" width="600" alt="" style="display:block;width:100%;max-width:600px;height:auto;border:0;"></td></tr>
<tr><td style="padding:26px 30px 6px;font-family:Georgia,serif;font-size:17px;line-height:1.6;color:#1f3a4d;text-align:${al};">
${p(t.hi(name))}${p(t.p1)}${p(t.p2)}</td></tr>
<tr><td align="center" style="padding:6px 24px 14px;"><a href="${L.REVIEW_URL}" style="display:inline-block;padding:14px 26px;background:#1f3a4d;color:#fdf6ea;font-family:Georgia,serif;font-style:italic;font-weight:bold;font-size:17px;text-decoration:none;border-radius:999px;">${L.esc(t.btn)}</a></td></tr>
<tr><td style="padding:8px 30px 22px;font-family:Georgia,serif;font-size:17px;line-height:1.6;color:#1f3a4d;text-align:${al};">
${p(t.p3)}<p style="margin:0 0 4px;">${L.esc(t.sign)}</p><p style="margin:0;font-size:22px;font-style:italic;font-weight:bold;color:#a83a5a;">Melissa</p></td></tr>
<tr><td align="center" style="padding:14px 24px;background:#1f3a4d;border-radius:0 0 11px 11px;font-family:Arial,sans-serif;font-size:12px;line-height:1.6;color:#fdf6ea;">
<a href="${L.SITE}/" style="color:#fdf6ea;">melissaphotographyparis.fr</a> &middot; <a href="${L.INSTA}" style="color:#fdf6ea;">@melissa_photography_paris</a><br>${L.esc(t.foot)}</td></tr>
</table></td></tr></table></body></html>`;
}
const text = (t, name) => [t.hi(name), '', t.p1, '', t.p2, L.REVIEW_URL, '', t.p3, '', t.sign, 'Melissa', 'Melissa Photography Paris'].join('\n');

const say = text => L.tg('sendMessage', { chat_id: process.env.TELEGRAM_CHAT_ID, text, parse_mode: 'HTML', disable_web_page_preview: true });

module.exports = async (req, res) => {
  const auth = req.headers.authorization || '';
  if (process.env.CRON_SECRET ? auth !== `Bearer ${process.env.CRON_SECRET}` : !/vercel-cron/i.test(req.headers['user-agent'] || '')) { res.status(401).end(); return; }
  if (!L.hasDb()) { res.status(200).json({ skipped: 'no database' }); return; }
  const out = { reviews: 0, reminders: 0, errors: [] };
  const ago = h => new Date(Date.now() - h * 3600e3).toISOString();

  // 1. review requests
  try {
    const due = await L.sb(`leads?status=eq.delivered&review_sent_at=is.null&email=not.is.null&delivered_at=lte.${ago(48)}&select=*`);
    if (due.length && process.env.MAIL_USER && process.env.MAIL_APP_PASSWORD) {
      const tx = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_APP_PASSWORD } });
      for (const l of due) {
        const t = T[L.langCode(l.lang || l.language)];
        try {
          await tx.sendMail({ from: { name: 'Melissa Photography Paris', address: process.env.MAIL_USER }, to: l.email, replyTo: process.env.MAIL_USER, subject: t.subject, text: text(t, l.name), html: html(t, l.name) });
          await L.sb(`leads?id=eq.${l.id}`, { method: 'PATCH', body: JSON.stringify({ review_sent_at: new Date().toISOString() }), headers: { Prefer: 'return=minimal' } });
          await say(`⭐ Demande d’avis envoyée à <b>${L.esc(l.name)}</b> (${L.esc(l.email)}).`);
          out.reviews++;
        } catch (e) { out.errors.push('mail ' + e.message); await say(`❌ La demande d’avis à ${L.esc(l.name)} n’est pas partie (${L.esc(e.message.slice(0, 120))}).`); }
      }
    }
  } catch (e) { out.errors.push('reviews ' + e.message); }

  // 2. unanswered requests, one reminder each
  try {
    const late = await L.sb(`leads?status=eq.new&reminded_at=is.null&created_at=lte.${ago(8)}&select=*&order=created_at.asc`);
    if (late.length) {
      await say(`⏰ <b>${late.length === 1 ? '1 demande attend' : late.length + ' demandes attendent'} ta réponse</b>\n\n` +
        late.map(l => `• ${L.esc(l.name)} : ${L.esc(l.session)} (${L.esc(l.contact)})`).join('\n') +
        '\n\nQuand c’est fait, touche « ✉️ Répondu » sous la demande.');
      const ids = late.map(l => l.id).join(',');
      await L.sb(`leads?id=in.(${ids})`, { method: 'PATCH', body: JSON.stringify({ reminded_at: new Date().toISOString() }), headers: { Prefer: 'return=minimal' } });
      out.reminders = late.length;
    }
  } catch (e) { out.errors.push('reminders ' + e.message); }

  console.log('daily:', JSON.stringify(out));
  res.status(200).json(out);
};
