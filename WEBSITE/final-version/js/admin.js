// Initialize Supabase
let supabaseClient;

// Escape untrusted text before inserting into innerHTML (prevents stored XSS
// if a photo's title/description/category ever contains HTML/script).
function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value === undefined || value === null ? '' : String(value);
    return div.innerHTML;
}

// Check authentication on page load
window.addEventListener('DOMContentLoaded', async () => {
    console.log('Admin panel loading...');

    if (typeof SUPABASE_CONFIG === 'undefined') {
        console.error('ERROR: SUPABASE_CONFIG not defined!');
        alert('Configuration error! Check console.');
        return;
    }

    supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    console.log('Supabase client created');

    initTabs();

    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session) {
        console.log('User logged in:', session.user.email);
        showAdminPanel();
        loadPhotos();
        loadContentTab();
    } else {
        console.log('No session, showing login');
        showLogin();
    }
});

// Login
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const errorDiv = document.getElementById('loginError');

        console.log('Attempting login with:', email);

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('Login error:', error);
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
        } else {
            console.log('Login success!');
            showAdminPanel();
            loadPhotos();
            loadContentTab();
        }
    });
}

// Logout
async function logout() {
    await supabaseClient.auth.signOut();
    showLogin();
}

// Show/Hide sections
function showLogin() {
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('adminSection').classList.add('hidden');
}

function showAdminPanel() {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('adminSection').classList.remove('hidden');
}

// ---------------------------------------------------------------------
// Tabs (Photos / Site text) -- plain click handlers, no Bootstrap JS
// dependency since admin.html only loads Bootstrap's CSS.
// ---------------------------------------------------------------------
function initTabs() {
    const buttons = document.querySelectorAll('.admin-tab-btn');
    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            buttons.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.admin-tab-pane').forEach((pane) => {
                pane.classList.toggle('active', pane.id === btn.dataset.tab);
            });
        });
    });

    const republishBtn = document.getElementById('republishBtn');
    if (republishBtn) {
        republishBtn.addEventListener('click', () => triggerPublish({ manual: true }));
    }
}

// ---------------------------------------------------------------------
// Auto-publish: after a save, ask the "trigger-publish" Supabase Edge
// Function to kick off the GitHub Action that regenerates the static
// pages from the database and pushes them (Netlify redeploys from
// there, same as any other push). This is what makes dashboard edits
// show up on the live site without touching code or git by hand.
// If the Edge Function isn't deployed yet, this fails quietly in the
// console -- saving to the database still works either way.
// ---------------------------------------------------------------------
async function triggerPublish(opts) {
    const statusDiv = document.getElementById('publishStatus');
    const show = (text, kind) => {
        if (!statusDiv) return;
        statusDiv.textContent = text;
        statusDiv.className = 'alert alert-' + kind;
    };

    show('Publishing your changes to the live site...', 'info');

    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        const response = await fetch(`${SUPABASE_CONFIG.url}/functions/v1/trigger-publish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session ? session.access_token : SUPABASE_CONFIG.anonKey}`,
                apikey: SUPABASE_CONFIG.anonKey,
            },
        });

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`${response.status}: ${body}`);
        }

        show('Publish started -- the live site will update in a minute or two.', 'success');
    } catch (err) {
        console.error('Publish trigger failed:', err);
        show(
            'Saved to the database, but could not reach the auto-publish service. ' +
                'It may not be set up yet -- see SUPABASE_SETUP.md.',
            'warning'
        );
    }

    if (statusDiv) {
        setTimeout(() => statusDiv.classList.add('hidden'), 8000);
        statusDiv.classList.remove('hidden');
    }
}

