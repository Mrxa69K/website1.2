/**
 * Modern Photography Hero Slider
 * Features: Auto-advance, touch/swipe support, Ken Burns effect, accessibility
 */

class HeroSlider {
    constructor(selector) {
        this.slider = document.querySelector(selector);
        if (!this.slider) return;
        
        this.slides = this.slider.querySelectorAll('.hero-slide');
        this.dots = this.slider.querySelectorAll('.hero-dot');
        this.prevBtn = this.slider.querySelector('.hero-nav-prev .hero-nav-arrow');
        this.nextBtn = this.slider.querySelector('.hero-nav-next .hero-nav-arrow');
        this.progressBar = this.slider.querySelector('.hero-progress');
        
        this.currentSlide = 0;
        this.totalSlides = this.slides.length;
        this.autoAdvanceInterval = null;
        this.autoAdvanceDelay = 5000; // 5 seconds
        this.isPlaying = true;
        this.isPaused = false;
        
        // Touch support
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.minSwipeDistance = 50;
        
        this.init();
    }
    
    init() {
        if (this.totalSlides === 0) return;
        
        // Set first slide as active
        this.showSlide(0);
        
        // Add event listeners
        this.addEventListeners();
        
        // Start auto-advance
        this.startAutoAdvance();
        
        // Initialize accessibility
        this.setupAccessibility();
    }
    
    addEventListeners() {
        // Navigation buttons
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.previousSlide());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }
        
        // Dots navigation
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Pause on hover
        this.slider.addEventListener('mouseenter', () => this.pauseAutoAdvance());
        this.slider.addEventListener('mouseleave', () => this.resumeAutoAdvance());
        
        // Touch/swipe support
        this.slider.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        this.slider.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
        
        // Keyboard support
        this.slider.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Visibility API - pause when page is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoAdvance();
            } else if (this.isPlaying) {
                this.resumeAutoAdvance();
            }
        });
        
        // Window focus/blur
        window.addEventListener('blur', () => this.pauseAutoAdvance());
        window.addEventListener('focus', () => {
            if (this.isPlaying) this.resumeAutoAdvance();
        });
    }
    
    showSlide(index) {
        // Remove active classes
        this.slides.forEach(slide => {
            slide.classList.remove('active', 'next');
        });
        
        this.dots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        // Add active classes
        this.slides[index].classList.add('active');
        this.dots[index].classList.add('active');
        
        // Set next slide for smooth transition
        const nextIndex = (index + 1) % this.totalSlides;
        this.slides[nextIndex].classList.add('next');
        
        this.currentSlide = index;
        
        // Update progress bar
        this.updateProgressBar();
        
        // Announce slide change to screen readers
        this.announceSlideChange();
    }
    
    nextSlide() {
        const next = (this.currentSlide + 1) % this.totalSlides;
        this.goToSlide(next);
    }
    
    previousSlide() {
        const prev = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.goToSlide(prev);
    }
    
    goToSlide(index) {
        if (index === this.currentSlide) return;
        
        this.showSlide(index);
        
        // Reset auto-advance timer
        if (this.isPlaying) {
            this.stopAutoAdvance();
            this.startAutoAdvance();
        }
    }
    
    startAutoAdvance() {
        if (!this.isPlaying) return;
        
        this.stopAutoAdvance(); // Clear any existing interval
        
        this.autoAdvanceInterval = setInterval(() => {
            if (!this.isPaused) {
                this.nextSlide();
            }
        }, this.autoAdvanceDelay);
        
        this.slider.classList.remove('paused');
        this.updateProgressBar();
    }
    
    stopAutoAdvance() {
        if (this.autoAdvanceInterval) {
            clearInterval(this.autoAdvanceInterval);
            this.autoAdvanceInterval = null;
        }
    }
    
    pauseAutoAdvance() {
        this.isPaused = true;
        this.slider.classList.add('paused');
    }
    
    resumeAutoAdvance() {
        this.isPaused = false;
        this.slider.classList.remove('paused');
    }
    
    updateProgressBar() {
        if (!this.progressBar) return;
        
        // Reset progress bar
        this.progressBar.classList.remove('active');
        
        // Trigger reflow
        void this.progressBar.offsetWidth;
        
        // Start progress animation
        if (this.isPlaying && !this.isPaused) {
            this.progressBar.classList.add('active');
        }
    }
    
    // Touch/Swipe support
    handleTouchStart(e) {
        this.touchStartX = e.changedTouches[0].screenX;
    }
    
    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
    }
    
    handleSwipe() {
        const swipeDistance = this.touchStartX - this.touchEndX;
        
        if (Math.abs(swipeDistance) > this.minSwipeDistance) {
            if (swipeDistance > 0) {
                // Swiped left - next slide
                this.nextSlide();
            } else {
                // Swiped right - previous slide
                this.previousSlide();
            }
        }
    }
    
    // Keyboard support
    handleKeydown(e) {
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.previousSlide();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextSlide();
                break;
            case ' ': // Spacebar
                e.preventDefault();
                this.togglePlayPause();
                break;
            case 'Home':
                e.preventDefault();
                this.goToSlide(0);
                break;
            case 'End':
                e.preventDefault();
                this.goToSlide(this.totalSlides - 1);
                break;
        }
    }
    
    togglePlayPause() {
        if (this.isPlaying) {
            this.stopAutoAdvance();
            this.isPlaying = false;
        } else {
            this.startAutoAdvance();
            this.isPlaying = true;
        }
    }
    
    setupAccessibility() {
        // Add ARIA attributes
        this.slider.setAttribute('role', 'region');
        this.slider.setAttribute('aria-label', 'Photography Services Carousel');
        this.slider.setAttribute('aria-live', 'polite');
        
        // Add slide indicators
        this.slides.forEach((slide, index) => {
            slide.setAttribute('role', 'tabpanel');
            slide.setAttribute('aria-label', `Slide ${index + 1} of ${this.totalSlides}`);
            
            if (index === 0) {
                slide.setAttribute('aria-hidden', 'false');
            } else {
                slide.setAttribute('aria-hidden', 'true');
            }
        });
        
        // Add button labels
        if (this.prevBtn) {
            this.prevBtn.setAttribute('aria-label', 'Previous slide');
            this.prevBtn.setAttribute('tabindex', '0');
        }
        
        if (this.nextBtn) {
            this.nextBtn.setAttribute('aria-label', 'Next slide');
            this.nextBtn.setAttribute('tabindex', '0');
        }
        
        // Add dot labels
        this.dots.forEach((dot, index) => {
            dot.setAttribute('role', 'button');
            dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
            dot.setAttribute('tabindex', '0');
        });
    }
    
    announceSlideChange() {
        // Update aria-hidden attributes
        this.slides.forEach((slide, index) => {
            if (index === this.currentSlide) {
                slide.setAttribute('aria-hidden', 'false');
            } else {
                slide.setAttribute('aria-hidden', 'true');
            }
        });
        
        // Update aria-current for dots
        this.dots.forEach((dot, index) => {
            if (index === this.currentSlide) {
                dot.setAttribute('aria-current', 'true');
            } else {
                dot.removeAttribute('aria-current');
            }
        });
    }
    
    // Public API methods
    play() {
        this.isPlaying = true;
        this.startAutoAdvance();
    }
    
    pause() {
        this.isPlaying = false;
        this.stopAutoAdvance();
    }
    
    destroy() {
        this.stopAutoAdvance();
        // Remove event listeners if needed
    }
}

