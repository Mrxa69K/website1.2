#!/bin/bash

# Script pour ajouter CookieConsent sur toutes les pages HTML du site
# Exclut les pages de démonstration des polices

echo "Ajout de CookieConsent sur toutes les pages du site..."

# Liste des pages à traiter (exclut les démos de polices)
pages=(
    "about.html"
    "aboutfr.html" 
    "contact.html"
    "contactfr.html"
    "event.html"
    "eventfr.html"
    "indexfr.html"
    "portrait.html"
    "portraitfr.html"
    "proposal.html"
    "proposalfr.html"
    "review.html"
    "reviewfr.html"
    "services.html"
    "servicesfr.html"
    "sport.html"
    "sportfr.html"
    "wedding.html"
    "weddingfr.html"
    "en/contact.html"
    "en/index.html"
    "en/services.html"
)

for page in "${pages[@]}"; do
    if [ -f "$page" ]; then
        echo "Traitement de $page..."
        
        # Vérifier si CookieConsent n'est pas déjà présent
        if ! grep -q "cookieconsent" "$page"; then
            # Ajouter le CSS dans le head (après les en-têtes de sécurité s'ils existent)
            if grep -q "Content-Security-Policy" "$page"; then
                # Modifier le CSP pour autoriser jsdelivr
                sed -i 's/cdnjs\.cloudflare\.com/cdnjs.cloudflare.com cdn.jsdelivr.net/g' "$page"
                
                # Ajouter le CSS après les en-têtes de sécurité
                sed -i '/X-Content-Type-Options/a\\n  <!-- CookieConsent CSS -->\n  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.1.0/dist/cookieconsent.css">' "$page"
            else
                # Ajouter le CSS avant la fermeture du head
                sed -i '/<\/head>/i\  <!-- CookieConsent CSS -->\n  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.1.0/dist/cookieconsent.css">' "$page"
            fi
            
            # Ajouter les scripts avant la fermeture du body
            sed -i '/<\/body>/i\  <!-- CookieConsent Implementation -->\n  <script defer src="https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.1.0/dist/cookieconsent.umd.js"></script>\n  <script type="module" src="js/cookieconsent-config.js"></script>' "$page"
            
            # Ajouter le bouton dans le footer s'il existe
            if grep -q "Copyright" "$page"; then
                sed -i '/Copyright.*All rights reserved/a\        <p class="mt-2">\n          <button type="button" data-cc="show-preferencesModal" class="btn btn-sm btn-outline-secondary">\n            🍪 Gérer les cookies\n          </button>\n        </p>' "$page"
            fi
            
            echo "✓ CookieConsent ajouté à $page"
        else
            echo "⚠ CookieConsent déjà présent dans $page"
        fi
    else
        echo "✗ Fichier $page non trouvé"
    fi
done

echo "Terminé ! CookieConsent a été ajouté sur toutes les pages."

