// Content of the service pages (one per service and language).
// Edit the text here, then run:  node scripts/build-shop-pages.js
// Prices must match SESSIONS in js/shop.js.

const P = '/images/shop/';

module.exports = {
  // labels shared by every service page
  ui: {
    en: {
      home: 'Home', book: 'Book this session', album: 'Open the album', included: 'What you get', price: 'Price',
      faq: 'Questions people ask', more: 'Other sessions', finalTitle: 'Tell me your story',
      finalText: "Fill in the order envelope and I'll reply within 24 hours, in French, English or Arabic.",
      reviews: 'Rated 5.0 by 12 clients on Airbnb', catalogue: 'Catalogue', about: 'About me', bookNav: 'Book',
      from: p => `from ${p}`, money: n => '€' + n.toLocaleString('en-US'),
    },
    fr: {
      home: 'Accueil', book: 'Réserver cette séance', album: "Ouvrir l'album", included: 'Ce qui est inclus', price: 'Tarif',
      faq: 'Les questions qu’on me pose', more: 'Les autres séances', finalTitle: 'Racontez-moi votre histoire',
      finalText: "Remplissez l'enveloppe de commande, je vous réponds sous 24 h, en français, en anglais ou en arabe.",
      reviews: 'Noté 5,0 par 12 clients sur Airbnb', catalogue: 'Catalogue', about: 'Qui suis-je', bookNav: 'Réserver',
      from: p => `dès ${p}`, money: n => n.toLocaleString('fr-FR').replace(/ | /g, ' ') + ' €',
    },
    ar: {
      home: 'الرئيسية', book: 'احجزوا هذه الجلسة', album: 'افتحوا الألبوم', included: 'ماذا تحصلون عليه', price: 'السعر',
      faq: 'أسئلة متكررة', more: 'جلسات أخرى', finalTitle: 'احكوا لي قصتكم',
      finalText: 'املؤوا ظرف الطلب وسأردّ عليكم خلال 24 ساعة، بالعربية أو الفرنسية أو الإنجليزية.',
      reviews: 'تقييم 5.0 من 12 عميلاً على Airbnb', catalogue: 'الكتالوج', about: 'من أنا', bookNav: 'احجزوا',
      from: p => `ابتداءً من ${p}`, money: n => n.toLocaleString('en-US') + ' €',
    },
  },

  services: [
    // ------------------------------------------------------------------ proposals
    {
      key: 'proposal', album: 'proposals', session: 's-prop',
      slug: { en: 'proposal-photographer-paris', fr: 'photographe-demande-en-mariage-paris', ar: 'proposal-photographer-paris' },
      photos: [
        [P + 'proposal-16.webp', { en: 'He kneels at Trocadéro, the Eiffel Tower lit up behind them', fr: 'Il pose un genou à terre au Trocadéro, la tour Eiffel illuminée derrière eux', ar: 'يركع في تروكاديرو وبرج إيفل مضاء خلفهما' }, { en: 'Trocadéro, after dark', fr: 'Trocadéro, à la nuit tombée', ar: 'تروكاديرو، بعد الغروب' }],
        [P + 'proposal-13.webp', { en: 'Marriage proposal surrounded by candles in Paris', fr: 'Demande en mariage entourée de bougies à Paris', ar: 'طلب زواج محاط بالشموع في باريس' }, { en: 'Candles & a yes', fr: 'Des bougies et un oui', ar: 'شموع وكلمة نعم' }],
        [P + 'proposal-proposal2.webp', { en: 'Proposal at sunset at Trocadéro', fr: 'Demande en mariage au coucher du soleil au Trocadéro', ar: 'طلب زواج عند الغروب في تروكاديرو' }, { en: 'Sunset at the Troca', fr: 'Coucher de soleil au Troca', ar: 'الغروب في التروكاديرو' }],
        [P + 'proposal-22.webp', { en: 'Newly engaged couple while the Eiffel Tower sparkles', fr: 'Jeunes fiancés pendant que la tour Eiffel scintille', ar: 'خطيبان جديدان بينما يتلألأ برج إيفل' }, { en: 'When the tower sparkles', fr: 'Quand la tour scintille', ar: 'حين يتلألأ البرج' }],
        [P + 'proposal-2.webp', { en: 'Proposal under the Louvre arcades', fr: 'Demande en mariage sous les arcades du Louvre', ar: 'طلب زواج تحت أروقة اللوفر' }, { en: 'Louvre arcades', fr: 'Les arcades du Louvre', ar: 'أروقة اللوفر' }],
        [P + 'proposal-7.webp', { en: 'The couple walking away engaged', fr: 'Le couple repart fiancé', ar: 'الخطيبان يغادران معاً' }, { en: 'Off as fiancés', fr: 'Repartis fiancés', ar: 'غادرا خطيبين' }],
      ],
      packages: [
        { name: { en: 'Proposal', fr: 'Demande en mariage', ar: 'طلب زواج' }, info: { en: '1h · 20+ photos · 24h delivery', fr: '1h · 20+ photos · livrées en 24 h', ar: 'ساعة · +20 صورة · تسليم خلال 24 ساعة' }, price: 290, from: true, session: 's-prop' },
        { name: { en: 'Proposal + decoration', fr: 'Demande + décoration', ar: 'طلب زواج + ديكور' }, info: { en: '2h · lights, candles, carpet', fr: '2h · lumières, bougies, tapis', ar: 'ساعتان · أضواء، شموع، سجادة' }, price: 690, from: true, session: 's-propdeco' },
      ],
      en: {
        nav: 'Proposal photographer',
        title: 'Proposal Photographer in Paris · Surprise Proposals & Engagement Photos · Melissa',
        desc: 'Secret and surprise proposal photographer in Paris, also for engagement photos: Bir-Hakeim, the Eiffel Tower, the Palais-Royal. 20+ photos delivered within 24 hours. French, English, Arabic. From €290.',
        h1: 'Proposal photographer in Paris',
        lede: 'You plan the question, I hide in the crowd and catch the yes. Discreet proposal photos at Bir-Hakeim, by the Eiffel Tower, at the Palais-Royal or along the Seine, delivered within 24 hours.',
        story: [
          "Before the big day we choose the spot and the timing together, in French, English or Arabic. You'll know exactly where I'll be standing, and your partner won't suspect a thing: to them I'm just another tourist with a camera.",
          'When the knee drops, I photograph the whole moment: the surprise, the tears, the ring, the hug. Then we take a few relaxed portraits of the two of you, with Paris right behind you.',
          'Want the full fairytale? I can also set up the decoration for you: lights, candles, flowers, a carpet, or the big "MARRY ME" letters.',
        ],
        included: ['1 hour on location', '20+ edited photos', 'Delivered within 24 hours', 'A private online gallery to download and share', 'Help choosing the spot and the right time'],
        faq: [
          ['Where are the best places to propose in Paris?', 'My favourite is the Bir-Hakeim bridge, with the Allée des Cygnes just below it. Avenue de Camoëns, Square du Vert-Galant and the Palais-Royal are lovely too. I avoid Trocadéro: it is far too crowded for such a personal moment. Read my full guide on the blog.'],
          ['How will my partner not notice you?', 'We agree on the exact spot and a signal beforehand. I arrive early, blend in with the other visitors and start shooting from a distance, then come closer once the yes is said.'],
          ['What if it rains?', 'We watch the forecast together. We can move the time, or pick a covered spot such as the Louvre arcades.'],
          ['When do we get the photos?', 'Within 24 hours, in a private online gallery you can download and share with family and friends.'],
          ['Do you also do engagement photos?', 'Yes. If you are already engaged, the couple session (1h30, 25+ photos, from €250) is perfect for engagement photos in Paris, by the Eiffel Tower or in a quieter spot.'],
        ],
      },
      fr: {
        nav: 'Photographe demande en mariage',
        title: 'Photographe demande en mariage à Paris : surprise, lieux et prix · Melissa',
        desc: 'Photographe discrète pour votre demande en mariage à Paris : tour Eiffel, Trocadéro, Bir-Hakeim, Louvre. 20+ photos livrées en 24 h. Français, anglais, arabe. Dès 290 €.',
        h1: 'Photographe de demande en mariage à Paris',
        lede: 'Vous préparez la question, je me cache dans la foule et je capture le oui. Des photos discrètes de votre demande à Bir-Hakeim, près de la tour Eiffel, au Palais-Royal ou sur les quais de Seine, livrées en 24 h.',
        story: [
          "Avant le grand jour, on choisit ensemble le lieu et l'heure, en français, en anglais ou en arabe. Vous saurez exactement où je me trouve, et votre moitié ne se doutera de rien : pour elle, je ne suis qu'une touriste de plus avec un appareil photo.",
          "Quand le genou touche le sol, je photographie tout le moment : la surprise, les larmes, la bague, l'étreinte. Ensuite, on fait quelques portraits détendus de vous deux, avec Paris juste derrière.",
          'Envie du conte de fées complet ? Je peux aussi installer la décoration : lumières, bougies, fleurs, tapis, ou les grandes lettres « MARRY ME ».',
        ],
        included: ['1 heure sur place', '20+ photos retouchées', 'Livrées en 24 h', 'Une galerie privée en ligne pour télécharger et partager', "Mes conseils pour choisir le lieu et l'heure"],
        faq: [
          ['Quels sont les plus beaux endroits pour une demande à Paris ?', "Mon préféré, c'est le pont de Bir-Hakeim, avec l'allée des Cygnes juste en dessous. L'avenue de Camoëns, le square du Vert-Galant et le Palais-Royal sont superbes aussi. J'évite le Trocadéro : il y a beaucoup trop de monde pour un moment aussi intime. Lisez mon guide complet sur le blog."],
          ['Comment faire pour que ma moitié ne vous remarque pas ?', "On convient à l'avance du lieu exact et d'un signal. J'arrive en avance, je me fonds parmi les visiteurs et je commence à photographier de loin, puis je m'approche une fois le oui prononcé."],
          ['Et s’il pleut ?', "On surveille la météo ensemble. On peut décaler l'heure, ou choisir un endroit abrité comme les arcades du Louvre."],
          ['Quand recevons-nous les photos ?', 'Sous 24 h, dans une galerie privée en ligne que vous pouvez télécharger et partager avec vos proches.'],
          ['Combien coûte une photographe de demande en mariage à Paris ?', "Chez moi, une demande commence à 290 € (1 h, 20+ photos, livrées en 24 h). Sur le marché parisien, comptez en général de 200 € à plus de 500 € pour une heure. J'explique tout dans mon article sur les prix, sur le blog."],
        ],
      },
      ar: {
        nav: 'مصوّرة طلبات الزواج',
        title: 'مصوّرة طلبات الزواج في باريس · ميليسا للتصوير',
        desc: 'مصوّرة متحفّظة لطلب الزواج في باريس: برج إيفل، تروكاديرو، بير حكيم، اللوفر. أكثر من 20 صورة تُسلَّم خلال 24 ساعة. العربية والفرنسية والإنجليزية. ابتداءً من 290 €.',
        h1: 'مصوّرة طلبات الزواج في باريس',
        lede: 'أنتم تحضّرون السؤال، وأنا أختبئ بين الحشود لألتقط لحظة «نعم». صور متحفّظة لطلب الزواج عند جسر بير حكيم أو قرب برج إيفل أو في القصر الملكي أو على ضفاف السين، تصلكم خلال 24 ساعة.',
        story: [
          'قبل اليوم الكبير نختار معاً المكان والتوقيت، بالعربية أو الفرنسية أو الإنجليزية. ستعرفون بالضبط أين سأقف، ولن يشكّ شريككم في شيء: بالنسبة له أنا مجرد سائحة أخرى تحمل كاميرا.',
          'عندما تركعون، أصوّر اللحظة كاملة: المفاجأة، الدموع، الخاتم، والعناق. ثم نلتقط بعض الصور الهادئة لكما معاً وباريس خلفكما.',
          'تريدون الحكاية كاملة؟ يمكنني أيضاً تجهيز الديكور: أضواء، شموع، زهور، سجادة، أو حروف «MARRY ME» الكبيرة.',
        ],
        included: ['ساعة في المكان', 'أكثر من 20 صورة معدّلة', 'التسليم خلال 24 ساعة', 'معرض خاص على الإنترنت للتحميل والمشاركة', 'مساعدة في اختيار المكان والتوقيت المناسب'],
        faq: [
          ['ما هي أجمل الأماكن لطلب الزواج في باريس؟', 'المكان المفضل لدي هو جسر بير حكيم، مع ممشى البجع (Allée des Cygnes) أسفله مباشرة. شارع كامويش وحديقة فير غالان والقصر الملكي (Palais-Royal) جميلة أيضاً. أتجنب تروكاديرو: فهو مزدحم جداً للحظة بهذه الخصوصية.'],
          ['كيف لن يلاحظكِ شريكي؟', 'نتفق مسبقاً على المكان بالضبط وعلى إشارة. أصل مبكراً وأندمج بين الزوار وأبدأ التصوير من بعيد، ثم أقترب بعد قول «نعم».'],
          ['ماذا لو أمطرت؟', 'نتابع حالة الطقس معاً. يمكننا تغيير الموعد أو اختيار مكان مسقوف مثل أروقة اللوفر.'],
          ['متى نستلم الصور؟', 'خلال 24 ساعة، في معرض خاص على الإنترنت يمكنكم تحميله ومشاركته مع العائلة والأصدقاء.'],
        ],
      },
    },

    // ------------------------------------------------------------------ weddings
    {
      key: 'wedding', album: 'weddings', session: 's-wed',
      slug: { en: 'wedding-photographer-paris', fr: 'photographe-mariage-paris', ar: 'wedding-photographer-paris' },
      photos: [
        [P + 'wedding-016.webp', { en: 'Bride and groom at the gates of a château near Paris', fr: "Les mariés devant les grilles d'un château près de Paris", ar: 'العروسان أمام بوابة قصر قرب باريس' }, { en: 'At the château gates', fr: 'Aux grilles du château', ar: 'عند بوابة القصر' }],
        [P + 'wedding-013.webp', { en: 'The couple showing their wedding rings', fr: 'Les mariés montrent leurs alliances', ar: 'العروسان يعرضان خاتمي الزواج' }, { en: 'Showing off the rings', fr: "Les alliances à l'honneur", ar: 'استعراض الخواتم' }],
        [P + 'wedding-09.webp', { en: 'Just married couple celebrating', fr: 'Les jeunes mariés font la fête', ar: 'العروسان يحتفلان بعد الزواج مباشرة' }, { en: 'Just married!', fr: 'Jeunes mariés !', ar: 'عروسان للتو!' }],
        [P + 'wedding-03.webp', { en: 'Wedding couple walking in the woods', fr: 'Les mariés se promènent en forêt', ar: 'العروسان يتنزّهان في الغابة' }, { en: 'A walk in the woods', fr: 'Balade en forêt', ar: 'نزهة في الغابة' }],
        [P + 'wedding-2.webp', { en: 'Bride and groom under a pink Paris sky', fr: 'Les mariés sous un ciel rose à Paris', ar: 'العروسان تحت سماء وردية في باريس' }, { en: 'Paris, pink sky', fr: 'Paris, ciel rose', ar: 'باريس، سماء وردية' }],
        [P + 'wedding-019.webp', { en: 'Newlyweds hand in hand', fr: 'Les mariés main dans la main', ar: 'العروسان يداً بيد' }, { en: 'Hand in hand', fr: 'Main dans la main', ar: 'يداً بيد' }],
      ],
      packages: [
        { name: { en: 'Town hall wedding', fr: 'Mariage à la mairie', ar: 'عقد القران في البلدية' }, info: { en: '3 to 4h · 80+ photos', fr: '3 à 4 h · 80+ photos', ar: 'من 3 إلى 4 ساعات · +80 صورة' }, price: 800, session: 's-wed-hall' },
        { name: { en: 'Wedding, half day', fr: 'Mariage, demi-journée', ar: 'عرس، نصف يوم' }, info: { en: '6h · 120+ photos', fr: '6h · 120+ photos', ar: '6 ساعات · +120 صورة' }, price: 1300, session: 's-wed-half' },
        { name: { en: 'Wedding, full day', fr: 'Mariage, journée complète', ar: 'عرس، يوم كامل' }, info: { en: '8 to 10h · 200+ photos', fr: '8 à 10 h · 200+ photos', ar: 'من 8 إلى 10 ساعات · +200 صورة' }, price: 1900, session: 's-wed' },
      ],
      en: {
        nav: 'Wedding photographer',
        title: 'Wedding Photographer in Paris · Packages from €800 · Melissa Photography',
        desc: 'Natural, warm wedding photography in Paris and Île-de-France, from the town hall to the last dance. French, English and Arabic speaking. Packages from €800.',
        h1: 'Wedding photographer in Paris',
        lede: 'From the town hall to the last dance: natural, warm wedding photos in Paris and Île-de-France, by a photographer who speaks French, English and Arabic.',
        story: [
          'I photograph your day as it happens: getting ready, the first look, the vows, the family hugs, the party. Very little posing, lots of real moments, warm colour and a touch of black and white.',
          'Two families, two cultures? Because I speak French, English and Arabic, I can talk with everyone, guide the group photos quickly and catch the traditions that matter on both sides.',
          'Every wedding is delivered in a private online gallery, in full resolution and easy to share with your guests.',
        ],
        included: ['Coverage from 3 hours to the whole day', 'Edited photos in colour and black and white', 'Group and family photos, guided calmly', 'A private online gallery for you and your guests', 'One call beforehand to plan the day'],
        faq: [
          ['Can you photograph just the town hall ceremony?', 'Yes. The town hall package covers 3 to 4 hours: the ceremony, family photos and a short couple session afterwards.'],
          ['How far ahead should we book?', 'For a Saturday between May and September, as early as possible. For a town hall ceremony on a weekday, a few weeks is often enough.'],
          ['Do you travel outside Paris?', 'Yes, around Paris and Île-de-France, châteaux included. Tell me your venue in the order envelope and I will confirm.'],
          ['We are a bilingual or multicultural couple. Is that a problem?', 'Quite the opposite. I speak French, English and Arabic, so both families can talk to me directly on the day.'],
        ],
      },
      fr: {
        nav: 'Photographe mariage',
        title: 'Photographe mariage à Paris : tarifs dès 800 € · Melissa Photography',
        desc: "Photographe de mariage à Paris et en Île-de-France, naturel et chaleureux, de la mairie à la dernière danse. Français, anglais et arabe. Formules dès 800 €.",
        h1: 'Photographe de mariage à Paris',
        lede: "De la mairie à la dernière danse : des photos de mariage naturelles et chaleureuses à Paris et en Île-de-France, par une photographe qui parle français, anglais et arabe.",
        story: [
          'Je photographie votre journée telle qu’elle se passe : les préparatifs, la découverte, les vœux, les embrassades en famille, la fête. Très peu de pose, beaucoup de vrais moments, des couleurs chaudes et une touche de noir et blanc.',
          "Deux familles, deux cultures ? Comme je parle français, anglais et arabe, je peux échanger avec tout le monde, organiser vite les photos de groupe et saisir les traditions qui comptent des deux côtés.",
          'Chaque mariage est livré dans une galerie privée en ligne, en pleine résolution, facile à partager avec vos invités.',
        ],
        included: ["De 3 heures à la journée complète", 'Photos retouchées en couleur et en noir et blanc', 'Photos de groupe et de famille, organisées dans le calme', 'Une galerie privée en ligne pour vous et vos invités', 'Un appel avant le jour J pour tout préparer'],
        faq: [
          ['Pouvez-vous photographier seulement la cérémonie à la mairie ?', 'Oui. La formule mairie couvre 3 à 4 heures : la cérémonie, les photos de famille et une courte séance de couple juste après.'],
          ['Combien de temps à l’avance faut-il réserver ?', "Pour un samedi entre mai et septembre, le plus tôt possible. Pour un mariage civil en semaine, quelques semaines suffisent souvent."],
          ['Vous déplacez-vous en dehors de Paris ?', "Oui, autour de Paris et en Île-de-France, châteaux compris. Indiquez votre lieu dans l'enveloppe de commande et je vous confirme."],
          ['Nous sommes un couple bilingue ou mixte, est-ce un souci ?', "Bien au contraire. Je parle français, anglais et arabe, les deux familles peuvent me parler directement le jour J."],
        ],
      },
      ar: {
        nav: 'مصوّرة أعراس',
        title: 'مصوّرة أعراس في باريس · ميليسا للتصوير',
        desc: 'تصوير أعراس طبيعي ودافئ في باريس وإيل دو فرانس، من البلدية إلى الرقصة الأخيرة. العربية والفرنسية والإنجليزية. باقات ابتداءً من 800 €.',
        h1: 'مصوّرة أعراس في باريس',
        lede: 'من البلدية إلى الرقصة الأخيرة: صور أعراس طبيعية ودافئة في باريس وإيل دو فرانس، مع مصوّرة تتحدث العربية والفرنسية والإنجليزية.',
        story: [
          'أصوّر يومكم كما يحدث: التحضيرات، النظرة الأولى، العهود، أحضان العائلة، والحفلة. قليل من الوضعيات وكثير من اللحظات الحقيقية، بألوان دافئة ولمسة من الأبيض والأسود.',
          'عائلتان وثقافتان؟ بما أنني أتحدث العربية والفرنسية والإنجليزية، أستطيع التواصل مع الجميع وتنظيم صور المجموعات بسرعة والتقاط التقاليد المهمة لدى الطرفين.',
          'يُسلَّم كل عرس في معرض خاص على الإنترنت، بدقة كاملة ويسهل مشاركته مع الضيوف.',
        ],
        included: ['تغطية من 3 ساعات إلى يوم كامل', 'صور معدّلة بالألوان وبالأبيض والأسود', 'صور جماعية وعائلية منظّمة بهدوء', 'معرض خاص على الإنترنت لكم ولضيوفكم', 'مكالمة قبل اليوم الكبير للتحضير'],
        faq: [
          ['هل يمكنكِ تصوير عقد القران في البلدية فقط؟', 'نعم. باقة البلدية تغطي من 3 إلى 4 ساعات: المراسم، صور العائلة وجلسة قصيرة للعروسين بعدها.'],
          ['كم من الوقت مسبقاً يجب أن نحجز؟', 'ليوم سبت بين مايو وسبتمبر، في أقرب وقت ممكن. لعقد قران في أيام الأسبوع، تكفي غالباً بضعة أسابيع.'],
          ['هل تتنقلين خارج باريس؟', 'نعم، حول باريس وفي إيل دو فرانس، بما في ذلك القصور. اذكروا مكان الحفل في ظرف الطلب وسأؤكد لكم.'],
          ['نحن زوجان من ثقافتين مختلفتين، هل هذه مشكلة؟', 'على العكس تماماً. أتحدث العربية والفرنسية والإنجليزية، فتستطيع العائلتان التحدث معي مباشرة يوم العرس.'],
        ],
      },
    },

    // ------------------------------------------------------------------ couples & portraits
    {
      key: 'couple', album: 'portraits', session: 's-couple',
      slug: { en: 'couple-photographer-paris', fr: 'photographe-couple-paris', ar: 'couple-photographer-paris' },
      photos: [
        [P + 'proposal-proposal3.webp', { en: 'Couple photo session in Paris with the Eiffel Tower', fr: 'Séance photo de couple à Paris avec la tour Eiffel', ar: 'جلسة تصوير لزوجين في باريس مع برج إيفل' }, { en: 'Couples count too', fr: 'Les couples aussi', ar: 'للأزواج نصيب أيضاً' }],
        [P + 'portrait-2p.webp', { en: 'Portrait in golden light in Paris', fr: 'Portrait en lumière dorée à Paris', ar: 'بورتريه في ضوء ذهبي في باريس' }, { en: 'Golden light', fr: 'Lumière dorée', ar: 'ضوء ذهبي' }],
        [P + 'portrait-5p.webp', { en: 'Evening portrait in the city', fr: 'Portrait du soir en ville', ar: 'بورتريه مسائي في المدينة' }, { en: 'Evening in the city', fr: 'Un soir en ville', ar: 'مساء في المدينة' }],
        [P + 'portrait-6p.webp', { en: 'Portrait against the Paris sky', fr: 'Portrait sur fond de ciel parisien', ar: 'بورتريه على خلفية سماء باريس' }, { en: "The sky's the limit", fr: 'Le ciel pour seule limite', ar: 'السماء هي الحدّ' }],
      ],
      packages: [
        { name: { en: 'Couple session', fr: 'Séance couple', ar: 'جلسة للأزواج' }, info: { en: '1h30 · 25+ photos', fr: '1h30 · 25+ photos', ar: 'ساعة ونصف · +25 صورة' }, price: 250, from: true, session: 's-couple' },
      ],
      en: {
        nav: 'Couple photographer',
        title: 'Couple Photoshoot in Paris with the Eiffel Tower · Couple Photographer · Melissa',
        desc: 'Relaxed couple and portrait photo sessions in Paris: 1h30, 25+ photos, Eiffel Tower, Louvre, Montmartre. Anniversaries, honeymoons, engagements. French, English, Arabic. From €250.',
        h1: 'Couple & portrait photographer in Paris',
        lede: 'A Paris couple photoshoot: a relaxed 1h30 walk for the two of you, or just you, by the Eiffel Tower or somewhere quieter, and 25+ photos that actually look like you.',
        story: [
          "No stiff posing. We walk, we talk, and I guide you gently: where to stand, where to look, when to just laugh. Most people forget the camera after ten minutes.",
          'Perfect for an anniversary, a honeymoon in Paris, engagement photos or simply a souvenir of your trip. Solo portraits are welcome too.',
          'We choose the route together: Trocadéro, Bir-Hakeim, the Louvre arcades, Montmartre or the banks of the Seine.',
        ],
        included: ['1h30 photo walk', '25+ edited photos', 'A route chosen together', 'A private online gallery to download and share', 'Gentle posing guidance in French, English or Arabic'],
        faq: [
          ['What time of day is best?', 'Early morning for empty streets and soft light, or the hour before sunset for golden light. Both are lovely; mornings are quieter.'],
          ['What should we wear?', 'Something you feel good in. Plain colours and soft tones work best; avoid big logos. A second outfit is fine if you want a change of look.'],
          ["We're shy in front of a camera. Is that OK?", 'Totally. Most couples are. I talk you through every step and keep things light, so it feels like a walk, not a shoot.'],
          ['Can I book a solo portrait?', 'Yes, the same session works for one person: portraits for yourself, your social media or your work.'],
        ],
      },
      fr: {
        nav: 'Photographe couple',
        title: 'Shooting photo couple à Paris et tour Eiffel · Photographe couple · Melissa',
        desc: "Séance photo couple ou portrait à Paris, détendue : 1h30, 25+ photos, tour Eiffel, Louvre, Montmartre. Anniversaire, lune de miel, fiançailles. Français, anglais, arabe. Dès 250 €.",
        h1: 'Photographe couple et portrait à Paris',
        lede: "Un shooting photo couple à Paris : une balade d'1 h 30 à deux, ou en solo, face à la tour Eiffel ou dans un coin plus calme, et plus de 25 photos qui vous ressemblent vraiment.",
        story: [
          "Pas de pose figée. On marche, on discute, et je vous guide en douceur : où vous placer, où regarder, quand simplement rire. La plupart des gens oublient l'appareil au bout de dix minutes.",
          'Idéal pour un anniversaire, une lune de miel à Paris, des photos de fiançailles ou simplement un souvenir de votre voyage. Les portraits en solo sont aussi les bienvenus.',
          "On choisit le parcours ensemble : Trocadéro, Bir-Hakeim, les arcades du Louvre, Montmartre ou les quais de Seine.",
        ],
        included: ['1h30 de balade photo', '25+ photos retouchées', 'Un parcours choisi ensemble', 'Une galerie privée en ligne pour télécharger et partager', 'Des conseils de pose en douceur, en français, anglais ou arabe'],
        faq: [
          ['Quel est le meilleur moment de la journée ?', "Tôt le matin pour des rues vides et une lumière douce, ou l'heure avant le coucher du soleil pour la lumière dorée. Les deux sont superbes ; le matin est plus calme."],
          ['Comment s’habiller ?', "Avec ce dans quoi vous vous sentez bien. Les couleurs unies et les tons doux rendent le mieux ; évitez les gros logos. Une deuxième tenue est possible si vous voulez changer de style."],
          ['Nous sommes timides devant l’objectif, c’est grave ?', "Pas du tout, c'est le cas de la plupart des couples. Je vous guide à chaque étape et on garde une ambiance légère : ça ressemble à une balade, pas à un shooting."],
          ['Puis-je réserver un portrait solo ?', 'Oui, la même séance fonctionne pour une personne : des portraits pour vous, vos réseaux sociaux ou votre travail.'],
        ],
      },
      ar: {
        nav: 'مصوّرة أزواج',
        title: 'مصوّرة أزواج وبورتريه في باريس · ميليسا للتصوير',
        desc: 'جلسات تصوير هادئة للأزواج والبورتريه في باريس: ساعة ونصف، أكثر من 25 صورة، برج إيفل، اللوفر، مونمارتر. ذكرى زواج، شهر عسل، خطوبة. ابتداءً من 250 €.',
        h1: 'مصوّرة أزواج وبورتريه في باريس',
        lede: 'نزهة هادئة لمدة ساعة ونصف في باريس لكما معاً، أو لكم وحدكم، وأكثر من 25 صورة تشبهكم حقاً.',
        story: [
          'بلا وضعيات متصنّعة. نمشي ونتحدث، وأوجّهكم بلطف: أين تقفون، إلى أين تنظرون، ومتى تضحكون فقط. أغلب الناس ينسون الكاميرا بعد عشر دقائق.',
          'مثالية لذكرى الزواج، أو شهر العسل في باريس، أو صور الخطوبة، أو ببساطة ذكرى من رحلتكم. جلسات البورتريه الفردية مرحّب بها أيضاً.',
          'نختار المسار معاً: تروكاديرو، بير حكيم، أروقة اللوفر، مونمارتر أو ضفاف نهر السين.',
        ],
        included: ['نزهة تصوير لمدة ساعة ونصف', 'أكثر من 25 صورة معدّلة', 'مسار نختاره معاً', 'معرض خاص على الإنترنت للتحميل والمشاركة', 'توجيه لطيف بالعربية أو الفرنسية أو الإنجليزية'],
        faq: [
          ['ما أفضل وقت في اليوم؟', 'الصباح الباكر لشوارع خالية وضوء ناعم، أو الساعة التي تسبق الغروب للضوء الذهبي. كلاهما جميل؛ والصباح أهدأ.'],
          ['ماذا نرتدي؟', 'ما تشعرون فيه بالراحة. الألوان السادة والدرجات الهادئة هي الأفضل؛ تجنّبوا الشعارات الكبيرة. يمكنكم إحضار طقم ثانٍ لتغيير الإطلالة.'],
          ['نحن خجولون أمام الكاميرا، هل هذا مقبول؟', 'بالتأكيد، فهذا حال معظم الأزواج. أرافقكم في كل خطوة ونحافظ على أجواء خفيفة، فتبدو الجلسة كنزهة لا كتصوير.'],
          ['هل يمكنني حجز جلسة بورتريه فردية؟', 'نعم، الجلسة نفسها تصلح لشخص واحد: صور لكم أو لحساباتكم على مواقع التواصل أو لعملكم.'],
        ],
      },
    },

    // ------------------------------------------------------------------ concerts & events
    {
      key: 'concert', album: 'concerts', session: 's-event',
      slug: { en: 'concert-photographer-paris', fr: 'photographe-concert-evenement-paris', ar: 'concert-photographer-paris' },
      photos: [
        [P + 'live-fever333.webp', { en: 'Fever 333 singer on stage at Lollapalooza Paris 2023', fr: 'Le chanteur de Fever 333 sur scène au Lollapalooza Paris 2023', ar: 'مغني Fever 333 على المسرح في لولابالوزا باريس 2023' }, { en: 'Fever 333, Lollapalooza Paris 2023', fr: 'Fever 333, Lollapalooza Paris 2023', ar: 'Fever 333، لولابالوزا باريس 2023' }],
        [P + 'live-guitar.webp', { en: 'Guitarist on stage at Lollapalooza Paris', fr: 'Guitariste sur scène au Lollapalooza Paris', ar: 'عازف غيتار على المسرح في لولابالوزا باريس' }, { en: 'Fever 333, Lollapalooza', fr: 'Fever 333, Lollapalooza', ar: 'Fever 333، لولابالوزا' }],
        [P + 'live-celia.webp', { en: 'Celia Maqam singing live', fr: 'Celia Maqam chante en live', ar: 'Celia Maqam تغني مباشرة' }, { en: 'Celia Maqam', fr: 'Celia Maqam', ar: 'Celia Maqam' }],
        [P + 'live-owen.webp', { en: 'Owen performing at Lollapalooza Paris 2023', fr: 'Owen sur scène au Lollapalooza Paris 2023', ar: 'Owen على المسرح في لولابالوزا باريس 2023' }, { en: 'Owen, Lollapalooza Paris 2023', fr: 'Owen, Lollapalooza Paris 2023', ar: 'Owen، لولابالوزا باريس 2023' }],
        [P + 'live-kader.webp', { en: 'Kader on stage', fr: 'Kader sur scène', ar: 'Kader على المسرح' }, { en: 'Kader', fr: 'Kader', ar: 'Kader' }],
        [P + 'live-chemsou.webp', { en: 'Chemsou Freeklane performing live', fr: 'Chemsou Freeklane en concert', ar: 'Chemsou Freeklane في حفل مباشر' }, { en: 'Chemsou Freeklane', fr: 'Chemsou Freeklane', ar: 'Chemsou Freeklane' }],
      ],
      packages: [
        { name: { en: 'Concert or event', fr: 'Concert ou événement', ar: 'حفلة أو مناسبة' }, info: { en: '2h · 60+ photos', fr: '2h · 60+ photos', ar: 'ساعتان · +60 صورة' }, price: 300, from: true, session: 's-event' },
      ],
      en: {
        nav: 'Concert photographer',
        title: "Concert & Event Photographer in Paris · Melissa's Photography",
        desc: 'Concert, festival and event photographer in Paris: front row, no flash, all feeling. Lollapalooza Paris, live shows, private events. 60+ photos. From €300.',
        h1: 'Concert & event photographer in Paris',
        lede: 'Front row, no flash, all feeling. Concert, festival and private event photography in Paris, from Lollapalooza to intimate shows.',
        story: [
          "I've photographed Fever 333 and Owen at Lollapalooza Paris 2023, Celia Maqam, Kader and Chemsou Freeklane. I love the dark, the sweat and the second where the whole room sings along.",
          'For artists, managers and venues: photos for the press, your social media and your next poster, edited to keep the mood of the night.',
          'For private events and parties, I stay discreet and catch the people, not just the stage.',
        ],
        included: ['2 hours of coverage', '60+ edited photos', 'Low-light shooting without flash during shows', 'A private online gallery to download and share', 'Photos ready for press and social media'],
        faq: [
          ['Do you use flash?', 'Not during shows. I work with the stage light, which keeps the atmosphere and never disturbs the artists or the audience.'],
          ['Who arranges the photo pass?', 'For public concerts, the artist, the label or the organiser usually requests it. I can help you with the request.'],
          ['Can you cover a longer event?', 'Yes. The price starts at 2 hours; tell me the length of your event in the order envelope and I will send you a quote.'],
          ['Do you photograph private parties?', 'Yes: birthdays, engagement parties, company evenings. Same approach: discreet, natural and full of atmosphere.'],
        ],
      },
      fr: {
        nav: 'Photographe concert',
        title: 'Photographe concert et événement à Paris · Tarifs dès 300 € · Melissa',
        desc: "Photographe de concerts, festivals et événements à Paris : premier rang, sans flash, que de l'émotion. Lollapalooza Paris, live, soirées privées. 60+ photos. Dès 300 €.",
        h1: 'Photographe concert et événement à Paris',
        lede: "Premier rang, sans flash, que de l'émotion. Photos de concerts, de festivals et d'événements privés à Paris, du Lollapalooza aux petites salles.",
        story: [
          "J'ai photographié Fever 333 et Owen au Lollapalooza Paris 2023, Celia Maqam, Kader et Chemsou Freeklane. J'aime le noir, la sueur et cette seconde où toute la salle chante en chœur.",
          "Pour les artistes, managers et salles : des photos pour la presse, vos réseaux sociaux et votre prochaine affiche, retouchées pour garder l'ambiance de la soirée.",
          'Pour les événements privés et les soirées, je reste discrète et je photographie les gens, pas seulement la scène.',
        ],
        included: ['2 heures de couverture', '60+ photos retouchées', 'Photo en basse lumière, sans flash pendant les concerts', 'Une galerie privée en ligne pour télécharger et partager', 'Photos prêtes pour la presse et les réseaux sociaux'],
        faq: [
          ['Utilisez-vous le flash ?', "Pas pendant les concerts. Je travaille avec la lumière de scène : ça garde l'ambiance et ça ne gêne ni les artistes ni le public."],
          ['Qui s’occupe de l’accréditation photo ?', "Pour les concerts publics, c'est en général l'artiste, le label ou l'organisateur qui la demande. Je peux vous aider pour la demande."],
          ['Pouvez-vous couvrir un événement plus long ?', "Oui. Le tarif part de 2 heures ; indiquez la durée de votre événement dans l'enveloppe de commande et je vous envoie un devis."],
          ['Photographiez-vous les soirées privées ?', "Oui : anniversaires, fiançailles, soirées d'entreprise. Même approche : discrète, naturelle et pleine d'ambiance."],
        ],
      },
      ar: {
        nav: 'مصوّرة حفلات',
        title: 'مصوّرة حفلات ومناسبات في باريس · ميليسا للتصوير',
        desc: 'تصوير الحفلات الموسيقية والمهرجانات والمناسبات في باريس: الصف الأول، بلا فلاش، كلّه إحساس. لولابالوزا باريس، حفلات مباشرة، مناسبات خاصة. ابتداءً من 300 €.',
        h1: 'مصوّرة حفلات ومناسبات في باريس',
        lede: 'الصف الأول، بلا فلاش، كلّه إحساس. تصوير الحفلات الموسيقية والمهرجانات والمناسبات الخاصة في باريس، من لولابالوزا إلى الحفلات الصغيرة.',
        story: [
          'صوّرت فرقة Fever 333 والفنان Owen في لولابالوزا باريس 2023، كما صوّرت Celia Maqam، Kader، و Chemsou Freeklane. أحب العتمة والحماس وتلك اللحظة التي تغني فيها القاعة كلها معاً.',
          'للفنانين والمديرين والقاعات: صور للصحافة ولحساباتكم على مواقع التواصل ولملصقكم القادم، معدّلة لتحافظ على أجواء الليلة.',
          'في المناسبات والحفلات الخاصة، أبقى متحفّظة وألتقط الناس، لا المسرح فقط.',
        ],
        included: ['تغطية لمدة ساعتين', 'أكثر من 60 صورة معدّلة', 'تصوير في الإضاءة الخافتة بلا فلاش أثناء العروض', 'معرض خاص على الإنترنت للتحميل والمشاركة', 'صور جاهزة للصحافة ومواقع التواصل'],
        faq: [
          ['هل تستخدمين الفلاش؟', 'ليس أثناء العروض. أعمل بإضاءة المسرح، فتبقى الأجواء ولا يتضايق الفنانون ولا الجمهور.'],
          ['من يتكفّل بتصريح التصوير؟', 'في الحفلات العامة، عادةً ما يطلبه الفنان أو شركة الإنتاج أو المنظّم. يمكنني مساعدتكم في الطلب.'],
          ['هل يمكنكِ تغطية مناسبة أطول؟', 'نعم. السعر يبدأ من ساعتين؛ اذكروا مدة مناسبتكم في ظرف الطلب وسأرسل لكم عرض سعر.'],
          ['هل تصوّرين الحفلات الخاصة؟', 'نعم: أعياد الميلاد، حفلات الخطوبة، أمسيات الشركات. بنفس الأسلوب: متحفّظ وطبيعي ومليء بالأجواء.'],
        ],
      },
    },

    // ------------------------------------------------------------------ female photographer, Muslim & oriental weddings
    {"key": "oriental", "album": "weddings", "session": "s-wed", "slug": {"en": "female-muslim-wedding-photographer-paris", "fr": "photographe-femme-mariage-oriental-paris", "ar": "female-muslim-wedding-photographer-paris"}, "photos": [["/images/shop/wedding-013.webp", {"en": "Newlyweds showing their wedding rings", "fr": "Les mariés montrent leurs alliances", "ar": "العروسان يعرضان خاتمي الزواج"}, {"en": "The rings", "fr": "Les alliances", "ar": "الخواتم"}], ["/images/shop/wedding-2.webp", {"en": "Bride and groom under a pink Paris sky", "fr": "Les mariés sous un ciel rose à Paris", "ar": "العروسان تحت سماء وردية في باريس"}, {"en": "Paris, pink sky", "fr": "Paris, ciel rose", "ar": "باريس، سماء وردية"}], ["/images/shop/wedding-019.webp", {"en": "Newlyweds hand in hand", "fr": "Les mariés main dans la main", "ar": "العروسان يداً بيد"}, {"en": "Hand in hand", "fr": "Main dans la main", "ar": "يداً بيد"}]], "packages": [{"name": {"en": "Town hall wedding", "fr": "Mariage à la mairie", "ar": "عقد القران في البلدية"}, "info": {"en": "3 to 4h · 80+ photos", "fr": "3 à 4 h · 80+ photos", "ar": "من 3 إلى 4 ساعات · +80 صورة"}, "price": 800, "session": "s-wed-hall"}, {"name": {"en": "Henna night or half day", "fr": "Henné ou demi-journée", "ar": "ليلة الحنّاء أو نصف يوم"}, "info": {"en": "6h · 120+ photos", "fr": "6 h · 120+ photos", "ar": "6 ساعات · +120 صورة"}, "price": 1300, "session": "s-wed-half"}, {"name": {"en": "Wedding, full day", "fr": "Mariage, journée complète", "ar": "عرس، يوم كامل"}, "info": {"en": "8 to 10h · 200+ photos", "fr": "8 à 10 h · 200+ photos", "ar": "من 8 إلى 10 ساعات · +200 صورة"}, "price": 1900, "session": "s-wed"}], "fr": {"nav": "Photographe femme mariage oriental", "title": "Photographe femme pour mariage oriental et musulman à Paris · Melissa Photography", "desc": "Photographe femme à Paris pour mariages orientaux et musulmans : discrète, respectueuse de votre intimité, elle parle arabe, français et anglais. Henné, mairie, fête. Formules dès 800 €.", "h1": "Photographe femme pour votre mariage oriental ou musulman à Paris", "lede": "Une photographe femme qui parle arabe, français et anglais, pour photographier votre henné, votre mariage et votre fête dans le respect de votre intimité et de vos traditions.", "story": ["Dans beaucoup de familles, certains moments du mariage se vivent entre femmes : les préparatifs de la mariée, le henné, la salle des femmes. Être une femme me permet d'être là, discrètement, sans que personne ne se sente gêné.", "Je parle arabe, français et anglais. Je comprends les deux familles, je sais attendre le bon moment pendant l'entrée des mariés ou les changements de tenue, et j'organise les photos de groupe vite, sans brusquer personne.", "Vos photos restent à vous : galerie privée protégée par mot de passe, et rien n'est publié sur mes réseaux sans votre accord écrit. Si certaines invitées préfèrent ne pas être photographiées, on le prévoit ensemble avant le jour J."], "included": ["Une photographe femme pour les moments entre femmes (préparatifs, henné, salle des femmes)", "Le henné, la mairie et la fête, selon la formule choisie", "Le respect de la pudeur : on décide ensemble de ce qui peut être photographié", "Une galerie privée protégée par mot de passe, rien de publié sans votre accord", "Des échanges en arabe, en français ou en anglais avec vous et votre famille"], "faq": [["Êtes-vous vraiment une femme photographe ?", "Oui. C'est moi, Melissa, qui viens photographier votre mariage. Je ne vous envoie pas quelqu'un d'autre."], ["Publiez-vous les photos sur Instagram ?", "Jamais sans votre accord écrit. Par défaut, vos photos restent uniquement dans votre galerie privée."], ["Pouvez-vous photographier le henné et la fête sur deux jours différents ?", "Oui. On adapte les formules, par exemple une demi-journée pour le henné et la journée complète pour la fête. Décrivez votre programme dans l'enveloppe de commande et je vous envoie un devis."], ["Vous déplacez-vous dans les salles de fêtes d'Île-de-France ?", "Oui, à Paris et dans toute l'Île-de-France. Indiquez la salle dans votre message et je vous confirme."]]}, "en": {"nav": "Female wedding photographer (Muslim & oriental)", "title": "Female Photographer for Muslim & Oriental Weddings in Paris · Melissa Photography", "desc": "Female wedding photographer in Paris for Muslim and oriental weddings: discreet, respectful of your privacy, speaks Arabic, French and English. Henna night, town hall, celebration. Packages from €800.", "h1": "Female photographer for your Muslim or oriental wedding in Paris", "lede": "A female photographer who speaks Arabic, French and English, to photograph your henna night, your wedding and your celebration with respect for your privacy and your traditions.", "story": ["In many families, some moments of the wedding happen among women: the bride getting ready, the henna night, the women's hall. Being a woman means I can be there, discreetly, without anyone feeling uncomfortable.", "I speak Arabic, French and English. I understand both families, I know how to wait for the right moment during the couple's entrance or the outfit changes, and I organise group photos quickly without rushing anyone.", "Your photos stay yours: a private, password-protected gallery, and nothing is posted on my social media without your written consent. If some guests prefer not to be photographed, we plan for it together before the day."], "included": ["A female photographer for the women-only moments (getting ready, henna, women's hall)", "The henna night, town hall and celebration, depending on the package", "Respect for modesty: we agree together on what can be photographed", "A private, password-protected gallery, nothing published without your consent", "Conversations in Arabic, French or English with you and your family"], "faq": [["Are you really a female photographer?", "Yes. I, Melissa, come and photograph your wedding myself. I don't send someone else."], ["Do you post the photos on Instagram?", "Never without your written consent. By default, your photos stay only in your private gallery."], ["Can you cover the henna night and the celebration on two different days?", "Yes. We combine packages, for example a half day for the henna and a full day for the celebration. Describe your programme in the order envelope and I will send you a quote."], ["Do you travel to venues across Île-de-France?", "Yes, in Paris and all of Île-de-France. Tell me the venue in your message and I will confirm."]]}, "ar": {"nav": "مصوّرة أعراس (عربية وإسلامية)", "title": "مصوّرة امرأة للأعراس العربية والإسلامية في باريس · Melissa Photography", "desc": "مصوّرة امرأة في باريس للأعراس العربية والإسلامية: متحفّظة وتحترم خصوصيتكم، تتحدث العربية والفرنسية والإنجليزية. ليلة الحنّاء، البلدية، الحفل. باقات من 800 €.", "h1": "مصوّرة امرأة لعرسكم العربي أو الإسلامي في باريس", "lede": "مصوّرة امرأة تتحدث العربية والفرنسية والإنجليزية، لتصوير ليلة الحنّاء والعرس والحفل مع احترام خصوصيتكم وتقاليدكم.", "story": ["في كثير من العائلات، بعض لحظات العرس تكون بين النساء فقط: تجهيز العروس، ليلة الحنّاء، قاعة النساء. كوني امرأة يسمح لي بأن أكون هناك بتحفّظ، دون أن يشعر أحد بالحرج.", "أتحدث العربية والفرنسية والإنجليزية. أفهم العائلتين، وأعرف كيف أنتظر اللحظة المناسبة أثناء دخول العروسين أو تغيير الأزياء، وأنظّم الصور الجماعية بسرعة دون أن أستعجل أحداً.", "صوركم تبقى لكم: معرض خاص محمي بكلمة مرور، ولا يُنشر شيء على حساباتي دون موافقتكم المكتوبة. وإن فضّلت بعض الضيفات عدم التصوير، نرتّب ذلك معاً قبل يوم العرس."], "included": ["مصوّرة امرأة للحظات النسائية (تجهيز العروس، الحنّاء، قاعة النساء)", "ليلة الحنّاء والبلدية والحفل، حسب الباقة", "احترام الحشمة: نتفق معاً على ما يمكن تصويره", "معرض خاص محمي بكلمة مرور، ولا يُنشر شيء دون موافقتكم", "التواصل بالعربية أو الفرنسية أو الإنجليزية معكم ومع عائلتكم"], "faq": [["هل أنتِ فعلاً مصوّرة امرأة؟", "نعم. أنا ميليسا، وآتي بنفسي لتصوير عرسكم. لا أرسل شخصاً آخر."], ["هل تنشرين الصور على إنستغرام؟", "أبداً دون موافقتكم المكتوبة. بشكل افتراضي، تبقى صوركم فقط في معرضكم الخاص."], ["هل يمكنكِ تصوير الحنّاء والحفل في يومين مختلفين؟", "نعم. نجمع بين الباقات، مثلاً نصف يوم للحنّاء ويوم كامل للحفل. صفوا لي برنامجكم في ظرف الطلب وسأرسل لكم عرض سعر."], ["هل تتنقلين إلى قاعات الأفراح في إيل دو فرانس؟", "نعم، في باريس وفي كل إيل دو فرانس. اذكروا القاعة في رسالتكم وسأؤكد لكم."]]}},
  ],
};
