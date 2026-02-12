// Portfolio Photo Loader
// Dynamically loads photos from Supabase

(async function() {
    // Check if Supabase is loaded
    if (typeof supabase === 'undefined') {
        console.error('Supabase not loaded!');
        return;
    }
    
    // Check if config exists
    if (typeof SUPABASE_CONFIG === 'undefined') {
        console.error('SUPABASE_CONFIG not found!');
        return;
    }
    
    // Initialize Supabase client
    const supabaseClient = window.supabase.createClient(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.anonKey
    );
    
    // Get category from body data attribute
    const category = document.body.dataset.category;
    
    if (!category) {
        console.warn('No category found on this page');
        return;
    }
    
    console.log(`Loading ${category} photos...`);
    
    // Load photos from Supabase
    const { data: photos, error } = await supabaseClient
        .from('photos')
        .select('*')
        .eq('category', category)
        .order('order_index', { ascending: true });
    
    if (error) {
        console.error('Error loading photos:', error);
        return;
    }
    
    console.log(`Loaded ${photos.length} photos`);
    
    // Find gallery container
    const gallery = document.getElementById('photoGallery');
    
    if (!gallery) {
        console.warn('Gallery container #photoGallery not found');
        return;
    }
    
    // Clear existing content
    gallery.innerHTML = '';
    
    if (photos.length === 0) {
        console.log('No photos to display for category:', category);
        return;
    }
    
    // Create gallery grid matching your existing style
    const galleryGrid = document.createElement('div');
    galleryGrid.className = 'gallery-grid';
    
    // Generate photo items
    photos.forEach(photo => {
        const item = document.createElement('div');
        item.className = 'item gallery-item';
        item.setAttribute('data-aos', 'fade');
        
        const img = document.createElement('img');
        img.src = photo.image_url;
        img.alt = photo.title || 'Wedding Photography Paris';
        img.className = 'img-fluid';
        img.loading = 'lazy';
        
        item.appendChild(img);
        galleryGrid.appendChild(item);
    });
    
    gallery.appendChild(galleryGrid);
    
    // Reinitialize AOS animations
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
    
    // Reinitialize lightGallery if present
    if (typeof lightGallery !== 'undefined' && gallery.querySelector('.gallery-grid')) {
        lightGallery(gallery.querySelector('.gallery-grid'));
    }
})();
