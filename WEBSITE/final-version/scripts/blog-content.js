// Blog posts. Each post exists in English and French (Arabic can be added per post).
// Edit here, then run:  node scripts/build-shop-pages.js
// A post's "spots"/sections are rendered in order; "photo" is optional.

const P = '/images/shop/';

module.exports = {
  ui: {
    en: { blog: 'Blog', blogTitle: "Melissa's notebook", blogLede: 'Spots, tips and real stories from proposals, weddings and couple sessions in Paris.', read: 'Read', by: 'By Melissa', updated: 'Updated', tipsTitle: 'Good to know', ctaTitle: 'Planning yours?', ctaText: "Tell me your idea in the order envelope. I'll help you pick the spot and the time, and I'll hide in the crowd for the yes.", ctaBtn: 'Book a proposal shoot', ctaMore: 'See the proposal page', back: 'All articles' },
    fr: { blog: 'Blog', blogTitle: 'Le carnet de Melissa', blogLede: 'Des lieux, des conseils et de vraies histoires de demandes en mariage, de mariages et de séances couple à Paris.', read: 'Lire', by: 'Par Melissa', updated: 'Mis à jour le', tipsTitle: 'Bon à savoir', ctaTitle: 'Vous préparez la vôtre ?', ctaText: "Racontez-moi votre idée dans l'enveloppe de commande. Je vous aide à choisir le lieu et l'heure, et je me cache dans la foule pour le oui.", ctaBtn: 'Réserver une demande en mariage', ctaMore: 'Voir la page demande en mariage', back: 'Tous les articles' },
  },
  posts: [
    {
      key: 'proposal-spots',
      date: '2026-10-22',
      service: 'proposal',
      session: 's-prop',
      cover: P + 'proposal-16.webp',
      slug: { en: 'best-places-to-propose-in-paris', fr: 'ou-faire-sa-demande-en-mariage-a-paris' },
      en: {
        title: 'The 6 most beautiful places to propose in Paris (from a proposal photographer)',
        short: 'Trocadéro, Bir-Hakeim, the Louvre, Montmartre: where to kneel, when to go and how to avoid the crowds.',
        desc: 'Where to propose in Paris: Trocadéro, Bir-Hakeim, the Louvre arcades, Montmartre, Pont Alexandre III and the Seine. Best times, crowds and tips from a Paris proposal photographer.',
        intro: [
          "I photograph proposals in Paris all year round, hidden in the crowd with my camera. The question I get most often comes before the ring: where should I do it? Here are the six spots I recommend, what each one looks like on camera, and the time of day that makes it work.",
        ],
        spots: [
          { h2: '1. Trocadéro: the classic Eiffel Tower view', photo: [P + 'proposal-16.webp', 'Proposal at Trocadéro at night with the Eiffel Tower lit up', 'Trocadéro, after dark'],
            p: ['The esplanade between the two wings of the Palais de Chaillot gives you the whole Eiffel Tower behind you. It is the most famous view in Paris, which is also its weak point: it is busy from late morning to midnight.',
                'Go at sunrise if you want it almost to yourselves, or after dark for the lights. After dusk, the tower sparkles for five minutes at the start of every hour: a proposal timed on the hour is pure magic in photos.'] },
          { h2: '2. Bir-Hakeim bridge: iron, arches and the tower', photo: [P + 'proposal-22.webp', 'Couple in front of the sparkling Eiffel Tower', 'When the tower sparkles'],
            p: ['The upper deck of the Bir-Hakeim bridge has a central walkway framed by iron columns, with the Eiffel Tower just next to it. It feels more intimate than Trocadéro and the lines of the bridge make beautiful frames.',
                'Early morning is the calmest time. During the day, other couples and photographers come here too, so we pick a spot between two columns where nobody will walk through the moment.'] },
          { h2: '3. The Louvre arcades: elegant, and perfect when it rains', photo: [P + 'proposal-2.webp', 'Proposal under the stone arcades of the Louvre', 'Louvre arcades'],
            p: ['The arcades around the Louvre courtyards give long stone perspectives and soft, even light. It is my favourite plan B: if it rains, you stay dry and the photos stay beautiful.',
                'Morning is best for quiet arcades. The glass pyramid is close by if you want a second backdrop for the couple photos afterwards.'] },
          { h2: "4. Montmartre and the Wall of Love", photo: null,
            p: ["In Square Jehan-Rictus, near Abbesses metro, the Wall of Love (le mur des je t'aime) shows \"I love you\" written 311 times in 250 languages. Entry is free; the square's opening hours depend on the season, so check before you plan an early or late moment.",
                'Then walk up to the Sacré-Cœur for the view over Paris, or through the small streets around Place du Tertre. Montmartre suits couples who want something more bohemian than the Eiffel Tower.'] },
          { h2: '5. Pont Alexandre III: golden statues and the Seine', photo: null,
            p: ["The most ornate bridge in Paris, with its gilded statues and lamps, the Seine below and a view towards the Invalides and the Eiffel Tower. It is wide, so even with people around there is room to find a clean background.",
                'Sunset gives it a warm glow, and the lamps look lovely once they light up.'] },
          { h2: '6. The banks of the Seine at sunset', photo: [P + 'proposal-proposal2.webp', 'Proposal at sunset in Paris', 'Sunset at the Troca'],
            p: ['For a simpler, softer proposal, a walk along the quays at golden hour works beautifully: the river, the bridges and the light do the work. Île Saint-Louis and the quays near Notre-Dame are lovely for this.',
                "It's also the easiest plan for a surprise: a walk by the river doesn't raise any suspicion."] },
        ],
        tips: [
          'Timing: sunrise for empty spots, golden hour for warm light, and after dark for the Eiffel Tower lights (sparkle: five minutes at the start of every hour).',
          'Agree on a signal with your photographer, and tell me exactly where you will stop. I arrive early and blend in.',
          'Keep the ring in a front pocket, not in a bag, so you are not searching for it at the big moment.',
          'Have a rain plan: the Louvre arcades are covered and just as beautiful.',
          'Want lights, candles, a carpet or the "MARRY ME" letters? I can set up the decoration for you.',
        ],
      },
      fr: {
        title: 'Les 6 plus beaux endroits pour faire sa demande en mariage à Paris (par une photographe de demandes)',
        short: 'Trocadéro, Bir-Hakeim, le Louvre, Montmartre : où poser le genou, à quelle heure y aller et comment éviter la foule.',
        desc: "Où faire sa demande en mariage à Paris : Trocadéro, Bir-Hakeim, arcades du Louvre, Montmartre, pont Alexandre III, quais de Seine. Meilleurs horaires, affluence et conseils d'une photographe de demandes à Paris.",
        intro: [
          "Je photographie des demandes en mariage à Paris toute l'année, cachée dans la foule avec mon appareil. La question qu'on me pose le plus arrive avant même la bague : où la faire ? Voici les six lieux que je conseille, ce qu'ils donnent en photo, et le moment de la journée qui les rend parfaits.",
        ],
        spots: [
          { h2: '1. Le Trocadéro : la vue classique sur la tour Eiffel', photo: [P + 'proposal-16.webp', 'Demande en mariage au Trocadéro la nuit avec la tour Eiffel illuminée', 'Trocadéro, à la nuit tombée'],
            p: ["L'esplanade entre les deux ailes du palais de Chaillot vous offre toute la tour Eiffel en arrière-plan. C'est la vue la plus célèbre de Paris, et c'est aussi son point faible : il y a du monde de la fin de matinée jusqu'à minuit.",
                "Venez au lever du soleil pour l'avoir presque pour vous, ou à la nuit tombée pour les lumières. Après le crépuscule, la tour scintille cinq minutes au début de chaque heure : une demande calée sur l'heure pile, c'est magique en photo."] },
          { h2: '2. Le pont de Bir-Hakeim : le métal, les arches et la tour', photo: [P + 'proposal-22.webp', 'Couple devant la tour Eiffel qui scintille', 'Quand la tour scintille'],
            p: ["Le tablier supérieur du pont de Bir-Hakeim a une allée centrale bordée de colonnes en fer, avec la tour Eiffel juste à côté. C'est plus intime que le Trocadéro, et les lignes du pont créent de très beaux cadrages.",
                "Le matin tôt est le moment le plus calme. En journée, d'autres couples et photographes viennent aussi : on choisit alors un endroit entre deux colonnes où personne ne traversera le moment."] },
          { h2: '3. Les arcades du Louvre : élégantes, et parfaites quand il pleut', photo: [P + 'proposal-2.webp', 'Demande en mariage sous les arcades en pierre du Louvre', 'Les arcades du Louvre'],
            p: ["Les arcades autour des cours du Louvre offrent de longues perspectives de pierre et une lumière douce et régulière. C'est mon plan B préféré : s'il pleut, vous restez au sec et les photos restent belles.",
                "Le matin, les arcades sont plus calmes. La pyramide est tout près si vous voulez un deuxième décor pour les photos de couple ensuite."] },
          { h2: "4. Montmartre et le mur des je t'aime", photo: null,
            p: ["Dans le square Jehan-Rictus, près du métro Abbesses, le mur des je t'aime affiche « je t'aime » écrit 311 fois en 250 langues. L'accès est gratuit ; les horaires du square changent selon la saison, vérifiez-les si vous visez un moment très tôt ou tard.",
                "Montez ensuite au Sacré-Cœur pour la vue sur Paris, ou flânez dans les petites rues autour de la place du Tertre. Montmartre plaira aux couples qui veulent quelque chose de plus bohème que la tour Eiffel."] },
          { h2: '5. Le pont Alexandre III : statues dorées et Seine', photo: null,
            p: ["Le pont le plus orné de Paris, avec ses statues et ses lampadaires dorés, la Seine en dessous et une vue vers les Invalides et la tour Eiffel. Il est large : même avec du monde, on trouve facilement un arrière-plan dégagé.",
                "Au coucher du soleil, il prend une lumière chaude, et ses lampadaires sont superbes une fois allumés."] },
          { h2: '6. Les quais de Seine au coucher du soleil', photo: [P + 'proposal-proposal2.webp', 'Demande en mariage au coucher du soleil à Paris', 'Coucher de soleil au Troca'],
            p: ["Pour une demande plus simple et plus douce, une balade sur les quais à l'heure dorée fonctionne à merveille : la Seine, les ponts et la lumière font tout le travail. L'île Saint-Louis et les quais près de Notre-Dame sont parfaits pour ça.",
                "C'est aussi le plan le plus facile pour garder la surprise : une balade au bord de l'eau n'éveille aucun soupçon."] },
        ],
        tips: [
          "L'horaire : le lever du soleil pour des lieux vides, l'heure dorée pour une lumière chaude, et la nuit pour les lumières de la tour Eiffel (scintillement : cinq minutes au début de chaque heure).",
          "Convenez d'un signal avec votre photographe, et dites-moi exactement où vous vous arrêterez. J'arrive en avance et je me fonds dans le décor.",
          'Gardez la bague dans une poche avant, pas dans un sac, pour ne pas la chercher au grand moment.',
          'Prévoyez un plan B en cas de pluie : les arcades du Louvre sont couvertes et tout aussi belles.',
          'Envie de lumières, de bougies, d\'un tapis ou des lettres « MARRY ME » ? Je peux installer la décoration pour vous.',
        ],
      },
    },
  ],
};
