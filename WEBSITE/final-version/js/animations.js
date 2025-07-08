/**
 * MELISSA PHOTOGRAPHY PARIS - ANIMATIONS MODULE
 * Animations modernes et interactions pour site de photographie
 * Inspiré des meilleurs sites de photographes professionnels
 */

class MelissaAnimationsModule {
    constructor() {
        this.isScrolling = false;
        this.lastScrollTime = 0;
        this.init();
    }

    init() {
        this.setupScrollReveal();
        this.setupParallaxEffects();
        this.setupSmoothScrolling();
        this.setupHoverEffects();
        this.setupLazyLoading();
        this.setupLightbox();
        this.setupFormAnimations();
        this.setupLoadingAnimations();
        console.log('✨ Melissa Photography Animations Module Loaded');
    }

    // 1. SCROLL REVEAL ANIMATIONS
    setupScrollReveal() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Animation spéciale pour les cartes de service
                    if (entry.target.classList.contains('service-card')) {
                        this.animateServiceCard(entry.target);
                    }
                    
                    // Animation spéciale pour les images de galerie
                    if (entry.target.classList.contains('gallery-item')) {
                        this.animateGalleryItem(entry.target);
                    }
                }
            });
        }, observerOptions);

        // Observer tous les éléments à animer
        document.addEventListener('DOMContentLoaded', () => {
            const elementsToAnimate = document.querySelectorAll(`
                .service-card,
                .gallery-item,
                .about-section,
                .contact-form,
                .decoration-example,
                h1, h2, h3,
                .btn,
                .feature-item
            `);

            elementsToAnimate.forEach(el => {
                el.classList.add('animate-on-scroll');
                observer.observe(el);
            });
        });
    }

    animateServiceCard(card) {
        const delay = Array.from(card.parentElement.children).indexOf(card) * 100;
        setTimeout(() => {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.opacity = '1';
        }, delay);
    }

    animateGalleryItem(item) {
        const delay = Array.from(item.parentElement.children).indexOf(item) * 50;
        setTimeout(() => {
            item.style.transform = 'translateY(0) rotateY(0)';
            item.style.opacity = '1';
        }, delay);
    }

    // 2. EFFETS PARALLAX
    setupParallaxEffects() {
        const parallaxElements = document.querySelectorAll('.parallax');
        
        if (parallaxElements.length === 0) return;

        const handleParallax = () => {
            if (this.isScrolling) return;
            
            this.isScrolling = true;
            requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                
                parallaxElements.forEach(element => {
                    const speed = parseFloat(element.dataset.speed) || 0.5;
                    const yPos = -(scrolled * speed);
                    element.style.transform = `translateY(${yPos}px)`;
                });
                
                this.isScrolling = false;
            });
        };

        // Throttle pour performance
        window.addEventListener('scroll', () => {
            const now = Date.now();
            if (now - this.lastScrollTime > 16) { // ~60fps
                handleParallax();
                this.lastScrollTime = now;
            }
        });
    }

    // 3. SMOOTH SCROLLING
    setupSmoothScrolling() {
        document.addEventListener('DOMContentLoaded', () => {
            const links = document.querySelectorAll('a[href^="#"]');
            
            links.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    const targetId = link.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                        this.smoothScrollTo(targetElement);
                    }
                });
            });
        });
    }

    smoothScrollTo(element) {
        const targetPosition = element.offsetTop - 80; // Offset pour header
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 800;
        let start = null;

        const animation = (currentTime) => {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const run = this.easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        };

        requestAnimationFrame(animation);
    }

    easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    // 4. EFFETS HOVER AVANCÉS
    setupHoverEffects() {
        document.addEventListener('DOMContentLoaded', () => {
            // Effet hover pour les cartes de service
            const serviceCards = document.querySelectorAll('.service-card');
            serviceCards.forEach(card => {
                this.addCardHoverEffect(card);
            });

            // Effet hover pour les images de galerie
            const galleryItems = document.querySelectorAll('.gallery-item img');
            galleryItems.forEach(img => {
                this.addImageHoverEffect(img);
            });

            // Effet hover pour les boutons
            const buttons = document.querySelectorAll('.btn');
            buttons.forEach(btn => {
                this.addButtonHoverEffect(btn);
            });
        });
    }

    addCardHoverEffect(card) {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
            card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.08)';
        });
    }

    addImageHoverEffect(img) {
        const container = img.parentElement;
        
        img.addEventListener('mouseenter', () => {
            img.style.transform = 'scale(1.05)';
            img.style.filter = 'brightness(1.1)';
        });

        img.addEventListener('mouseleave', () => {
            img.style.transform = 'scale(1)';
            img.style.filter = 'brightness(1)';
        });
    }

    addButtonHoverEffect(btn) {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-2px)';
            btn.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
        });
    }

    // 5. LAZY LOADING SÉCURISÉ
    setupLazyLoading() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Vérifier que l'image vient du même domaine (sécurité)
                    if (this.isValidImageSource(img.dataset.src)) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        img.classList.add('loaded');
                        
                        // Ajouter protection après chargement
                        img.addEventListener('load', () => {
                            this.protectLoadedImage(img);
                        });
                        
                        imageObserver.unobserve(img);
                    }
                }
            });
        });

        document.addEventListener('DOMContentLoaded', () => {
            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => {
                imageObserver.observe(img);
            });
        });
    }

    isValidImageSource(src) {
        try {
            const url = new URL(src, window.location.origin);
            return url.origin === window.location.origin;
        } catch {
            return false;
        }
    }

    protectLoadedImage(img) {
        img.draggable = false;
        img.style.userSelect = 'none';
        img.style.pointerEvents = 'none';
    }

    // 6. LIGHTBOX SÉCURISÉE
    setupLightbox() {
        document.addEventListener('DOMContentLoaded', () => {
            const galleryImages = document.querySelectorAll('.gallery-item img');
            
            galleryImages.forEach(img => {
                img.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openLightbox(img);
                });
            });
        });
    }

    openLightbox(img) {
        // Vérifier la sécurité de l'image
        if (!this.isValidImageSource(img.src)) return;

        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <img src="${img.src}" alt="${img.alt}" draggable="false">
                <button class="lightbox-close">&times;</button>
                <div class="lightbox-info">
                    <p>© Melissa Photography Paris</p>
                </div>
            </div>
        `;

        document.body.appendChild(lightbox);
        document.body.style.overflow = 'hidden';

        // Animation d'ouverture
        requestAnimationFrame(() => {
            lightbox.classList.add('active');
        });

        // Fermeture
        const closeBtn = lightbox.querySelector('.lightbox-close');
        const closeLightbox = () => {
            lightbox.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(lightbox);
                document.body.style.overflow = '';
            }, 300);
        };

        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        // Protection de l'image dans la lightbox
        const lightboxImg = lightbox.querySelector('img');
        lightboxImg.addEventListener('contextmenu', (e) => e.preventDefault());
        lightboxImg.addEventListener('dragstart', (e) => e.preventDefault());
    }

    // 7. ANIMATIONS DE FORMULAIRE
    setupFormAnimations() {
        document.addEventListener('DOMContentLoaded', () => {
            const formInputs = document.querySelectorAll('input, textarea, select');
            
            formInputs.forEach(input => {
                this.addInputAnimations(input);
            });
        });
    }

    addInputAnimations(input) {
        // Animation focus
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', () => {
            if (input.value === '') {
                input.parentElement.classList.remove('focused');
            }
        });

        // Animation de validation en temps réel
        input.addEventListener('input', () => {
            this.validateInputRealTime(input);
        });
    }

    validateInputRealTime(input) {
        const isValid = input.checkValidity();
        const parent = input.parentElement;
        
        parent.classList.remove('valid', 'invalid');
        
        if (input.value.length > 0) {
            parent.classList.add(isValid ? 'valid' : 'invalid');
        }
    }

    // 8. ANIMATIONS DE CHARGEMENT
    setupLoadingAnimations() {
        // Animation de chargement de page
        window.addEventListener('load', () => {
            this.hidePageLoader();
        });

        // Animation pour les éléments qui se chargent
        document.addEventListener('DOMContentLoaded', () => {
            this.animatePageElements();
        });
    }

    hidePageLoader() {
        const loader = document.querySelector('.page-loader');
        if (loader) {
            loader.classList.add('fade-out');
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }
    }

    animatePageElements() {
        const elements = document.querySelectorAll('.animate-on-load');
        
        elements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('loaded');
            }, index * 100);
        });
    }

    // 9. MÉTHODES UTILITAIRES
    addRippleEffect(element, event) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255,255,255,0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
}

// CSS pour les animations
const animationsCSS = `
/* Animations de base */
.animate-on-scroll {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.6s ease-out;
}

.animate-on-scroll.animate-in {
    opacity: 1;
    transform: translateY(0);
}

/* Animations spécifiques */
.service-card {
    transition: all 0.3s ease-out;
}

.gallery-item img {
    transition: all 0.3s ease-out;
}

.btn {
    transition: all 0.3s ease-out;
    position: relative;
    overflow: hidden;
}

/* Lazy loading */
.lazy {
    opacity: 0;
    transition: opacity 0.3s;
}

.lazy.loaded {
    opacity: 1;
}

/* Lightbox */
.lightbox {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.9);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease-out;
}

