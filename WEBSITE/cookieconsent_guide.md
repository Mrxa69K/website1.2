# CookieConsent Implementation Guide

## Installation Options

### Option 1: CDN (Recommandé pour sites statiques)
```html
<!-- CSS dans le <head> -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.1.0/dist/cookieconsent.css">

<!-- JS avant la fermeture du </body> -->
<script defer src="https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.1.0/dist/cookieconsent.umd.js"></script>
```

### Option 2: NPM
```bash
npm i vanilla-cookieconsent@3.1.0
```

## Configuration de Base

### Structure HTML
```html
<html>
    <head>
        <!-- head content -->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.1.0/dist/cookieconsent.css">
    </head>
    <body>
        <!-- body content -->
        <script type="module" src="cookieconsent-config.js"></script>
    </body>
</html>
```

### Configuration JavaScript (cookieconsent-config.js)
```javascript
import 'https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.1.0/dist/cookieconsent.umd.js';

CookieConsent.run({
    categories: {
        necessary: {
            enabled: true,  // cette catégorie est activée par défaut
            readOnly: true  // cette catégorie ne peut pas être désactivée
        },
        analytics: {}
    },

    language: {
        default: 'fr',
        translations: {
            fr: {
                consentModal: {
                    title: 'Nous utilisons des cookies',
                    description: 'Description du modal de cookies',
                    acceptAllBtn: 'Tout accepter',
                    acceptNecessaryBtn: 'Tout rejeter',
                    showPreferencesBtn: 'Gérer les préférences'
                },
                preferencesModal: {
                    title: 'Gérer les préférences de cookies',
                    acceptAllBtn: 'Tout accepter',
                    acceptNecessaryBtn: 'Tout rejeter',
                    savePreferencesBtn: 'Accepter la sélection actuelle',
                    closeIconLabel: 'Fermer le modal',
                    sections: [
                        {
                            title: 'Utilisation des cookies',
                            description: 'Nous utilisons des cookies pour améliorer votre expérience.'
                        },
                        {
                            title: 'Cookies strictement nécessaires',
                            description: 'Ces cookies sont essentiels au bon fonctionnement du site web et ne peuvent pas être désactivés.',
                            linkedCategory: 'necessary'
                        },
                        {
                            title: 'Performance et Analytiques',
                            description: 'Ces cookies collectent des informations sur la façon dont vous utilisez notre site web.',
                            linkedCategory: 'analytics'
                        },
                        {
                            title: 'Plus d\'informations',
                            description: 'Pour toute question concernant notre politique de cookies, <a href="#contact">contactez-nous</a>'
                        }
                    ]
                }
            }
        }
    }
});
```

## Bouton pour Ouvrir les Préférences
```html
<button type="button" data-cc="show-preferencesModal">Gérer les préférences de cookies</button>
```

## Points Importants
- Léger et performant
- Conforme GDPR et CCPA
- Bloque les scripts jusqu'au consentement
- Support multilingue
- Accessible (a11y)
- Personnalisable

