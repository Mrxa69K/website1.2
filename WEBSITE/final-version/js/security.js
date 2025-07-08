/**
 * MELISSA PHOTOGRAPHY PARIS - SECURITY MODULE
 * Protection côté client pour site de photographie
 * Développé selon les standards de cybersécurité
 */

class MelissaSecurityModule {
    constructor() {
        this.humanScore = 0;
        this.mouseMovements = 0;
        this.keystrokes = 0;
        this.startTime = Date.now();
        this.init();
    }

    init() {
        this.protectImages();
        this.protectDevTools();
        this.setupFormValidation();
        this.addHoneypot();
        this.trackHumanBehavior();
        this.setupCSPHeaders();
        console.log('🛡️ Melissa Photography Security Module Loaded');
    }

    // 1. PROTECTION DES IMAGES
    protectImages() {
        // Désactiver clic droit sur les images
        document.addEventListener('contextmenu', (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
                this.showProtectionMessage();
                return false;
            }
        });

        // Désactiver glisser-déposer des images
        document.addEventListener('dragstart', (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
                return false;
            }
        });

        // Désactiver sélection des images
        document.addEventListener('selectstart', (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
                return false;
            }
        });

        // Ajouter protection après chargement des images
        document.addEventListener('DOMContentLoaded', () => {
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                img.draggable = false;
                img.style.userSelect = 'none';
                img.style.webkitUserSelect = 'none';
                img.style.mozUserSelect = 'none';
                img.style.msUserSelect = 'none';
                
                // Ajouter overlay invisible pour protection supplémentaire
                img.addEventListener('load', () => {
                    this.addImageOverlay(img);
                });
            });
        });
    }

    addImageOverlay(img) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10;
            pointer-events: none;
            background: transparent;
        `;
        
        if (img.parentElement.style.position !== 'relative') {
            img.parentElement.style.position = 'relative';
        }
        img.parentElement.appendChild(overlay);
    }

    showProtectionMessage() {
        // Message discret pour ne pas gêner l'UX
        const message = document.createElement('div');
        message.textContent = '© Melissa Photography Paris - Images protégées';
        message.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            font-size: 12px;
            z-index: 10000;
            animation: fadeInOut 3s ease-in-out;
        `;
        
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 3000);
    }

    // 2. PROTECTION CONTRE LES OUTILS DE DÉVELOPPEMENT
    protectDevTools() {
        // Désactiver F12, Ctrl+Shift+I, Ctrl+U, etc.
        document.addEventListener('keydown', (e) => {
            // F12
            if (e.key === 'F12') {
                e.preventDefault();
                this.logSecurityEvent('F12_ATTEMPT');
                return false;
            }
            
            // Ctrl+Shift+I (DevTools)
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                this.logSecurityEvent('DEVTOOLS_ATTEMPT');
                return false;
            }
            
            // Ctrl+Shift+C (Inspect)
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                this.logSecurityEvent('INSPECT_ATTEMPT');
                return false;
            }
            
            // Ctrl+U (View Source)
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                this.logSecurityEvent('VIEWSOURCE_ATTEMPT');
                return false;
            }
            
            // Ctrl+S (Save Page)
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.logSecurityEvent('SAVEPAGE_ATTEMPT');
                return false;
            }
        });

        // Détection d'ouverture des DevTools (méthode avancée)
        this.detectDevTools();
    }

    detectDevTools() {
        let devtools = {
            open: false,
            orientation: null
        };
        
        setInterval(() => {
            if (window.outerHeight - window.innerHeight > 200 || 
                window.outerWidth - window.innerWidth > 200) {
                if (!devtools.open) {
                    devtools.open = true;
                    this.logSecurityEvent('DEVTOOLS_OPENED');
                }
            } else {
                devtools.open = false;
            }
        }, 500);
    }

    // 3. VALIDATION SÉCURISÉE DES FORMULAIRES
    setupFormValidation() {
        document.addEventListener('DOMContentLoaded', () => {
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                form.addEventListener('submit', (e) => {
                    if (!this.validateForm(form)) {
                        e.preventDefault();
                        return false;
                    }
                });
            });
        });
    }

    validateForm(form) {
        const formData = new FormData(form);
        const sanitized = {};
        let isValid = true;

        // Vérifier le honeypot
        if (formData.get('website') && formData.get('website').trim() !== '') {
            this.logSecurityEvent('BOT_DETECTED_HONEYPOT');
            return false;
        }

        // Nettoyer et valider chaque champ
        for (let [key, value] of formData.entries()) {
            if (key === 'website') continue; // Skip honeypot
            
            // Sanitisation basique
            sanitized[key] = this.sanitizeInput(value);
            
            // Validation spécifique
            if (key === 'email' && !this.validateEmail(sanitized[key])) {
                this.showValidationError('Email invalide');
                isValid = false;
            }
            
            if (key === 'phone' && sanitized[key] && !this.validatePhone(sanitized[key])) {
                this.showValidationError('Numéro de téléphone invalide');
                isValid = false;
            }
        }

        // Vérifier le comportement humain
        if (this.humanScore < 3) {
            this.logSecurityEvent('SUSPICIOUS_BEHAVIOR');
            // Ne pas bloquer mais logger
        }

        return isValid;
    }

    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .trim()
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/[<>]/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '');
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePhone(phone) {
        const phoneRegex = /^(?:\+33|0)[1-9](?:[0-9]{8})$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    showValidationError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    // 4. HONEYPOT ANTI-SPAM
    addHoneypot() {
        document.addEventListener('DOMContentLoaded', () => {
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                const honeypot = document.createElement('input');
                honeypot.type = 'text';
                honeypot.name = 'website';
                honeypot.style.cssText = `
                    position: absolute;
                    left: -9999px;
                    width: 1px;
                    height: 1px;
                    opacity: 0;
                    pointer-events: none;
                `;
                honeypot.tabIndex = -1;
                honeypot.autocomplete = 'off';
                
                form.appendChild(honeypot);
            });
        });
    }

    // 5. DÉTECTION DE COMPORTEMENT HUMAIN
    trackHumanBehavior() {
        // Mouvements de souris
        document.addEventListener('mousemove', () => {
            this.mouseMovements++;
            if (this.mouseMovements > 10) {
                this.humanScore += 1;
                this.mouseMovements = 0; // Reset
            }
        });

        // Frappes clavier
        document.addEventListener('keydown', () => {
            this.keystrokes++;
            if (this.keystrokes > 5) {
                this.humanScore += 1;
                this.keystrokes = 0; // Reset
            }
        });

        // Temps passé sur la page
        setInterval(() => {
            const timeSpent = (Date.now() - this.startTime) / 1000;
            if (timeSpent > 30) { // 30 secondes
                this.humanScore += 1;
            }
        }, 30000);

        // Scroll naturel
        let lastScrollTime = 0;
        document.addEventListener('scroll', () => {
            const now = Date.now();
            if (now - lastScrollTime > 100) { // Scroll pas trop rapide
                this.humanScore += 0.5;
            }
            lastScrollTime = now;
        });
    }

    // 6. HEADERS DE SÉCURITÉ (côté client)
    setupCSPHeaders() {
        // Ajouter meta tags de sécurité si pas présents
        if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
            const csp = document.createElement('meta');
            csp.httpEquiv = 'Content-Security-Policy';
            csp.content = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;";
            document.head.appendChild(csp);
        }

        if (!document.querySelector('meta[http-equiv="X-Content-Type-Options"]')) {
            const nosniff = document.createElement('meta');
            nosniff.httpEquiv = 'X-Content-Type-Options';
            nosniff.content = 'nosniff';
            document.head.appendChild(nosniff);
        }
    }

    // 7. LOGGING DES ÉVÉNEMENTS DE SÉCURITÉ
    logSecurityEvent(eventType) {
        const event = {
            type: eventType,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            humanScore: this.humanScore
        };

        // En production, envoyer à votre serveur
        console.warn('🚨 Security Event:', event);
        
        // Stocker localement pour analyse
        const events = JSON.parse(localStorage.getItem('security_events') || '[]');
        events.push(event);
        if (events.length > 100) events.shift(); // Garder seulement les 100 derniers
        localStorage.setItem('security_events', JSON.stringify(events));
    }

    // 8. MÉTHODES UTILITAIRES
    getSecurityReport() {
        return {
            humanScore: this.humanScore,
            timeOnSite: (Date.now() - this.startTime) / 1000,
            events: JSON.parse(localStorage.getItem('security_events') || '[]')
        };
    }
}

// CSS pour les animations de sécurité
const securityCSS = `
@keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(20px); }
    20% { opacity: 1; transform: translateY(0); }
    80% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-20px); }
}

@keyframes slideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
}

/* Protection supplémentaire via CSS */
img {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
    user-drag: none;
}

/* Masquer le texte de sélection */
::selection {
    background: transparent;
}

::-moz-selection {
    background: transparent;
}
`;

// Injecter le CSS
const style = document.createElement('style');
style.textContent = securityCSS;
document.head.appendChild(style);

// Initialiser le module de sécurité
document.addEventListener('DOMContentLoaded', () => {
    window.melissaSecurity = new MelissaSecurityModule();
});

// Export pour utilisation externe si nécessaire
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MelissaSecurityModule;
}

