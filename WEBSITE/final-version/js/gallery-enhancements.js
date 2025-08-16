// Gallery Enhancements with Right-Click Protection and Mobile Optimization

(function() {
    'use strict';

    // Right-click protection
    function disableRightClick() {
        // Disable right-click context menu on images
        document.addEventListener('contextmenu', function(e) {
            if (e.target.tagName === 'IMG' && !e.target.classList.contains('no-protection')) {
                e.preventDefault();
                return false;
            }
        });

        // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        document.addEventListener('keydown', function(e) {
            if (e.keyCode === 123 || // F12
                (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
                (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
                (e.ctrlKey && e.keyCode === 85)) { // Ctrl+U
                e.preventDefault();
                return false;
            }
        });

        // Disable drag and drop on images
        document.addEventListener('dragstart', function(e) {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
                return false;
            }
        });
    }

    // Initialize lightbox for gallery images
    function initializeLightbox() {
        // Add lightbox functionality to gallery items
        const galleryItems = document.querySelectorAll('.gallery-item img');
        
        galleryItems.forEach(function(img, index) {
            img.setAttribute('data-src', img.src);
            img.setAttribute('data-sub-html', img.alt || 'Photography by Melissa Paris');
            
            // Make images clickable
            img.style.cursor = 'pointer';
            img.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Create lightbox gallery
                const gallery = lightGallery(img.closest('.row') || img.closest('.gallery-grid') || document.body, {
                    selector: '.gallery-item img',
                    thumbnail: true,
                    animateThumb: true,
                    showThumbByDefault: false,
                    mode: 'lg-fade',
                    cssEasing: 'cubic-bezier(0.25, 0, 0.25, 1)',
                    speed: 600,
                    addClass: 'lg-custom',
                    download: false, // Disable download
                    zoom: false, // Disable zoom for mobile
                    fullScreen: false, // Disable fullscreen
                    share: false, // Disable sharing
                    autoplayFirstVideo: false,
                    pager: false,
                    galleryId: 'gallery-' + index,
                    startAnimationDuration: 400,
                    backdropDuration: 300
                });
                
                // Open at clicked image
                gallery.openGallery(index);
            });
        });

        // Add lightbox to home page gallery images
        const homeGalleryImages = document.querySelectorAll('.image-wrap-2 img');
        homeGalleryImages.forEach(function(img, index) {
            img.style.cursor = 'pointer';
            img.addEventListener('click', function(e) {
                e.preventDefault();
                
                const gallery = lightGallery(document.querySelector('.container-fluid'), {
                    selector: '.image-wrap-2 img',
                    thumbnail: true,
                    mode: 'lg-fade',
                    download: false,
                    zoom: false,
                    fullScreen: false,
                    share: false,
                    startAnimationDuration: 400,
                    backdropDuration: 300
                });
                
                gallery.openGallery(index);
            });
        });
    }

    // Track booking button clicks
    function trackBookingClicks() {
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('book-now-btn') || 
                e.target.classList.contains('floating-book-btn') || 
                e.target.classList.contains('hero-book-btn')) {
                
                // TikTok tracking
                if (typeof ttq !== 'undefined') {
                    ttq.track('ClickButton', {
                        contents: [{
                            content_id: 'book_now_button',
                            content_type: 'product',
                            content_name: 'Book Now CTA'
                        }],
                        value: 0,
                        currency: 'EUR'
                    });
                }
            }
        });
    }

    // Fix social media icons visibility
    function fixSocialIcons() {
        const socialIcons = document.querySelectorAll('.site-menu[data-class="social"] a i');
        socialIcons.forEach(function(icon) {
            icon.style.opacity = '1';
            icon.style.visibility = 'visible';
        });

        // Ensure Font Awesome is loaded
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const faLink = document.createElement('link');
            faLink.rel = 'stylesheet';
            faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
            document.head.appendChild(faLink);
        }
    }

    // Mobile menu improvements
    function improveMobileMenu() {
        const mobileMenuToggle = document.querySelector('.js-menu-toggle');
        const mobileMenu = document.querySelector('.site-mobile-menu');
        
        if (mobileMenuToggle && mobileMenu) {
            // Improve mobile menu animation
            mobileMenuToggle.addEventListener('click', function() {
                setTimeout(function() {
                    if (document.body.classList.contains('offcanvas-menu')) {
                        mobileMenu.style.transform = 'translateX(0%)';
                    } else {
                        mobileMenu.style.transform = 'translateX(100%)';
                    }
                }, 10);
            });
        }
    }

    // Lazy loading for better performance
    function initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[loading="lazy"]').forEach(function(img) {
                imageObserver.observe(img);
            });
        }
    }

    // Initialize everything when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        disableRightClick();
        initializeLightbox();
        trackBookingClicks();
        fixSocialIcons();
        improveMobileMenu();
        initLazyLoading();
        
        // Additional mobile optimizations
        if (window.innerWidth <= 768) {
            document.body.classList.add('mobile-device');
        }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768) {
            document.body.classList.add('mobile-device');
        } else {
            document.body.classList.remove('mobile-device');
        }
    });

})();