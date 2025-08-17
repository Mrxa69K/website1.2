// CookieConsent Configuration for Melissa Photography Paris
import 'https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.1.0/dist/cookieconsent.umd.js';

CookieConsent.run({
    categories: {
        necessary: {
            enabled: true,
            readOnly: true
        },
        analytics: {
            enabled: false
        },
        marketing: {
            enabled: false
        }
    },

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
                    footer: '<a href="policy.html" class="cc__link">Politique de confidentialité</a>\n<a href="terms.html" class="cc__link">Conditions d\'utilisation</a>'
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
                            description: 'Ces cookies sont essentiels au bon fonctionnement du site web et ne peuvent pas être désactivés dans nos systèmes.',
                            linkedCategory: 'necessary'
                        },
                        {
                            title: 'Cookies d\'analyse et de performance',
                            description: 'Ces cookies nous permettent de mesurer l\'audience et la performance de notre site.',
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
                                        domain: 'melissaphotographyparis.fr',
                                        description: 'Cookie Google Analytics pour distinguer les utilisateurs',
                                        expiration: '2 ans'
                                    },
                                    {
                                        name: '_ga_*',
                                        domain: 'melissaphotographyparis.fr',
                                        description: 'Cookie Google Analytics pour maintenir l\'état de session',
                                        expiration: '2 ans'
                                    }
                                ]
                            }
                        },
                        {
                            title: 'Cookies marketing et publicitaires',
                            description: 'Ces cookies peuvent être utilisés par nos partenaires pour afficher des annonces pertinentes.',
                            linkedCategory: 'marketing'
                        },
                        {
                            title: 'Plus d\'informations',
                            description: 'Pour toute question, veuillez <a href="contact.html" class="cc__link">nous contacter</a>. Consultez aussi notre <a href="policy.html" class="cc__link">politique de confidentialité</a>.'
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
                    footer: '<a href="policy.html" class="cc__link">Privacy Policy</a>\n<a href="terms.html" class="cc__link">Terms of Service</a>'
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
                            description: 'We use cookies to personalize content and ads, to provide social media features and to analyze our traffic.'
                        },
                        {
                            title: 'Strictly necessary cookies',
                            description: 'These cookies are essential for the proper functioning of the website.',
                            linkedCategory: 'necessary'
                        },
                        {
                            title: 'Analytics and performance cookies',
                            description: 'These cookies allow us to measure performance and analyze traffic sources.',
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
                                        domain: 'melissaphotographyparis.fr',
                                        description: 'Google Analytics cookie to distinguish users',
                                        expiration: '2 years'
                                    },
                                    {
                                        name: '_ga_*',
                                        domain: 'melissaphotographyparis.fr',
                                        description: 'Google Analytics cookie to maintain session state',
                                        expiration: '2 years'
                                    }
                                ]
                            }
                        },
                        {
                            title: 'Marketing and advertising cookies',
                            description: 'These cookies may be used to build a profile and show relevant ads.',
                            linkedCategory: 'marketing'
                        },
                        {
                            title: 'More information',
                            description: 'For any questions, <a href="contact.html" class="cc__link">contact us</a>. See our <a href="policy.html" class="cc__link">privacy policy</a> for details.'
                        }
                    ]
                }
            }
        }
    },

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

    onFirstConsent: function (cookie) {
        console.log('First consent given:', cookie);
    },

    onConsent: function (cookie) {
        console.log('Consent updated:', cookie);

        if (CookieConsent.acceptedCategory('analytics')) {
            console.log('Analytics cookies accepted');
        }

        if (CookieConsent.acceptedCategory('marketing')) {
            console.log('Marketing cookies accepted');
        }
    },

    onChange: function (cookie, changedCategories) {
        console.log('Cookie preferences changed:', cookie, changedCategories);
    }
});
