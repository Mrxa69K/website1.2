// Blog settings: labels and categories. The articles themselves live in scripts/posts/*.json
// (one file per article, all languages inside). Build with:  node scripts/build-shop-pages.js
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'posts');
const posts = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort().reverse()
  .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
  .filter(p => !p.draft);

module.exports = {
  ui: {
    en: { blog: 'Blog', blogTitle: "Melissa's notebook", blogLede: 'Spots, tips and real stories from proposals, weddings and couple sessions in Paris.', read: 'Read', by: 'By Melissa, proposal photographer in Paris', tipsTitle: 'Good to know', ctaTitle: 'Planning yours?', ctaText: "Tell me your idea in the order envelope. I'll help you pick the spot and the time, and I'll hide in the crowd for the yes.", ctaBtn: 'Book a proposal shoot', ctaMore: 'See the proposal page', back: 'All articles', practical: 'Practical', mapBtn: 'Open in Maps', all: 'All', minRead: n => `${n} min read`, toc: 'In this article', updatedOn: 'Updated', related: 'Keep reading', authorTitle: 'About the author', authorBio: 'Melissa is a proposal, wedding and couple photographer based in Paris. She speaks French, English and Arabic and has been photographing real moments across the city for four years.', authorLink: 'More about Melissa', share: 'Share', sources: 'Sources', featured: 'Latest article', promo: 'Blog readers: 5 extra edited photos with the code CARNET, for any session booked by 31 December 2026. The button below applies it for you.' },
    fr: { blog: 'Blog', blogTitle: 'Le carnet de Melissa', blogLede: 'Des lieux, des conseils et de vraies histoires de demandes en mariage, de mariages et de séances couple à Paris.', read: 'Lire', by: 'Par Melissa, photographe de demandes en mariage à Paris', tipsTitle: 'Bon à savoir', ctaTitle: 'Vous préparez la vôtre ?', ctaText: "Racontez-moi votre idée dans l'enveloppe de commande. Je vous aide à choisir le lieu et l'heure, et je me cache dans la foule pour le oui.", ctaBtn: 'Réserver une demande en mariage', ctaMore: 'Voir la page demande en mariage', back: 'Tous les articles', practical: 'Pratique', mapBtn: 'Ouvrir dans Maps', all: 'Tout', minRead: n => `${n} min de lecture`, toc: 'Au sommaire', updatedOn: 'Mis à jour le', related: 'À lire aussi', authorTitle: 'L’autrice', authorBio: 'Melissa est photographe de demandes en mariage, de mariages et de couples à Paris. Elle parle français, anglais et arabe, et photographie les vrais moments de la ville depuis quatre ans.', authorLink: 'En savoir plus sur Melissa', share: 'Partager', sources: 'Sources', featured: 'Dernier article', promo: 'Lecteurs du carnet : 5 photos retouchées en plus avec le code CARNET, pour toute séance réservée avant le 31 décembre 2026. Le bouton ci-dessous l’applique pour vous.' },
    ar: { blog: 'المدونة', blogTitle: 'دفتر ميليسا', blogLede: 'أماكن ونصائح وقصص حقيقية من طلبات الزواج والأعراس وجلسات الأزواج في باريس.', read: 'اقرأوا', by: 'بقلم ميليسا، مصوّرة طلبات الزواج في باريس', tipsTitle: 'معلومات مفيدة', ctaTitle: 'تحضّرون طلبكم؟', ctaText: 'احكوا لي فكرتكم في ظرف الطلب. سأساعدكم في اختيار المكان والتوقيت، وسأختبئ بين الحشود لألتقط لحظة «نعم».', ctaBtn: 'احجزوا تصوير طلب الزواج', ctaMore: 'صفحة طلبات الزواج', back: 'كل المقالات', practical: 'معلومات عملية', mapBtn: 'افتحوا في الخرائط', all: 'الكل', minRead: n => `${n} دقائق للقراءة`, toc: 'في هذا المقال', updatedOn: 'آخر تحديث', related: 'اقرأوا أيضاً', authorTitle: 'عن الكاتبة', authorBio: 'ميليسا مصوّرة طلبات زواج وأعراس وأزواج مقيمة في باريس. تتحدث العربية والفرنسية والإنجليزية، وتصوّر اللحظات الحقيقية في المدينة منذ أربع سنوات.', authorLink: 'المزيد عن ميليسا', share: 'شاركوا', sources: 'المصادر', featured: 'أحدث مقال', promo: 'لقرّاء المدونة: 5 صور معدّلة إضافية مع الرمز CARNET، لكل جلسة تُحجز قبل 31 ديسمبر 2026. الزر أدناه يطبّقه لكم تلقائياً.' },
  },
  categories: {
    places: { en: 'Places', fr: 'Lieux', ar: 'أماكن' },
    prices: { en: 'Prices & advice', fr: 'Prix et conseils', ar: 'الأسعار والنصائح' },
    weddings: { en: 'Weddings', fr: 'Mariages', ar: 'الأعراس' },
    stories: { en: 'Real stories', fr: 'Vraies histoires', ar: 'قصص حقيقية' },
  },
  posts,
};