// Photo Form Submit
if (document.getElementById('photoForm')) {
    document.getElementById('photoForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        console.log('Form submitted');

        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        const photoId = document.getElementById('photoId').value;
        const photoFile = document.getElementById('photoFile').files[0];
        const currentImageUrl = document.getElementById('currentImageUrl').value;

        let imageUrl = currentImageUrl;

        // Upload image if new file selected
        if (photoFile) {
            console.log('Uploading file:', photoFile.name);

            const fileExt = photoFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await supabaseClient.storage
                .from('photos')
                .upload(fileName, photoFile);

            if (uploadError) {
                console.error('Upload error:', uploadError);
                alert('Error uploading image: ' + uploadError.message);
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Photo';
                return;
            }

            console.log('File uploaded:', uploadData);

            const { data: { publicUrl } } = supabaseClient.storage
                .from('photos')
                .getPublicUrl(fileName);

            imageUrl = publicUrl;
            console.log('Public URL:', publicUrl);
        }

        if (!imageUrl) {
            alert('Please select an image!');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Photo';
            return;
        }

        const photoData = {
            title: document.getElementById('photoTitle').value,
            description: document.getElementById('photoDescription').value || '',
            category: document.getElementById('photoCategory').value,
            order_index: parseInt(document.getElementById('photoOrder').value) || 0,
            image_url: imageUrl
        };

        console.log('Saving to database:', photoData);

        if (photoId) {
            // Update existing photo
            const { data, error } = await supabaseClient
                .from('photos')
                .update(photoData)
                .eq('id', photoId)
                .select();

            if (error) {
                console.error('Update error:', error);
                alert('Error updating photo: ' + error.message);
            } else {
                console.log('Photo updated:', data);
                resetForm();
                loadPhotos();
                triggerPublish();
            }
        } else {
            // Insert new photo
            const { data, error } = await supabaseClient
                .from('photos')
                .insert([photoData])
                .select();

            if (error) {
                console.error('Insert error:', error);
                alert('Error adding photo: ' + error.message);
            } else {
                console.log('Photo added:', data);
                resetForm();
                loadPhotos();
                triggerPublish();
            }
        }

        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Photo';
    });
}

// Image preview
if (document.getElementById('photoFile')) {
    document.getElementById('photoFile').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log('File selected:', file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('previewImage');
                preview.src = e.target.result;
                preview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });
}

