// "Reviews" page: real words from real clients, copied exactly as they wrote them.
// Never invent or rewrite a review. To add one, copy it into `reviews` below
// (source: 'google', 'airbnb' or 'client'), then run:
//   node scripts/build-shop-pages.js

module.exports = {
  slug: { en: 'reviews', fr: 'avis', ar: 'reviews' },
  links: {
    google: 'https://share.google/bHUUxKEcIEIxoztLe', // Google Business Profile "Melissa Photography Paris"
    airbnb: '', // paste the Airbnb listing link here to show the "See my Airbnb reviews" button
  },
  airbnb: { score: '5.0', count: 12 },

  // lang = language the client wrote in. service = key of `tags` below (optional).
  reviews: [
    { name: 'Danny & Portia', source: 'client', lang: 'en', service: 'proposal',
      text: "I truly cannot put into words how magical this moment was, My fiancé proposed to me in front of the Eiffel Tower, and he had secretly hired her to photograph the entire moment. Shes discreet, and incredibly talented, look no further. She didn’t just take pictures she gave us the gift of reliving the happiest day of our lives forever." },
    { name: 'Kevin', source: 'client', lang: 'en', service: 'proposal',
      text: 'Just saw the photos and I’m in love, everything looks magical! The setup, the Eiffel Tower, the emotions, you captured it all perfectly. Thank you for making our moment unforgettable' },
    { name: 'Rayan', source: 'client', lang: 'en', service: 'proposal',
      text: 'The Proposal was amazing. Melissa helped us pick the best spot and made us feel so comfortable.' },
    { name: 'Harmonie', source: 'client', lang: 'en',
      text: 'Fast delivery, beautiful editing, and excellent communication throughout the entire process.' },
  ],

  tags: {
    proposal: { en: 'Proposal', fr: 'Demande en mariage', ar: 'طلب زواج' },
    wedding: { en: 'Wedding', fr: 'Mariage', ar: 'عرس' },
    couple: { en: 'Couple session', fr: 'Séance couple', ar: 'جلسة أزواج' },
    portrait: { en: 'Portrait', fr: 'Portrait', ar: 'بورتريه' },
    event: { en: 'Event', fr: 'Événement', ar: 'مناسبة' },
  },
  sources: {
    google: { en: 'Google review', fr: 'Avis Google', ar: 'تقييم Google' },
    airbnb: { en: 'Airbnb review', fr: 'Avis Airbnb', ar: 'تقييم Airbnb' },
    client: { en: 'Client message', fr: 'Message client', ar: 'رسالة عميل' },
  },

  en: {
    nav: 'Reviews',
    title: 'Client reviews · Melissa Photography Paris',
    desc: 'What couples say about their proposal and portrait photos with Melissa in Paris. Rated 5.0 by 12 clients on Airbnb, with her Google reviews one click away.',
    kicker: 'Reviews',
    h1: 'What my clients say',
    lede: 'Words left by couples after their session in Paris, copied exactly as they wrote them.',
    airbnbTitle: 'On Airbnb', airbnbLine: n => `Rated 5.0 by ${n} clients`, airbnbBtn: 'See my Airbnb reviews',
    googleTitle: 'On Google', googleLine: 'My Google profile, Melissa Photography Paris: reviews, photos and directions.', googleBtn: 'Read my Google reviews',
    wallTitle: 'They wrote to me',
    origNote: '',
    leaveTitle: 'We did a session together?',
    leaveText: 'A few words on Google help other couples find me. It takes two minutes and it means a lot to me.',
    leaveBtn: 'Leave a Google review',
    leaveAirbnb: 'Booked through Airbnb? Your review there counts just as much.',
    ctaTitle: 'Your turn?', ctaBtn: 'Book a session', ctaMore: 'See the catalogue',
    pill: 'Read my clients’ reviews',
  },
  fr: {
    nav: 'Avis clients',
    title: 'Avis clients · Melissa Photography Paris, photographe à Paris',
    desc: 'Ce que disent les couples de leurs photos de demande en mariage et de portrait avec Melissa à Paris. Noté 5,0 par 12 clients sur Airbnb, et ses avis Google à un clic.',
    kicker: 'Avis clients',
    h1: 'Ce que disent mes clients',
    lede: 'Les mots laissés par des couples après leur séance à Paris, recopiés exactement comme ils les ont écrits.',
    airbnbTitle: 'Sur Airbnb', airbnbLine: n => `Noté 5,0 par ${n} clients`, airbnbBtn: 'Voir mes avis Airbnb',
    googleTitle: 'Sur Google', googleLine: 'Ma fiche Google, Melissa Photography Paris : avis, photos et itinéraire.', googleBtn: 'Lire mes avis Google',
    wallTitle: 'Ils m’ont écrit',
    origNote: 'Ces avis ont été écrits en anglais, je les laisse tels quels.',
    leaveTitle: 'On a fait une séance ensemble ?',
    leaveText: 'Quelques mots sur Google aident d’autres couples à me trouver. Ça prend deux minutes et ça compte beaucoup pour moi.',
    leaveBtn: 'Laisser un avis Google',
    leaveAirbnb: 'Réservé via Airbnb ? Votre avis là-bas compte tout autant.',
    ctaTitle: 'À votre tour ?', ctaBtn: 'Réserver une séance', ctaMore: 'Voir le catalogue',
    pill: 'Lire les avis de mes clients',
  },
  ar: {
    nav: 'آراء العملاء',
    title: 'آراء العملاء · Melissa Photography Paris، مصوّرة في باريس',
    desc: 'ماذا يقول الأزواج عن صور طلب الزواج والبورتريه مع ميليسا في باريس. تقييم 5.0 من 12 عميلاً على Airbnb، وتقييماتها على Google بنقرة واحدة.',
    kicker: 'آراء العملاء',
    h1: 'ماذا يقول عملائي',
    lede: 'كلمات تركها أزواج بعد جلستهم في باريس، منقولة كما كتبوها تماماً.',
    airbnbTitle: 'على Airbnb', airbnbLine: n => `تقييم 5.0 من ${n} عميلاً`, airbnbBtn: 'شاهدوا تقييماتي على Airbnb',
    googleTitle: 'على Google', googleLine: 'صفحتي على Google: التقييمات والصور والاتجاهات.', googleBtn: 'اقرأوا تقييماتي على Google',
    wallTitle: 'كتبوا لي',
    origNote: 'كُتبت هذه التقييمات بالإنجليزية، وتركتها كما هي.',
    leaveTitle: 'صوّرنا معاً؟',
    leaveText: 'بضع كلمات على Google تساعد أزواجاً آخرين على إيجادي. تستغرق دقيقتين وتعني لي الكثير.',
    leaveBtn: 'اتركوا تقييماً على Google',
    leaveAirbnb: 'حجزتم عبر Airbnb؟ تقييمكم هناك مهم بالقدر نفسه.',
    ctaTitle: 'دوركم الآن؟', ctaBtn: 'احجزوا جلسة', ctaMore: 'شاهدوا الكتالوج',
    pill: 'اقرأوا آراء عملائي',
  },
};