// Initialize slider when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize hero slider
    const heroSlider = new HeroSlider('.hero-slider');
    
    // Make it globally accessible if needed
    window.heroSlider = heroSlider;
    
    // Analytics tracking for TikTok Pixel
    if (typeof ttq !== 'undefined') {
        // Track hero slider interactions
        document.querySelectorAll('.hero-btn-primary').forEach(btn => {
            btn.addEventListener('click', function() {
                const serviceName = this.closest('.hero-slide').querySelector('h1').textContent;
                ttq.track('ClickButton', {
                    contents: [{
                        content_id: 'hero_cta',
                        content_type: 'product',
                        content_name: `Hero CTA: ${serviceName}`
                    }],
                    value: 0,
                    currency: 'EUR'
                });
            });
        });
        
        // Track portfolio views from hero
        document.querySelectorAll('.hero-btn-secondary').forEach(btn => {
            btn.addEventListener('click', function() {
                const serviceName = this.closest('.hero-slide').querySelector('h1').textContent;
                ttq.track('ViewContent', {
                    contents: [{
                        content_id: 'hero_portfolio',
                        content_type: 'product',
                        content_name: `Hero Portfolio: ${serviceName}`
                    }],
                    value: 0,
                    currency: 'EUR'
                });
            });
        });
    }
});

// Handle reduced motion preferences
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.addEventListener('DOMContentLoaded', function() {
        if (window.heroSlider) {
            window.heroSlider.autoAdvanceDelay = 8000; // Slower for reduced motion
        }
    });
}