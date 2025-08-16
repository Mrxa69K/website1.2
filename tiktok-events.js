// TikTok Events Tracking for Photography Website

// Track page views on all pages
ttq.track('ViewContent', {
  "contents": [
    {
      "content_type": "product", 
      "content_category": "photography",
      "content_name": document.title || "Photography Page"
    }
  ],
  "description": "Photography website page view"
});

// Track contact form submissions
function trackContactForm() {
  ttq.track('CompleteRegistration', {
    "contents": [
      {
        "content_type": "product",
        "content_category": "photography",
        "content_name": "Contact Form Submission"
      }
    ],
    "description": "Contact form completed"
  });
}

// Track portfolio/gallery views
function trackPortfolioView(portfolioName) {
  ttq.track('ViewContent', {
    "contents": [
      {
        "content_type": "product",
        "content_category": "photography",
        "content_name": portfolioName || "Portfolio View"
      }
    ],
    "description": "Portfolio gallery viewed"
  });
}

// Track booking/inquiry actions
function trackBookingInquiry() {
  ttq.track('InitiateCheckout', {
    "contents": [
      {
        "content_type": "product",
        "content_category": "photography",
        "content_name": "Photography Booking Inquiry"
      }
    ],
    "description": "Photography booking inquiry initiated"
  });
}

// Track service page views
function trackServiceView(serviceName) {
  ttq.track('ViewContent', {
    "contents": [
      {
        "content_type": "product",
        "content_category": "photography",
        "content_name": serviceName || "Photography Service"
      }
    ],
    "description": "Photography service page viewed"
  });
}

// Auto-track common events when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Track contact form submissions
  const contactForms = document.querySelectorAll('form[action*="contact"], form.contact-form, #contact-form');
  contactForms.forEach(form => {
    form.addEventListener('submit', trackContactForm);
  });
  
  // Track booking forms
  const bookingForms = document.querySelectorAll('form[action*="book"], form.booking-form, #booking-form');
  bookingForms.forEach(form => {
    form.addEventListener('submit', trackBookingInquiry);
  });
  
  // Track portfolio clicks
  const portfolioLinks = document.querySelectorAll('a[href*="portfolio"], a[href*="gallery"], .portfolio-link, .gallery-link');
  portfolioLinks.forEach(link => {
    link.addEventListener('click', function() {
      trackPortfolioView(this.textContent || this.getAttribute('data-portfolio-name'));
    });
  });
  
  // Auto-detect service pages and track views
  const currentPath = window.location.pathname.toLowerCase();
  if (currentPath.includes('wedding')) {
    trackServiceView('Wedding Photography');
  } else if (currentPath.includes('portrait')) {
    trackServiceView('Portrait Photography');
  } else if (currentPath.includes('event')) {
    trackServiceView('Event Photography');
  } else if (currentPath.includes('commercial')) {
    trackServiceView('Commercial Photography');
  } else if (currentPath.includes('service')) {
    trackServiceView('Photography Services');
  }
});
