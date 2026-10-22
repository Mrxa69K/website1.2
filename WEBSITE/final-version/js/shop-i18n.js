/* Melissa's Photography Paris - translations for the shop.
 *
 * The page is written in English. Every English string below is looked up
 * as-is (same spelling, same punctuation) and swapped for French or Arabic.
 * To change a translation, edit the fr / ar value. To add a new sentence to
 * the page, add it here with the exact English text as the key.
 * Strings with {placeholders} are templates used by shop.js.
 */
window.SHOP_I18N = {
  langs: ['en', 'fr', 'ar'],
  meta: {
    en: {
      title: "Melissa's Photography Paris · Proposal & Wedding Photographer",
      description: 'Proposal, wedding, couple and event photographer in Paris. Discreet, natural photos at Bir-Hakeim, by the Eiffel Tower, the Palais-Royal and beyond. Speaks French, English and Arabic. Proposals from €290.',
    },
    fr: {
      title: "Melissa's Photography Paris · Photographe demande en mariage & mariage",
      description: "Photographe de demande en mariage, mariage, couple et événements à Paris. Des photos discrètes et naturelles à Bir-Hakeim, près de la tour Eiffel, au Palais-Royal et ailleurs. Français, anglais et arabe. Demandes dès 290 €.",
    },
    ar: {
      title: 'ميليسا للتصوير باريس · مصوّرة طلبات الزواج والأعراس',
      description: 'مصوّرة طلبات زواج وأعراس وأزواج ومناسبات في باريس. صور طبيعية وبتكتّم عند جسر بير حكيم وقرب برج إيفل وفي القصر الملكي وغيرها. أتحدث الفرنسية والإنجليزية والعربية. طلبات الزواج ابتداءً من 290 €.',
    },
  },
  // names of the languages, as written in each UI language
  langNames: {
    en: { fr: 'French', en: 'English', ar: 'Arabic' },
    fr: { fr: 'français', en: 'anglais', ar: 'arabe' },
    ar: { fr: 'الفرنسية', en: 'الإنجليزية', ar: 'العربية' },
  },
  dict: {
    // ---------- storefront ----------
    'Proposals & Weddings': { fr: 'Demandes & Mariages', ar: 'طلبات الزواج والأعراس' },
    'Portraits & Couples': { fr: 'Portraits & Couples', ar: 'بورتريه وأزواج' },
    'Open': { fr: 'Ouvert', ar: 'مفتوح' },
    'Enter': { fr: 'Entrer', ar: 'ادخلوا' },
    'The door is open, darling. Come on in.': { fr: 'La porte est ouverte. Entrez, je vous attends !', ar: 'الباب مفتوح يا أعزّائي، تفضّلوا بالدخول.' },
    'Choose your language': { fr: 'Choisissez votre langue', ar: 'اختاروا لغتكم' },

    // ---------- top bar ----------
    'Catalogue': { fr: 'Catalogue', ar: 'الكتالوج' },
    'About me': { fr: 'Qui suis-je', ar: 'من أنا' },
    'Book': { fr: 'Réserver', ar: 'احجزوا' },
    'Shop': { fr: 'Boutique', ar: 'المتجر' },

    // ---------- welcome ----------
    'Welcome in!': { fr: 'Bienvenue chez moi !', ar: 'أهلاً وسهلاً!' },
    'Welcome': { fr: 'Bienvenue', ar: 'أهلاً' },
    'in!': { fr: 'chez moi !', ar: 'وسهلاً!' },
    'Illustration: the sun rising behind the Arc de Triomphe and the Eiffel Tower, a man on one knee proposing': {
      fr: "Illustration : le soleil se lève derrière l'Arc de Triomphe et la tour Eiffel, un homme à genoux fait sa demande",
      ar: 'رسم: الشمس تشرق خلف قوس النصر وبرج إيفل، ورجل جاثٍ على ركبته يطلب يد حبيبته',
    },
    'Rated 5 out of 5 on Airbnb': { fr: 'Noté 5 sur 5 sur Airbnb', ar: 'تقييم 5 من 5 على Airbnb' },
    'Speaks French, English and Arabic': { fr: 'Parle français, anglais et arabe', ar: 'تتحدث الفرنسية والإنجليزية والعربية' },
    'Come on in': { fr: 'Entrez donc', ar: 'تفضّلوا' },

    // ---------- two doors ----------
    "So, what'll it be?": { fr: 'Alors, on commence par quoi ?', ar: 'إذن، ماذا تختارون؟' },
    'Two doors. Pick the one that feels right.': { fr: 'Deux portes. Choisissez celle qui vous parle.', ar: 'بابان. اختاروا الذي يناسبكم.' },
    'Do you wanna get to know me?': { fr: 'Envie de me connaître ?', ar: 'هل تريدون التعرّف عليّ؟' },
    "Who's behind the camera, how I shoot, and the languages I'll chat with you in.": {
      fr: "Qui se cache derrière l'appareil, ma façon de photographier, et les langues dans lesquelles on peut discuter.",
      ar: 'من وراء الكاميرا، كيف أصوّر، واللغات التي يمكننا التحدث بها.',
    },
    'Meet Melissa': { fr: 'Rencontrer Melissa', ar: 'تعرّفوا على ميليسا' },
    'Do you wanna see the catalogue?': { fr: 'Envie de voir le catalogue ?', ar: 'هل تريدون رؤية الكتالوج؟' },
    'Family-style albums of love stories, plus concerts and fight nights after dark.': {
      fr: "Des albums de famille remplis d'histoires d'amour, plus des concerts et des soirées de combat à la nuit tombée.",
      ar: 'ألبومات عائلية لقصص حب، وحفلات موسيقية وليالي نزالات بعد حلول الظلام.',
    },
    'Browse the shelf': { fr: "Parcourir l'étagère", ar: 'تصفّحوا الرفّ' },
    'Already know what you want? Book a session': { fr: 'Vous savez déjà ce que vous voulez ? Réservez une séance', ar: 'تعرفون ما تريدون؟ احجزوا جلسة' },

    // ---------- catalogue ----------
    'The Catalogue': { fr: 'Le catalogue', ar: 'الكتالوج' },
    "Pick an album off the shelf and flip through it, just like the one at your grandma's.": {
      fr: "Prenez un album sur l'étagère et feuilletez-le, comme celui de chez votre grand-mère.",
      ar: 'اختاروا ألبوماً من الرفّ وتصفّحوه، تماماً مثل ألبوم بيت الجدّة.',
    },
    'Love stories': { fr: "Histoires d'amour", ar: 'قصص حب' },
    'After dark': { fr: 'À la nuit tombée', ar: 'بعد الغروب' },
    'Front-row concerts and fight nights, shot in the dark and in the moment.': {
      fr: 'Concerts au premier rang et soirées de combat, saisis dans le noir et sur le vif.',
      ar: 'حفلات من الصف الأول وليالي نزالات، مصوّرة في العتمة وفي اللحظة.',
    },
    'Prices are starting points. Every session ends in a private online gallery.': {
      fr: 'Les prix sont des points de départ. Chaque séance se termine par une galerie privée en ligne.',
      ar: 'الأسعار ابتدائية. كل جلسة تنتهي بمعرض خاص على الإنترنت.',
    },
    'Open the {title} album, {price}': { fr: "Ouvrir l'album {title}, {price}", ar: 'افتحوا ألبوم {title}، {price}' },

    // ---------- album ----------
    '← Back to the shelf': { fr: "← Retour à l'étagère", ar: '→ العودة إلى الرفّ' },
    'Book this': { fr: 'Réserver', ar: 'احجزوا هذه' },
    'Photo album. Use the arrow buttons or swipe to turn pages.': {
      fr: 'Album photo. Utilisez les flèches ou glissez pour tourner les pages.',
      ar: 'ألبوم صور. استخدموا الأسهم أو اسحبوا لقلب الصفحات.',
    },
    'Previous page': { fr: 'Page précédente', ar: 'الصفحة السابقة' },
    'Next page': { fr: 'Page suivante', ar: 'الصفحة التالية' },
    'Cover': { fr: 'Couverture', ar: 'الغلاف' },
    'The end': { fr: 'Fin', ar: 'النهاية' },
    'Pages {a}–{b} of {n}': { fr: 'Pages {a}–{b} sur {n}', ar: 'الصفحات {a}–{b} من {n}' },
    'Swipe or tap the arrows to turn the page. Tap a photo to zoom in.': {
      fr: "Glissez ou touchez les flèches pour tourner la page. Touchez une photo pour l'agrandir.",
      ar: 'اسحبوا أو اضغطوا على الأسهم لقلب الصفحة. اضغطوا على صورة لتكبيرها.',
    },
    'Photo album': { fr: 'Album photo', ar: 'ألبوم صور' },
    'Want your story in an album like this?': { fr: 'Envie de votre histoire dans un album comme celui-ci ?', ar: 'هل تريدون قصتكم في ألبوم كهذا؟' },
    'Book a session': { fr: 'Réserver une séance', ar: 'احجزوا جلسة' },
    'your photo here': { fr: 'votre photo ici', ar: 'صورتكم هنا' },
    'This spot is saving room for yours.': { fr: 'Cette place vous attend.', ar: 'هذا المكان محجوز لصورتكم.' },
    'Close photo': { fr: 'Fermer la photo', ar: 'إغلاق الصورة' },
    'Photo': { fr: 'Photo', ar: 'صورة' },

    // album titles, notes and captions
    'Proposals': { fr: 'Demandes', ar: 'طلبات الزواج' },
    'Weddings': { fr: 'Mariages', ar: 'الأعراس' },
    'Portraits': { fr: 'Portraits', ar: 'بورتريه' },
    'Concerts': { fr: 'Concerts', ar: 'حفلات' },
    'Sport': { fr: 'Sport', ar: 'رياضة' },
    'Hidden in the crowd, waiting for the knee to drop.': { fr: 'Cachée dans la foule, à attendre que le genou touche le sol.', ar: 'مختبئة بين الحشود، أنتظر لحظة الركوع.' },
    'The whole day, from the first look to the last dance.': { fr: 'Toute la journée, du premier regard à la dernière danse.', ar: 'اليوم كله، من النظرة الأولى إلى الرقصة الأخيرة.' },
    'Just you, good light, and a city that loves the camera.': { fr: "Juste vous, une belle lumière, et une ville qui adore l'objectif.", ar: 'أنتم فقط، وضوء جميل، ومدينة تعشق الكاميرا.' },
    'Front row, no flash, all feeling.': { fr: "Premier rang, sans flash, que de l'émotion.", ar: 'الصف الأول، بلا فلاش، كلّه إحساس.' },
    'Combat sports, mat-side, catching every grip.': { fr: 'Sports de combat, au bord du tapis, chaque prise saisie.', ar: 'رياضات القتال، بجانب البساط، ألتقط كل قبضة.' },
    'Trocadéro, after dark': { fr: 'Trocadéro, à la nuit tombée', ar: 'تروكاديرو، بعد الغروب' },
    'Candles & a yes': { fr: 'Des bougies et un oui', ar: 'شموع وكلمة نعم' },
    'Sunset at the Troca': { fr: 'Coucher de soleil au Troca', ar: 'الغروب في التروكاديرو' },
    'When the tower sparkles': { fr: 'Quand la tour scintille', ar: 'حين يتلألأ البرج' },
    'Louvre arcades': { fr: 'Les arcades du Louvre', ar: 'أروقة اللوفر' },
    'Off as fiancés': { fr: 'Repartis fiancés', ar: 'غادرا خطيبين' },
    'At the château gates': { fr: 'Aux grilles du château', ar: 'عند بوابة القصر' },
    'Showing off the rings': { fr: "Les alliances à l'honneur", ar: 'استعراض الخواتم' },
    'Just married!': { fr: 'Jeunes mariés !', ar: 'عروسان للتو!' },
    'A walk in the woods': { fr: 'Balade en forêt', ar: 'نزهة في الغابة' },
    'Paris, pink sky': { fr: 'Paris, ciel rose', ar: 'باريس، سماء وردية' },
    'Hand in hand': { fr: 'Main dans la main', ar: 'يداً بيد' },
    'Lace and a ring': { fr: 'De la dentelle et une bague', ar: 'دانتيل وخاتم' },
    'Golden light': { fr: 'Lumière dorée', ar: 'ضوء ذهبي' },
    'Evening in the city': { fr: 'Un soir en ville', ar: 'مساء في المدينة' },
    "The sky's the limit": { fr: 'Le ciel pour seule limite', ar: 'السماء هي الحدّ' },
    'Couples count too': { fr: 'Les couples aussi', ar: 'للأزواج نصيب أيضاً' },
    'Fever 333, red hot': { fr: 'Fever 333, chauffé à blanc', ar: 'Fever 333، في أوج الحماس' },
    'Celia Maqam, the band': { fr: 'Celia Maqam, le groupe', ar: 'Celia Maqam، الفرقة' },
    'Game face': { fr: 'Concentration maximale', ar: 'تركيز تام' },
    'On the mat': { fr: 'Sur le tapis', ar: 'على البساط' },
    'Between rounds': { fr: 'Entre deux rounds', ar: 'بين الجولات' },
    'After the fight': { fr: 'Après le combat', ar: 'بعد النزال' },

    // prices
    'from {price}': { fr: 'dès {price}', ar: 'من {price}' },
    'from': { fr: 'dès', ar: 'من' },

    // ---------- about me ----------
    'Cartoon of Melissa, curly hair, navy blazer, holding her video camera': {
      fr: 'Dessin de Melissa, cheveux bouclés, blazer bleu marine, avec sa caméra',
      ar: 'رسم لميليسا بشعر مجعّد وسترة كحلية وهي تحمل كاميرتها',
    },
    "Hi, I'm Melissa!": { fr: "Coucou, moi c'est Melissa !", ar: 'مرحباً، أنا ميليسا!' },
    "I've spent four years chasing real moments across Paris: the shaky hands before a proposal, the laugh right after \"oui\", the quiet second between rounds on a fight night. I stay discreet so you can just be yourselves.": {
      fr: 'Depuis quatre ans, je cours après les vrais moments dans Paris : les mains qui tremblent avant une demande, le fou rire juste après le « oui », la seconde de silence entre deux rounds un soir de combat. Je reste discrète pour que vous puissiez simplement être vous-mêmes.',
      ar: 'منذ أربع سنوات وأنا ألاحق اللحظات الحقيقية في باريس: الأيدي المرتجفة قبل طلب الزواج، والضحكة بعد «نعم» مباشرة، واللحظة الهادئة بين جولتين في ليلة نزال. أبقى متحفّظة لتكونوا على طبيعتكم.',
    },
    'What I shoot': { fr: 'Ce que je photographie', ar: 'ماذا أصوّر' },
    'Proposals (with or without the full "MARRY ME" lights setup), weddings, couples, portraits, private events and combat sports.': {
      fr: 'Demandes en mariage (avec ou sans les lettres lumineuses « MARRY ME »), mariages, couples, portraits, événements privés et sports de combat.',
      ar: 'طلبات الزواج (مع أو بدون حروف «MARRY ME» المضيئة)، الأعراس، الأزواج، البورتريه، المناسبات الخاصة ورياضات القتال.',
    },
    'My style': { fr: 'Mon style', ar: 'أسلوبي' },
    'Natural and authentic. Warm colour, a bit of black and white, and the in-between moments nobody posed for.': {
      fr: "Naturel et authentique. Des couleurs chaudes, un peu de noir et blanc, et ces petits moments entre deux que personne n'a posés.",
      ar: 'طبيعي وصادق. ألوان دافئة، قليل من الأبيض والأسود، واللحظات العابرة التي لم يتصنّعها أحد.',
    },
    "Let's talk in": { fr: 'On peut se parler en', ar: 'لنتحدث بـ' },
    "Where you'll find me": { fr: 'Où me trouver', ar: 'أين تجدونني' },
    'Bir-Hakeim, the Allée des Cygnes, the Palais-Royal, Montmartre and the banks of the Seine.': {
      fr: 'Bir-Hakeim, l’allée des Cygnes, le Palais-Royal, Montmartre et les quais de Seine.',
      ar: 'بير حكيم، ممشى البجع، القصر الملكي، مونمارتر وضفاف نهر السين.',
    },
    'See my albums': { fr: 'Voir mes albums', ar: 'شاهدوا ألبوماتي' },
    'Book me': { fr: 'Me réserver', ar: 'احجزوني' },

    // ---------- booking ----------
    'Place your order': { fr: 'Passez commande', ar: 'اطلبوا جلستكم' },
    "Fill in the photo-lab envelope and I'll get back to you within 24 hours.": {
      fr: "Remplissez l'enveloppe du labo photo, je vous réponds sous 24 h.",
      ar: 'املؤوا ظرف المختبر وسأردّ عليكم خلال 24 ساعة.',
    },
    'Order envelope': { fr: 'Enveloppe de commande', ar: 'ظرف الطلب' },
    'Paris · Photo lab': { fr: 'Paris · Labo photo', ar: 'باريس · مختبر الصور' },
    '1 · Choose your session': { fr: '1 · Choisissez votre séance', ar: '1 · اختاروا جلستكم' },
    '2 · Your name': { fr: '2 · Votre nom', ar: '2 · اسمكم' },
    '3 · Email or WhatsApp': { fr: '3 · E-mail ou WhatsApp', ar: '3 · البريد الإلكتروني أو واتساب' },
    '4 · Preferred date': { fr: '4 · Date souhaitée', ar: '4 · التاريخ المفضّل' },
    '5 · Language': { fr: '5 · Langue', ar: '5 · اللغة' },
    '6 · Tell me the story': { fr: '6 · Racontez-moi votre histoire', ar: '6 · احكوا لي القصة' },
    'He has no idea. Bir-Hakeim at sunset?': { fr: 'Il ne se doute de rien. Bir-Hakeim au coucher du soleil ?', ar: 'لا يعلم شيئاً. بير حكيم عند الغروب؟' },
    'Add your name and an email or WhatsApp number so I can reply.': {
      fr: 'Ajoutez votre nom et un e-mail ou un numéro WhatsApp pour que je puisse vous répondre.',
      ar: 'أضيفوا اسمكم وبريداً إلكترونياً أو رقم واتساب لأتمكن من الرد.',
    },
    'Send my order': { fr: 'Envoyer ma commande', ar: 'إرسال الطلب' },
    'I reply within 24 hours, in your language.': { fr: 'Je réponds sous 24 h, dans votre langue.', ar: 'أردّ خلال 24 ساعة بلغتكم.' },
    'Dear Melissa,': { fr: 'Chère Melissa,', ar: 'عزيزتي ميليسا،' },
    "We'd love a {session} session on {date}, in {lang}.": {
      fr: 'Nous aimerions une séance « {session} » le {date}, en {lang}.',
      ar: 'نودّ حجز جلسة «{session}» بتاريخ {date}، باللغة {lang}.',
    },
    "We'd love a {session} session, on a date we pick together, in {lang}.": {
      fr: 'Nous aimerions une séance « {session} », à une date à choisir ensemble, en {lang}.',
      ar: 'نودّ حجز جلسة «{session}» في تاريخ نختاره معاً، باللغة {lang}.',
    },
    'a date we pick together': { fr: 'date à choisir ensemble', ar: 'تاريخ نختاره معاً' },
    'Sent!': { fr: 'Envoyée !', ar: 'تم الإرسال!' },
    '{session}, {date}, in {lang}. Melissa will reply at {contact} within 24 hours.': {
      fr: '{session}, {date}, en {lang}. Melissa vous répondra sur {contact} sous 24 h.',
      ar: '{session}، {date}، باللغة {lang}. سترد ميليسا على {contact} خلال 24 ساعة.',
    },
    "No reply after a day? Check your spam folder, or message me on Instagram.": {
      fr: 'Pas de réponse au bout d’un jour ? Regardez dans vos spams, ou écrivez-moi sur Instagram.',
      ar: 'لم يصلكم رد بعد يوم؟ تفقّدوا الرسائل غير المرغوب فيها أو راسلوني على إنستغرام.',
    },
    'Fill in another envelope': { fr: 'Remplir une autre enveloppe', ar: 'ملء ظرف آخر' },
    'The envelope came back': { fr: "L'enveloppe est revenue", ar: 'عاد الظرف' },
    'Something went wrong on the way. Try again, or send me a message on Instagram.': {
      fr: 'Un souci en chemin. Réessayez, ou écrivez-moi sur Instagram.',
      ar: 'حدث خطأ في الطريق. حاولوا مجدداً أو راسلوني على إنستغرام.',
    },
    'Try again': { fr: 'Réessayer', ar: 'إعادة المحاولة' },
    'Message me on Instagram': { fr: "M'écrire sur Instagram", ar: 'راسلوني على إنستغرام' },
    'Sending…': { fr: 'Envoi…', ar: 'جارٍ الإرسال…' },

    // sessions
    'Couple session': { fr: 'Séance couple', ar: 'جلسة للأزواج' },
    '1h30 · 25+ photos': { fr: '1h30 · 25+ photos', ar: 'ساعة ونصف · +25 صورة' },
    'Proposal': { fr: 'Demande en mariage', ar: 'طلب زواج' },
    '1h · 20+ photos · 24h delivery': { fr: '1h · 20+ photos · livrées en 24 h', ar: 'ساعة · +20 صورة · تسليم خلال 24 ساعة' },
    'Proposal + decoration': { fr: 'Demande + décoration', ar: 'طلب زواج + ديكور' },
    '2h · lights, candles, carpet': { fr: '2h · lumières, bougies, tapis', ar: 'ساعتان · أضواء، شموع، سجادة' },
    'Wedding, full day': { fr: 'Mariage, journée complète', ar: 'عرس، يوم كامل' },
    '8–10h · 200+ photos': { fr: '8–10h · 200+ photos', ar: '8–10 ساعات · +200 صورة' },
    'Wedding, half day': { fr: 'Mariage, demi-journée', ar: 'عرس، نصف يوم' },
    '6h · 120+ photos': { fr: '6h · 120+ photos', ar: '6 ساعات · +120 صورة' },
    'Town hall wedding': { fr: 'Mariage à la mairie', ar: 'عقد القران في البلدية' },
    '3–4h · 80+ photos': { fr: '3–4h · 80+ photos', ar: '3–4 ساعات · +80 صورة' },
    'Concert or event': { fr: 'Concert ou événement', ar: 'حفلة أو مناسبة' },
    '2h · 60+ photos': { fr: '2h · 60+ photos', ar: 'ساعتان · +60 صورة' },
    'Competition coverage': { fr: 'Couverture de compétition', ar: 'تغطية المنافسات' },

    // ---------- ArtyDrop ----------
    "Sponsored: ArtyDrop, Melissa's official gallery partner": {
      fr: 'Sponsorisé : ArtyDrop, partenaire officiel des galeries de Melissa',
      ar: 'إعلان ممول: ArtyDrop، الشريك الرسمي لمعارض ميليسا',
    },
    'first gallery': { fr: '1re galerie', ar: 'أول معرض' },
    '€1': { fr: '1 €', ar: '1 €' },
    'try it': { fr: "à l'essai", ar: 'جرّبوه' },
    'Sponsored': { fr: 'Sponsorisé', ar: 'إعلان ممول' },
    'Official gallery partner': { fr: 'Partenaire galerie officiel', ar: 'الشريك الرسمي للمعارض' },
    'Your photos, delivered beautifully.': { fr: 'Vos photos, livrées en beauté.', ar: 'صوركم، تصلكم بأجمل حلّة.' },
    'Every Melissa gallery arrives on ArtyDrop: private, full resolution, yours to keep.': {
      fr: 'Chaque galerie de Melissa arrive sur ArtyDrop : privée, en pleine résolution, à garder pour toujours.',
      ar: 'كل معارض ميليسا تصل عبر ArtyDrop: خاصة، بدقة كاملة، ولكم للأبد.',
    },
    'Password-protected, full-res downloads': { fr: 'Protégée par mot de passe, téléchargement en pleine résolution', ar: 'محمية بكلمة مرور، وتحميل بالدقة الكاملة' },
    'Favourites, views and downloads, all tracked': { fr: 'Favoris, vues et téléchargements, tout est suivi', ar: 'المفضلة والمشاهدات والتحميلات، كلها مُتابَعة' },
    'Clients can buy prints or leave a tip': { fr: 'Les clients peuvent acheter des tirages ou laisser un pourboire', ar: 'يمكن للعملاء شراء الصور المطبوعة أو ترك إكرامية' },
    'No subscription. Pay per gallery.': { fr: 'Sans abonnement. On paie par galerie.', ar: 'بدون اشتراك. الدفع لكل معرض.' },
    '48 photos': { fr: '48 photos', ar: '48 صورة' },
    'on ArtyDrop': { fr: 'sur ArtyDrop', ar: 'على ArtyDrop' },
    'Download all': { fr: 'Tout télécharger', ar: 'تحميل الكل' },
    'Photographers: your first gallery for €1': { fr: 'Photographes : votre première galerie à 1 €', ar: 'للمصورين: أول معرض لكم بـ 1 €' },
    '20 photos, live for 7 days. Then from €4.90 a gallery, no subscription.': {
      fr: '20 photos, en ligne 7 jours. Ensuite dès 4,90 € la galerie, sans abonnement.',
      ar: '20 صورة، متاحة لمدة 7 أيام. بعدها من 4.90 € للمعرض، بدون اشتراك.',
    },
    'Try it for €1': { fr: 'Essayer pour 1 €', ar: 'جرّبوه بـ 1 €' },

    // ---------- footer ----------
    'This shop needs JavaScript to open its door. You can still reach Melissa on': {
      fr: "Cette boutique a besoin de JavaScript pour ouvrir sa porte. Vous pouvez toujours joindre Melissa sur",
      ar: 'يحتاج هذا المتجر إلى JavaScript ليفتح بابه. يمكنكم دائماً التواصل مع ميليسا عبر',
    },
    'Terms of use': { fr: "Conditions d'utilisation", ar: 'شروط الاستخدام' },
    'Privacy': { fr: 'Confidentialité', ar: 'الخصوصية' },
  },
};
