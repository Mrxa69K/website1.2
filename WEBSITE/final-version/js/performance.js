/**
 * MELISSA PHOTOGRAPHY PARIS - PERFORMANCE OPTIMIZATION
 * Optimisations avancées pour performance et sécurité
 */

class MelissaPerformanceModule {
    constructor() {
        this.imageCache = new Map();
        this.loadedScripts = new Set();
        this.init();
    }

    init() {
        this.optimizeImages();
        this.setupCriticalResourceHints();
        this.setupServiceWorker();
        this.optimizeScrollPerformance();
        this.setupErrorHandling();
        console.log('⚡ Melissa Photography Performance Module Loaded');
    }

    // 1. OPTIMISATION DES IMAGES
    optimizeImages() {
        // Lazy loading avec Intersection Observer
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    this.loadImageSecurely(img);
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });

        document.addEventListener('DOMContentLoaded', () => {
            // Convertir les images en lazy loading
            const images = document.querySelectorAll('img[src]');
            images.forEach(img => {
                if (!img.dataset.src) {
                    img.dataset.src = img.src;
                    img.src = this.generatePlaceholder(img.width || 300, img.height || 200);
                    img.classList.add('lazy');
                    imageObserver.observe(img);
                }
            });
        });
    }

    loadImageSecurely(img) {
        const src = img.dataset.src;
        
        // Vérifier la sécurité de l'URL
        if (!this.isValidImageUrl(src)) {
            console.warn('Invalid image URL blocked:', src);
            return;
        }

        // Charger depuis le cache si disponible
        if (this.imageCache.has(src)) {
            img.src = this.imageCache.get(src);
            img.classList.remove('lazy');
            img.classList.add('loaded');
            return;
        }

        // Précharger l'image
        const tempImg = new Image();
        tempImg.onload = () => {
            this.imageCache.set(src, src);
            img.src = src;
            img.classList.remove('lazy');
            img.classList.add('loaded');
        };
        tempImg.onerror = () => {
            console.error('Failed to load image:', src);
            img.src = this.generateErrorPlaceholder();
        };
        tempImg.src = src;
    }

    generatePlaceholder(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Gradient placeholder
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#f0f0f0');
        gradient.addColorStop(1, '#e0e0e0');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        return canvas.toDataURL();
    }

    generateErrorPlaceholder() {
        return 'data:image/svg+xml;base64,' + btoa(`
            <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#f8f9fa"/>
                <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6c757d">
                    Image non disponible
                </text>
            </svg>
        `);
    }

    isValidImageUrl(url) {
        try {
            const urlObj = new URL(url, window.location.origin);
            return urlObj.origin === window.location.origin || 
                   urlObj.protocol === 'data:' ||
                   this.isTrustedDomain(urlObj.hostname);
        } catch {
            return false;
        }
    }

    isTrustedDomain(hostname) {
        const trustedDomains = [
            'images.unsplash.com',
            'cdn.pixabay.com',
            'images.pexels.com'
        ];
        return trustedDomains.includes(hostname);
    }

    // 2. RESOURCE HINTS
    setupCriticalResourceHints() {
        const head = document.head;
        
        // Preconnect aux domaines externes
        const preconnects = [
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com'
        ];
        
        preconnects.forEach(url => {
            if (!document.querySelector(`link[href="${url}"]`)) {
                const link = document.createElement('link');
                link.rel = 'preconnect';
                link.href = url;
                head.appendChild(link);
            }
        });

        // Prefetch des pages importantes
        const prefetchPages = [
            'about.html',
            'contact.html',
            'proposal.html'
        ];

        prefetchPages.forEach(page => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = page;
            head.appendChild(link);
        });
    }

    // 3. SERVICE WORKER POUR CACHE
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }

    // 4. OPTIMISATION DU SCROLL
    optimizeScrollPerformance() {
        let ticking = false;
        
        const updateScrollElements = () => {
            // Mettre à jour les éléments qui dépendent du scroll
            this.updateParallaxElements();
            this.updateScrollProgress();
            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollElements);
                ticking = true;
            }
        };

        // Throttle scroll events
        window.addEventListener('scroll', requestTick, { passive: true });
    }

    updateParallaxElements() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.parallax');
        
        parallaxElements.forEach(element => {
            const speed = parseFloat(element.dataset.speed) || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
    }

    updateScrollProgress() {
        const scrollProgress = (window.pageYOffset / (document.body.scrollHeight - window.innerHeight)) * 100;
        const progressBar = document.querySelector('.scroll-progress');
        if (progressBar) {
            progressBar.style.width = `${scrollProgress}%`;
        }
    }

    // 5. GESTION D'ERREURS
    setupErrorHandling() {
        // Capturer les erreurs JavaScript
        window.addEventListener('error', (event) => {
            this.logError('JavaScript Error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        // Capturer les erreurs de ressources
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.logError('Resource Error', {
                    type: event.target.tagName,
                    source: event.target.src || event.target.href,
                    message: 'Failed to load resource'
                });
            }
        }, true);

        // Capturer les promesses rejetées
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', {
                reason: event.reason
            });
        });
    }

    logError(type, details) {
        const errorLog = {
            type,
            details,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        console.error('Melissa Photography Error:', errorLog);
        
        // Stocker localement pour analyse
        const errors = JSON.parse(localStorage.getItem('error_logs') || '[]');
        errors.push(errorLog);
        if (errors.length > 50) errors.shift();
        localStorage.setItem('error_logs', JSON.stringify(errors));
    }

    // 6. MÉTRIQUES DE PERFORMANCE
    measurePerformance() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    const metrics = {
                        loadTime: perfData.loadEventEnd - perfData.loadEventStart,
                        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                        firstPaint: this.getFirstPaint(),
                        firstContentfulPaint: this.getFirstContentfulPaint()
                    };
                    
                    console.log('Performance Metrics:', metrics);
                    this.sendMetrics(metrics);
                }, 0);
            });
        }
    }

    getFirstPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
        return firstPaint ? firstPaint.startTime : null;
    }

    getFirstContentfulPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return fcp ? fcp.startTime : null;
    }

    sendMetrics(metrics) {
        // En production, envoyer à votre service d'analytics
        localStorage.setItem('performance_metrics', JSON.stringify(metrics));
    }
}

// CSS pour les optimisations
const performanceCSS = `
/* Optimisations de performance */
.lazy {
    opacity: 0;
    transition: opacity 0.3s;
}

.lazy.loaded {
    opacity: 1;
}

/* Scroll progress bar */
.scroll-progress {
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 3px;
    background: linear-gradient(90deg, #2c2c2c, #666);
    z-index: 10000;
    transition: width 0.1s ease-out;
}

/* Optimisations GPU */
.parallax,
.service-card,
.gallery-item {
    will-change: transform;
    transform: translateZ(0);
}

/* Optimisations de rendu */
img {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
}

/* Préchargement critique */
.critical-resource {
    font-display: swap;
}
`;

// Injecter le CSS
const style = document.createElement('style');
style.textContent = performanceCSS;
document.head.appendChild(style);

// Initialiser le module de performance
document.addEventListener('DOMContentLoaded', () => {
    window.melissaPerformance = new MelissaPerformanceModule();
});

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MelissaPerformanceModule;
}

