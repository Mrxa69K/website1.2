// CookieConsent Configuration for Melissa Photography Paris
// Import CookieConsent from CDN
import 'https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.1.0/dist/cookieconsent.umd.js';

// Run CookieConsent with French configuration
CookieConsent.run({
    // Catégories de cookies
    categories: {
        necessary: {
            enabled: true,  // Toujours activé
            readOnly: true  // Ne peut pas être désactivé
        },
        analytics: {
            enabled: false  // Désactivé par défaut
        },
        marketing: {
            enabled: false  // Désactivé par défaut
        }
    },

    // Configuration de la langue
    language: {
        default: 'fr',
        translations: {
            fr: {
                consentModal: {
                    title: 'Nous utilisons des cookies 🍪',
                    description: 'Ce site utilise des cookies pour améliorer votre expérience de navigation et analyser notre trafic. En continuant à utiliser ce site, vous acceptez notre utilisation des cookies.',
                    acceptAllBtn: 'Tout accepter',
                    acceptNecessaryBtn: 'Accepter uniquement les nécessaires',
                    showPreferencesBtn: 'Gérer mes préférences',
                    footer: '<a href="/privacy-policy">Politique de confidentialité</a>\n<a href="/terms">Conditions d\'utilisation</a>'
                },
                preferencesModal: {
                    title: 'Gérer les préférences de cookies',
                    acceptAllBtn: 'Tout accepter',
                    acceptNecessaryBtn: 'Accepter uniquement les nécessaires',
                    savePreferencesBtn: 'Sauvegarder mes préférences',
                    closeIconLabel: 'Fermer',
                    serviceCounterLabel: 'Service|Services',
                    sections: [
                        {
                            title: 'Utilisation des cookies',
                            description: 'Nous utilisons des cookies pour personnaliser le contenu et les annonces, pour fournir des fonctionnalités de médias sociaux et pour analyser notre trafic. Nous partageons également des informations sur votre utilisation de notre site avec nos partenaires de médias sociaux, de publicité et d\'analyse.'
                        },
                        {
                            title: 'Cookies strictement nécessaires',
                            description: 'Ces cookies sont essentiels au bon fonctionnement du site web et ne peuvent pas être désactivés dans nos systèmes. Ils sont généralement définis en réponse à des actions que vous effectuez et qui constituent une demande de services.',
                            linkedCategory: 'necessary'
                        },
                        {
                            title: 'Cookies d\'analyse et de performance',
                            description: 'Ces cookies nous permettent de compter les visites et les sources de trafic afin que nous puissions mesurer et améliorer les performances de notre site. Ils nous aident à savoir quelles pages sont les plus et les moins populaires.',
                            linkedCategory: 'analytics',
                            cookieTable: {
                                headers: {
                                    name: 'Nom',
                                    domain: 'Domaine',
                                    description: 'Description',
                                    expiration: 'Expiration'
                                },
                                body: [
                                    {
                                        name: '_ga',
                                        domain: 'melissaphotography.paris',
                                        description: 'Cookie Google Analytics pour distinguer les utilisateurs',
                                        expiration: '2 ans'
                                    },
                                    {
                                        name: '_ga_*',
                                        domain: 'melissaphotography.paris',
                                        description: 'Cookie Google Analytics pour maintenir l\'état de session',
                                        expiration: '2 ans'
                                    }
                                ]
                            }
                        },
                        {
                            title: 'Cookies marketing et publicitaires',
                            description: 'Ces cookies peuvent être définis par notre site par nos partenaires publicitaires. Ils peuvent être utilisés par ces entreprises pour créer un profil de vos intérêts et vous montrer des annonces pertinentes sur d\'autres sites.',
                            linkedCategory: 'marketing'
                        },
                        {
                            title: 'Plus d\'informations',
                            description: 'Pour toute question concernant notre politique de cookies et vos choix, veuillez <a href="#contact" class="cc__link">nous contacter</a>. Vous pouvez également consulter notre <a href="/privacy-policy" class="cc__link">politique de confidentialité</a> pour plus de détails.'
                        }
                    ]
                }
            },
            en: {
                consentModal: {
                    title: 'We use cookies 🍪',
                    description: 'This website uses cookies to enhance your browsing experience and analyze our traffic. By continuing to use this site, you accept our use of cookies.',
                    acceptAllBtn: 'Accept all',
                    acceptNecessaryBtn: 'Accept necessary only',
                    showPreferencesBtn: 'Manage preferences',
                    footer: '<a href="/privacy-policy">Privacy Policy</a>\n<a href="/terms">Terms of Service</a>'
                },
                preferencesModal: {
                    title: 'Manage cookie preferences',
                    acceptAllBtn: 'Accept all',
                    acceptNecessaryBtn: 'Accept necessary only',
                    savePreferencesBtn: 'Save preferences',
                    closeIconLabel: 'Close',
                    serviceCounterLabel: 'Service|Services',
                    sections: [
                        {
                            title: 'Cookie usage',
                            description: 'We use cookies to personalize content and ads, to provide social media features and to analyze our traffic. We also share information about your use of our site with our social media, advertising and analytics partners.'
                        },
                        {
                            title: 'Strictly necessary cookies',
                            description: 'These cookies are essential for the proper functioning of the website and cannot be disabled in our systems. They are usually set in response to actions you take that constitute a request for services.',
                            linkedCategory: 'necessary'
                        },
                        {
                            title: 'Analytics and performance cookies',
                            description: 'These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us know which pages are most and least popular.',
                            linkedCategory: 'analytics',
                            cookieTable: {
                                headers: {
                                    name: 'Name',
                                    domain: 'Domain',
                                    description: 'Description',
                                    expiration: 'Expiration'
                                },
                                body: [
                                    {
                                        name: '_ga',
                                        domain: 'melissaphotography.paris',
                                        description: 'Google Analytics cookie to distinguish users',
                                        expiration: '2 years'
                                    },
                                    {
                                        name: '_ga_*',
                                        domain: 'melissaphotography.paris',
                                        description: 'Google Analytics cookie to maintain session state',
                                        expiration: '2 years'
                                    }
                                ]
                            }
                        },
                        {
                            title: 'Marketing and advertising cookies',
                            description: 'These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant ads on other sites.',
                            linkedCategory: 'marketing'
                        },
                        {
                            title: 'More information',
                            description: 'For any questions regarding our cookie policy and your choices, please <a href="#contact" class="cc__link">contact us</a>. You can also check our <a href="/privacy-policy" class="cc__link">privacy policy</a> for more details.'
                        }
                    ]
                }
            }
        }
    },

    // Options d'interface utilisateur
    guiOptions: {
        consentModal: {
            layout: 'box inline',
            position: 'bottom left',
            equalWeightButtons: true,
            flipButtons: false
        },
        preferencesModal: {
            layout: 'box',
            position: 'right',
            equalWeightButtons: true,
            flipButtons: false
        }
    },

    // Callbacks pour gérer les événements
    onFirstConsent: function(cookie) {
        console.log('First consent given:', cookie);
    },

    onConsent: function(cookie) {
        console.log('Consent updated:', cookie);
        
        // Activer Google Analytics si accepté
        if (CookieConsent.acceptedCategory('analytics')) {
            // Ici vous pouvez ajouter le code Google Analytics
            console.log('Analytics cookies accepted');
        }
        
        // Activer les cookies marketing si acceptés
        if (CookieConsent.acceptedCategory('marketing')) {
            console.log('Marketing cookies accepted');
        }
    },

    onChange: function(cookie, changedCategories) {
        console.log('Cookie preferences changed:', cookie, changedCategories);
    }
});

