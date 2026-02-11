// Portfolio Loader - Dynamically loads photos from Supabase based on page category
(async function() {
    // Initialize Supabase client
    const supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    
    // Get category from body data-category attribute
    const category = document.body.getAttribute('data-category');
    
    if (!category) {
        console.warn('No data-category attribute found on body tag');
        return;
    }
    
    // Get the gallery container
    const galleryContainer = document.getElementById('photoGallery');
    
    if (!galleryContainer) {
        console.warn('No #photoGallery container found');
        return;
    }
    
    // Show loading state
    galleryContainer.innerHTML = '<div class="col-12 text-center"><div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div></div>';
    
    try {
        // Fetch photos from Supabase
        const { data: photos, error } = await supabase
            .from('photos')
            .select('*')
            .eq('category', category)
            .order('order_index', { ascending: true });
        
        if (error) {
            throw error;
        }
        
        // Clear loading state
        galleryContainer.innerHTML = '';
        
        if (!photos || photos.length === 0) {
            galleryContainer.innerHTML = '<div class="col-12 text-center"><p class="text-muted">No photos available in this category yet.</p></div>';
            return;
        }
        
        // Create gallery grid wrapper
        const galleryGrid = document.createElement('div');
        galleryGrid.className = 'gallery-grid';
        galleryGrid.id = 'lightgallery';
        
        // Render each photo
        photos.forEach((photo, index) => {
            const item = document.createElement('div');
            item.className = 'item gallery-item';
            item.setAttribute('data-aos', 'fade');
            
            const img = document.createElement('img');
            img.src = photo.image_url;
            img.alt = photo.title || 'Portfolio Image';
            img.className = 'img-fluid';
            img.loading = 'lazy';
            
            // Add title as description if available
            if (photo.description) {
                img.setAttribute('data-sub-html', `<h4>${photo.title}</h4><p>${photo.description}</p>`);
            }
            
            item.appendChild(img);
            galleryGrid.appendChild(item);
        });
        
        galleryContainer.appendChild(galleryGrid);
        
        // Initialize lightGallery if available
        if (typeof $.fn.lightGallery !== 'undefined') {
            $('#lightgallery').lightGallery({
                thumbnail: true,
                animateThumb: false,
                showThumbByDefault: false
            });
        }
        
        // Reinitialize AOS animations if available
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
        
    } catch (error) {
        console.error('Error loading photos:', error);
        galleryContainer.innerHTML = '<div class="col-12 text-center"><p class="text-danger">Error loading photos. Please try again later.</p></div>';
    }
})();