.lightbox.active {
    opacity: 1;
}

.lightbox-content {
    position: relative;
    max-width: 90%;
    max-height: 90%;
}

.lightbox-content img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.lightbox-close {
    position: absolute;
    top: -40px;
    right: 0;
    background: none;
    border: none;
    color: white;
    font-size: 30px;
    cursor: pointer;
    padding: 5px 10px;
}

.lightbox-info {
    position: absolute;
    bottom: -40px;
    left: 0;
    color: white;
    font-size: 12px;
}

/* Animations de formulaire */
.form-group {
    position: relative;
    margin-bottom: 20px;
}

.form-group.focused label {
    transform: translateY(-20px) scale(0.8);
    color: #2c2c2c;
}

.form-group.valid input {
    border-color: #28a745;
}

.form-group.invalid input {
    border-color: #dc3545;
}

/* Animation de chargement */
.page-loader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: white;
    z-index: 10001;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.5s ease-out;
}

.page-loader.fade-out {
    opacity: 0;
}

.animate-on-load {
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.5s ease-out;
}

.animate-on-load.loaded {
    opacity: 1;
    transform: translateY(0);
}

/* Animation ripple */
@keyframes ripple {
    to {
        transform: scale(2);
        opacity: 0;
    }
}

/* Animations responsives */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
`;

// Injecter le CSS
const style = document.createElement('style');
style.textContent = animationsCSS;
document.head.appendChild(style);

// Initialiser le module d'animations
document.addEventListener('DOMContentLoaded', () => {
    window.melissaAnimations = new MelissaAnimationsModule();
});

// Export pour utilisation externe si nécessaire
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MelissaAnimationsModule;
}