// Load photos from database
async function loadPhotos() {
    console.log('Loading photos...');
    const { data: photos, error } = await supabaseClient
        .from('photos')
        .select('*')
        .order('order_index', { ascending: true });

    if (error) {
        console.error('Error loading photos:', error);
        return;
    }

    console.log('Loaded photos:', photos.length);

    const grid = document.getElementById('photosGrid');
    grid.innerHTML = '';

    if (photos.length === 0) {
        grid.innerHTML = '<p class="text-muted col-12">No photos yet. Upload your first photo!</p>';
        return;
    }

    photos.forEach(photo => {
        const card = document.createElement('div');
        card.className = 'col-md-4';
        card.innerHTML = `
            <div class="photo-card">
                <img src="${escapeHtml(photo.image_url)}" alt="${escapeHtml(photo.title)}" onerror="this.src='https://via.placeholder.com/400x300?text=Image+Error'">
                <h5 class="mt-2">${escapeHtml(photo.title)}</h5>
                <p class="text-muted">${escapeHtml(photo.description || '')}</p>
                <span class="badge bg-primary">${escapeHtml(photo.category)}</span>
                <span class="badge bg-secondary">Order: ${escapeHtml(photo.order_index)}</span>
                <div class="mt-3">
                    <button class="btn btn-sm btn-warning edit-photo-btn" data-photo-id="${photo.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger delete-photo-btn" data-photo-id="${photo.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;

        grid.appendChild(card);

        // Attach event listeners to the buttons
        const editBtn = card.querySelector('.edit-photo-btn');
        const deleteBtn = card.querySelector('.delete-photo-btn');

        editBtn.addEventListener('click', () => {
            window.editPhoto(photo);
        });

        deleteBtn.addEventListener('click', () => {
            window.deletePhoto(photo.id);
        });
    });
}
// Edit photo - GLOBAL FUNCTION
window.editPhoto = function(photo) {
    document.getElementById('formTitle').textContent = 'Edit Photo';
    document.getElementById('photoId').value = photo.id;
    document.getElementById('photoTitle').value = photo.title;
    document.getElementById('photoDescription').value = photo.description || '';
    document.getElementById('photoCategory').value = photo.category;
    document.getElementById('photoOrder').value = photo.order_index;
    document.getElementById('currentImageUrl').value = photo.image_url;

    const preview = document.getElementById('previewImage');
    preview.src = photo.image_url;
    preview.classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Delete photo - GLOBAL FUNCTION
window.deletePhoto = async function(id) {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    console.log('Deleting photo:', id);

    const { error } = await supabaseClient
        .from('photos')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Delete error:', error);
        alert('Error deleting photo: ' + error.message);
    } else {
        console.log('Photo deleted');
        loadPhotos();
        triggerPublish();
    }
};

// Reset form
function resetForm() {
    document.getElementById('formTitle').textContent = 'Add New Photo';
    document.getElementById('photoForm').reset();
    document.getElementById('photoId').value = '';
    document.getElementById('currentImageUrl').value = '';
    document.getElementById('previewImage').classList.add('hidden');
}

// ---------------------------------------------------------------------
// Site text (Content tab)
//
// content-manifest.json (generated by scripts/scan-content.js, served
// as a plain static file next to admin.html) lists every editable field
// the site's pages currently have, with its default/fallback text. This
// merges that catalogue with whatever's already been saved to the
// site_content table, so every field shows up with its current value
// even before it's ever been edited from here.
// ---------------------------------------------------------------------
const PAGE_LABELS = { home: 'Home', about: 'About', contact: 'Contact' };
const LOCALE_LABELS = { en: 'English', fr: 'Français' };

async function loadContentTab() {
    const container = document.getElementById('contentSections');
    if (!container) return;

    try {
        const [manifestRes, contentRows] = await Promise.all([
            fetch('content-manifest.json', { cache: 'no-store' }),
            supabaseClient.from('site_content').select('*'),
        ]);

        if (!manifestRes.ok) {
            throw new Error(`content-manifest.json: ${manifestRes.status}`);
        }
        const manifest = await manifestRes.json();

        if (contentRows.error) {
            throw contentRows.error;
        }

        const savedByKey = {}; // "page|locale|key" -> row
        (contentRows.data || []).forEach((row) => {
            savedByKey[`${row.page}|${row.locale}|${row.key}`] = row;
        });

        renderContentSections(container, manifest, savedByKey);
    } catch (err) {
        console.error('Could not load site text:', err);
        container.innerHTML =
            '<p class="text-danger">Could not load the site-text editor. Check the console, and confirm ' +
            'the site_content table exists (see SUPABASE_SETUP.md).</p>';
    }
}

function renderContentSections(container, manifest, savedByKey) {
    container.innerHTML = '';

    const pages = manifest.pages || {};
    Object.keys(pages).forEach((page) => {
        Object.keys(pages[page]).forEach((locale) => {
            const fields = pages[page][locale];
            const section = document.createElement('div');
            section.className = 'content-section';
            section.dataset.page = page;
            section.dataset.locale = locale;

            const title = document.createElement('h4');
            title.textContent = `${PAGE_LABELS[page] || page} — ${LOCALE_LABELS[locale] || locale}`;
            section.appendChild(title);

            const meta = document.createElement('div');
            meta.className = 'section-meta';
            meta.textContent = `${fields.length} editable field${fields.length === 1 ? '' : 's'}`;
            section.appendChild(meta);

            fields.forEach((field) => {
                const saved = savedByKey[`${page}|${locale}|${field.key}`];
                const currentValue = saved ? saved.content : field.default;
                const contentType = saved ? saved.content_type : field.content_type;

                const wrap = document.createElement('div');
                wrap.className = 'content-field';
                wrap.dataset.key = field.key;
                wrap.dataset.contentType = contentType;
                wrap.dataset.originalValue = currentValue;

                const label = document.createElement('label');
                label.textContent = field.label;
                wrap.appendChild(label);

                const isLong = contentType === 'html' || currentValue.length > 80;
                const input = document.createElement(isLong ? 'textarea' : 'input');
                if (!isLong) input.type = 'text';
                else input.rows = Math.min(6, Math.max(2, Math.ceil(currentValue.length / 60)));
                input.className = 'form-control';
                input.value = currentValue;
                input.addEventListener('input', () => {
                    wrap.classList.toggle('is-dirty', input.value !== wrap.dataset.originalValue);
                });
                wrap.appendChild(input);

                section.appendChild(wrap);
            });

            const saveBtn = document.createElement('button');
            saveBtn.type = 'button';
            saveBtn.className = 'btn btn-success save-section-btn';
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save changes';
            saveBtn.addEventListener('click', () => saveContentSection(section, saveBtn));
            section.appendChild(saveBtn);

            container.appendChild(section);
        });
    });
}

async function saveContentSection(section, saveBtn) {
    const page = section.dataset.page;
    const locale = section.dataset.locale;
    const dirtyFields = Array.from(section.querySelectorAll('.content-field.is-dirty'));

    if (dirtyFields.length === 0) {
        alert('No changes to save in this section.');
        return;
    }

    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    const rows = dirtyFields.map((wrap) => {
        const input = wrap.querySelector('textarea, input');
        return {
            page,
            locale,
            key: wrap.dataset.key,
            content: input.value,
            content_type: wrap.dataset.contentType,
        };
    });

    const { error } = await supabaseClient
        .from('site_content')
        .upsert(rows, { onConflict: 'page,locale,key' });

    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i class="fas fa-save"></i> Save changes';

    if (error) {
        console.error('Error saving site text:', error);
        alert('Error saving text: ' + error.message);
        return;
    }

    dirtyFields.forEach((wrap) => {
        const input = wrap.querySelector('textarea, input');
        wrap.dataset.originalValue = input.value;
        wrap.classList.remove('is-dirty');
    });

    triggerPublish();
}
