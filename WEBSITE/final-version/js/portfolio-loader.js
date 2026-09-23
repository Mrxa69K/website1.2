// Portfolio Photo Loader
// Appends photos managed from the admin dashboard (Supabase) to the
// existing static gallery on each category page, so photos added/edited
// from the dashboard show up on the live site without touching the HTML.
//
// Deliberately additive rather than replace-the-whole-grid: the hand-placed
// static photos stay (good for SEO / no-JS visitors), and dashboard photos
// are appended after them using the exact same markup as the page's last
// existing gallery item (so it matches that page's layout, EN or FR).

(async function() {
    if (typeof supabase === 'undefined') {
        console.error('Supabase not loaded!');
        return;
    }
    if (typeof SUPABASE_CONFIG === 'undefined') {
        console.error('SUPABASE_CONFIG not found!');
        return;
    }

    const category = document.body.dataset.category;
    if (!category) {
        return; // page isn't wired to a category, nothing to do
    }

    const gallery = document.getElementById('photoGallery');
    if (!gallery) {
        console.warn('Gallery container #photoGallery not found');
        return;
    }

    const supabaseClient = window.supabase.createClient(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.anonKey
    );

    const { data: photos, error } = await supabaseClient
        .from('photos')
        .select('*')
        .eq('category', category)
        .order('order_index', { ascending: true });

    if (error) {
        console.error('Error loading photos:', error);
        return;
    }
    if (!photos || photos.length === 0) {
        return;
    }

    // Use the last existing static item as a template so new items inherit
    // this page's exact markup/classes/inline styles.
    const existingItems = gallery.querySelectorAll('.gallery-item');
    const templateItem = existingItems[existingItems.length - 1];

    // Avoid re-adding the same photo if this script runs more than once
    // (e.g. bfcache navigation) by tracking known src values already on
    // the page.
    const existingSrcs = new Set(
        Array.from(gallery.querySelectorAll('img')).map(img => img.getAttribute('src'))
    );

    photos.forEach(photo => {
        if (existingSrcs.has(photo.image_url)) return;

        let item;
        if (templateItem) {
            item = templateItem.cloneNode(true);
            const img = item.querySelector('img');
            img.src = photo.image_url;
            img.alt = photo.title || `${category} photography Paris - Melissa Photography`;
            img.removeAttribute('height');
            img.removeAttribute('width');
        } else {
            // No static items on this page to copy markup from — fall back
            // to a plain grid item, matching the container's own layout
            // (EN pages use a CSS-grid ".gallery-grid" with plain items; FR
            // pages use a Bootstrap ".row" with per-item column classes).
            item = document.createElement('div');
            const isBootstrapRow = gallery.classList.contains('row');
            item.className = isBootstrapRow
                ? 'col-sm-6 col-md-4 col-lg-3 col-xl-3 item gallery-item'
                : 'item gallery-item';
            if (isBootstrapRow) {
                item.style.marginBottom = '20px';
                item.style.padding = '10px';
            }
            item.setAttribute('data-aos', 'fade');
            const img = document.createElement('img');
            img.src = photo.image_url;
            img.alt = photo.title || `${category} photography Paris - Melissa Photography`;
            img.className = 'img-fluid';
            img.loading = 'lazy';
            item.appendChild(img);
        }
        gallery.appendChild(item);
    });

    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
    if (typeof lightGallery !== 'undefined' && gallery.id === 'lightgallery') {
        lightGallery(gallery);
    }
})();
