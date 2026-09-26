// Initialize Supabase
let supabaseClient;

// Escape untrusted text before inserting into innerHTML (prevents stored XSS
// if a photo's title/description/category ever contains HTML/script).
function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value === undefined || value === null ? '' : String(value);
    return div.innerHTML;
}

function debounce(fn, waitMs) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), waitMs);
    };
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

    // Listen for the PASSWORD_RECOVERY event Supabase fires when someone
    // lands here via a "reset your password" email link, so we can swap
    // the login panel for the "set new password" one. Registered before
    // the session check below since supabase-js parses the recovery
    // tokens out of the URL (and can fire this event) as soon as the
    // client is created.
    supabaseClient.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
            console.log('Password recovery link opened');
            showResetPasswordPanel();
        }
    });

    initTabs();
    initExtraControls();

    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session) {
        console.log('User logged in:', session.user.email);
        showAdminPanel();
        loadPhotos();
        loadContentTab();
        loadPublishHistory();
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
            loadPublishHistory();
        }
    });
}

// ---------------------------------------------------------------------
// Password recovery ("Forgot your password?" on the login screen)
// ---------------------------------------------------------------------
if (document.getElementById('forgotPasswordLink')) {
    document.getElementById('forgotPasswordLink').addEventListener('click', () => {
        document.getElementById('loginPanel').classList.add('hidden');
        document.getElementById('forgotPasswordSection').classList.remove('hidden');
    });
}

if (document.getElementById('forgotBackLink')) {
    document.getElementById('forgotBackLink').addEventListener('click', () => {
        document.getElementById('forgotPasswordSection').classList.add('hidden');
        document.getElementById('loginPanel').classList.remove('hidden');
    });
}

if (document.getElementById('forgotPasswordForm')) {
    document.getElementById('forgotPasswordForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('forgotEmail').value;
        const errorDiv = document.getElementById('forgotError');
        const successDiv = document.getElementById('forgotSuccess');
        const btn = document.getElementById('forgotSubmitBtn');

        errorDiv.classList.add('hidden');
        successDiv.classList.add('hidden');
        btn.disabled = true;

        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + window.location.pathname,
        });

        btn.disabled = false;

        if (error) {
            console.error('Reset request error:', error);
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
            return;
        }

        successDiv.textContent = "If an account exists for that email, a reset link is on its way -- check your inbox.";
        successDiv.classList.remove('hidden');
    });
}

if (document.getElementById('resetPasswordForm')) {
    document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const pw = document.getElementById('newPassword').value;
        const pw2 = document.getElementById('newPasswordConfirm').value;
        const errorDiv = document.getElementById('resetError');
        const successDiv = document.getElementById('resetSuccess');

        errorDiv.classList.add('hidden');
        successDiv.classList.add('hidden');

        if (pw !== pw2) {
            errorDiv.textContent = 'Passwords do not match.';
            errorDiv.classList.remove('hidden');
            return;
        }

        const { error } = await supabaseClient.auth.updateUser({ password: pw });

        if (error) {
            console.error('Set new password error:', error);
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
            return;
        }

        successDiv.textContent = 'Password updated. Opening the panel...';
        successDiv.classList.remove('hidden');

        setTimeout(() => {
            showAdminPanel();
            loadPhotos();
            loadContentTab();
            loadPublishHistory();
        }, 1000);
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
    document.getElementById('loginPanel').classList.remove('hidden');
    document.getElementById('forgotPasswordSection').classList.add('hidden');
    document.getElementById('resetPasswordSection').classList.add('hidden');
}

function showResetPasswordPanel() {
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('adminSection').classList.add('hidden');
    document.getElementById('loginPanel').classList.add('hidden');
    document.getElementById('forgotPasswordSection').classList.add('hidden');
    document.getElementById('resetPasswordSection').classList.remove('hidden');
}

function showAdminPanel() {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('adminSection').classList.remove('hidden');
}

// ---------------------------------------------------------------------
// Tabs (Photos / Site text) -- plain click handlers, no Bootstrap JS
// dependency since cpr.html only loads Bootstrap's CSS.
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
        republishBtn.addEventListener('click', () => triggerPublish({ manual: true, reason: 'Manual republish' }));
    }
}

// Wiring for the toolbars/controls added on top of the original panel:
// photo search + category filter, content-tab search, publish history
// toggle. Kept separate from initTabs() so each concern stays easy to
// find.
function initExtraControls() {
    const publishHistoryBtn = document.getElementById('publishHistoryBtn');
    if (publishHistoryBtn) {
        publishHistoryBtn.addEventListener('click', () => {
            const panel = document.getElementById('publishHistoryPanel');
            panel.classList.toggle('hidden');
            if (!panel.classList.contains('hidden')) loadPublishHistory();
        });
    }

    const photoSearchInput = document.getElementById('photoSearchInput');
    if (photoSearchInput) {
        photoSearchInput.addEventListener('input', () => renderPhotosGrid());
    }

    const photoCategoryFilter = document.getElementById('photoCategoryFilter');
    if (photoCategoryFilter) {
        photoCategoryFilter.addEventListener('change', () => renderPhotosGrid());
    }

    const contentSearchInput = document.getElementById('contentSearchInput');
    if (contentSearchInput) {
        contentSearchInput.addEventListener('input', (e) => {
            filterContentSections(e.target.value.trim().toLowerCase());
        });
    }
}

// ---------------------------------------------------------------------
// Toasts -- currently only used for "photo deleted, undo?" (see
// window.deletePhoto below), but written generically in case another
// reversible action wants the same pattern later.
// ---------------------------------------------------------------------
function showUndoToast(message, onUndo, onCommit, delayMs) {
    const container = document.getElementById('toastContainer');
    if (!container) {
        onCommit();
        return;
    }

    const toast = document.createElement('div');
    toast.className = 'panel-toast';

    const msg = document.createElement('span');
    msg.textContent = message;
    toast.appendChild(msg);

    const undoBtn = document.createElement('button');
    undoBtn.type = 'button';
    undoBtn.className = 'toast-undo-btn';
    undoBtn.textContent = 'Undo';
    toast.appendChild(undoBtn);

    container.appendChild(toast);

    let settled = false;
    const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        toast.remove();
        onCommit();
    }, delayMs || 6000);

    undoBtn.addEventListener('click', () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        toast.remove();
        onUndo();
    });
}

// ---------------------------------------------------------------------
// Auto-publish: after a save, ask the "trigger-publish" Supabase Edge
// Function to kick off the GitHub Action that regenerates the static
// pages from the database and pushes them (Netlify redeploys from
// there, same as any other push). This is what makes dashboard edits
// show up on the live site without touching code or git by hand.
//
// The Edge Function also creates a publish_log row and hands back its
// id, which we then poll: a save used to just say "Publish started" and
// leave Melissa guessing whether it actually worked. Now the status
// banner follows the row to success/failed (or "taking a while" if it
// times out), and "Publish history" shows the last few runs regardless.
// If the Edge Function isn't deployed yet, this fails quietly in the
// console -- saving to the database still works either way.
// ---------------------------------------------------------------------
async function triggerPublish(opts) {
    const options = opts || {};
    const statusDiv = document.getElementById('publishStatus');

    const show = (text, kind) => {
        if (!statusDiv) return;
        if (statusDiv._hideTimer) {
            clearTimeout(statusDiv._hideTimer);
            statusDiv._hideTimer = null;
        }
        statusDiv.textContent = text;
        statusDiv.className = 'alert alert-' + kind;
        statusDiv.classList.remove('hidden');
        if (kind === 'success') {
            statusDiv._hideTimer = setTimeout(() => statusDiv.classList.add('hidden'), 10000);
        }
    };

    show('Publishing your changes to the live site...', 'info');

    let logId = null;
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        const response = await fetch(`${SUPABASE_CONFIG.url}/functions/v1/trigger-publish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session ? session.access_token : SUPABASE_CONFIG.anonKey}`,
                apikey: SUPABASE_CONFIG.anonKey,
            },
            body: JSON.stringify({ reason: options.reason || 'Dashboard save' }),
        });

        const body = await response.json().catch(() => ({}));
        logId = body.log_id || null;

        if (!response.ok) {
            throw new Error(body.error || `${response.status}`);
        }

        show('Publish started -- checking whether it lands...', 'info');
    } catch (err) {
        console.error('Publish trigger failed:', err);
        show(
            'Saved to the database, but could not reach the auto-publish service. ' +
                'It may not be set up yet -- see SUPABASE_SETUP.md.',
            'warning'
        );
        loadPublishHistory();
        return;
    }

    if (logId) {
        pollPublishLog(logId, show);
    } else {
        // Old/undeployed Edge Function without publish_log wiring -- can't
        // confirm success, so say so plainly instead of a bare "started".
        show('Publish started, but its result can’t be confirmed from here. Check "Publish history".', 'warning');
    }
    loadPublishHistory();
}

async function pollPublishLog(logId, show) {
    const startedAt = Date.now();
    const maxWaitMs = 3 * 60 * 1000;
    const intervalMs = 4000;

    const check = async () => {
        const { data, error } = await supabaseClient.from('publish_log').select('*').eq('id', logId).single();

        if (error) {
            console.error('Could not poll publish_log:', error);
            return true; // stop polling -- nothing more we can learn here
        }

        if (data.status === 'success') {
            show('Published -- your changes are live.', 'success');
            loadPublishHistory();
            return true;
        }

        if (data.status === 'failed') {
            show(
                (data.error ? `Publish failed: ${data.error}` : 'Publish failed.') +
                    ' Check "Publish history" for the run, or try "Republish site".',
                'danger'
            );
            loadPublishHistory();
            return true;
        }

        if (Date.now() - startedAt > maxWaitMs) {
            show(
                'Publish is taking longer than expected. It may still finish -- check "Publish history" or GitHub Actions.',
                'warning'
            );
            loadPublishHistory();
            return true;
        }

        return false; // still pending -- keep polling
    };

    const poll = async () => {
        const done = await check();
        if (!done) setTimeout(poll, intervalMs);
    };
    setTimeout(poll, intervalMs);
}

function formatRelativeTime(iso) {
    const then = new Date(iso).getTime();
    const diffSec = Math.round((Date.now() - then) / 1000);
    if (diffSec < 5) return 'just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.round(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.round(diffSec / 3600)}h ago`;
    return new Date(iso).toLocaleDateString();
}

async function loadPublishHistory() {
    const list = document.getElementById('publishHistoryList');
    if (!list) return;

    const { data, error } = await supabaseClient
        .from('publish_log')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Could not load publish history:', error);
        list.innerHTML = '<p class="text-danger">Could not load publish history.</p>';
        return;
    }

    if (!data || data.length === 0) {
        list.innerHTML = '<p class="text-muted">No publishes yet.</p>';
        return;
    }

    list.innerHTML = '';
    data.forEach((row) => {
        const el = document.createElement('div');
        el.className = 'publish-history-row';

        const statusSpan = document.createElement('span');
        statusSpan.className = `publish-history-status status-${escapeHtml(row.status)}`;
        statusSpan.textContent = row.status;
        el.appendChild(statusSpan);

        const reasonSpan = document.createElement('span');
        reasonSpan.className = 'publish-history-reason';
        reasonSpan.textContent = row.reason || 'Publish';
        el.appendChild(reasonSpan);

        const timeSpan = document.createElement('span');
        timeSpan.className = 'publish-history-time';
        timeSpan.textContent = formatRelativeTime(row.started_at);
        el.appendChild(timeSpan);

        if (row.run_url) {
            const link = document.createElement('a');
            link.href = row.run_url;
            link.target = '_blank';
            link.rel = 'noopener';
            link.textContent = 'View run';
            el.appendChild(link);
        }

        list.appendChild(el);
    });
}

// ---------------------------------------------------------------------
// Client-side image optimization, so photo uploads go through the same
// kind of resize/recompress the rest of the site's images already got
// instead of quietly landing full-resolution over time.
// ---------------------------------------------------------------------
const IMAGE_MAX_DIMENSION = 2400; // matches roughly what's already live (~2048px long edge)
const IMAGE_QUALITY = 0.82;

function loadImageBitmapOrElement(file) {
    if (typeof createImageBitmap === 'function') {
        return createImageBitmap(file);
    }
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

async function optimizeImageFile(file) {
    if (!file || !file.type || !file.type.startsWith('image/')) return file;

    const canvas = document.createElement('canvas');
    if (typeof canvas.getContext !== 'function' || typeof canvas.toBlob !== 'function') {
        return file; // no canvas support -- upload as-is rather than fail
    }

    try {
        const source = await loadImageBitmapOrElement(file);
        const width = source.width;
        const height = source.height;

        if (!width || !height) return file;

        // Already a small, already-webp file -- nothing useful to do.
        if (file.type === 'image/webp' && width <= IMAGE_MAX_DIMENSION && height <= IMAGE_MAX_DIMENSION && file.size < 400 * 1024) {
            return file;
        }

        const scale = Math.min(1, IMAGE_MAX_DIMENSION / Math.max(width, height));
        const targetW = Math.max(1, Math.round(width * scale));
        const targetH = Math.max(1, Math.round(height * scale));

        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(source, 0, 0, targetW, targetH);

        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', IMAGE_QUALITY));
        if (!blob) return file; // browser can't encode webp -- fall back to the original

        const optimizedName = file.name.replace(/\.[^.]+$/, '') + '.webp';
        console.log(`Optimized ${file.name}: ${file.size}b -> ${blob.size}b (${targetW}x${targetH})`);
        return new File([blob], optimizedName, { type: 'image/webp' });
    } catch (err) {
        console.warn('Image optimization skipped, uploading original:', err);
        return file;
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
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Optimizing image...';
            const fileToUpload = await optimizeImageFile(photoFile);

            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            console.log('Uploading file:', fileToUpload.name);

            const fileExt = fileToUpload.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await supabaseClient.storage
                .from('photos')
                .upload(fileName, fileToUpload);

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

        const title = document.getElementById('photoTitle').value;
        const altTextInput = document.getElementById('photoAltText').value.trim();

        const photoData = {
            title,
            description: document.getElementById('photoDescription').value || '',
            alt_text: altTextInput || title,
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
                triggerPublish({ reason: 'Photo save' });
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
                triggerPublish({ reason: 'Photo save' });
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

// ---------------------------------------------------------------------
// Photos tab: load, search/filter, drag-and-drop reorder
// ---------------------------------------------------------------------
let allPhotos = [];
let dragSourcePhotoId = null;

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
    allPhotos = photos || [];
    renderPhotosGrid();
}

// Renders #photosGrid from the in-memory allPhotos list, applying the
// search box + category filter. Drag-to-reorder is only turned on when
// filtered down to exactly one category with no search text -- order_index
// is scoped per category, and reordering a mixed/filtered view wouldn't
// mean anything.
function renderPhotosGrid() {
    const grid = document.getElementById('photosGrid');
    if (!grid) return;

    const searchInput = document.getElementById('photoSearchInput');
    const categorySelect = document.getElementById('photoCategoryFilter');
    const term = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const category = categorySelect ? categorySelect.value : '';
    const reorderHint = document.getElementById('reorderHint');

    let photos = allPhotos;
    if (category) photos = photos.filter((p) => p.category === category);
    if (term) {
        photos = photos.filter((p) =>
            [p.title, p.description, p.alt_text].some((v) => (v || '').toLowerCase().includes(term))
        );
    }

    const dragEnabled = Boolean(category) && !term;
    if (reorderHint) {
        reorderHint.textContent = dragEnabled
            ? `Drag photos to reorder them within ${category}.`
            : 'Filter to a single category (with no search text) to drag photos into a new order.';
    }

    grid.innerHTML = '';

    if (photos.length === 0) {
        grid.innerHTML = '<p class="text-muted col-12">No photos match.</p>';
        return;
    }

    photos.forEach((photo) => {
        const card = document.createElement('div');
        card.className = 'col-md-4';
        card.innerHTML = `
            <div class="photo-card${dragEnabled ? ' draggable' : ''}" data-photo-id="${photo.id}"${dragEnabled ? ' draggable="true"' : ''}>
                ${dragEnabled ? '<div class="drag-handle"><i class="fas fa-grip-lines"></i> Drag to reorder</div>' : ''}
                <img src="${escapeHtml(photo.image_url)}" alt="${escapeHtml(photo.alt_text || photo.title)}" onerror="this.src='https://via.placeholder.com/400x300?text=Image+Error'">
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

        const cardEl = card.querySelector('.photo-card');
        cardEl.querySelector('.edit-photo-btn').addEventListener('click', () => window.editPhoto(photo));
        cardEl.querySelector('.delete-photo-btn').addEventListener('click', () => window.deletePhoto(photo.id));

        if (dragEnabled) attachDragHandlers(cardEl);
    });
}

function attachDragHandlers(cardEl) {
    cardEl.addEventListener('dragstart', () => {
        dragSourcePhotoId = cardEl.dataset.photoId;
        cardEl.classList.add('dragging');
    });
    cardEl.addEventListener('dragend', () => {
        cardEl.classList.remove('dragging');
        document.querySelectorAll('.photo-card.drag-over').forEach((el) => el.classList.remove('drag-over'));
    });
    cardEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        cardEl.classList.add('drag-over');
    });
    cardEl.addEventListener('dragleave', () => cardEl.classList.remove('drag-over'));
    cardEl.addEventListener('drop', (e) => {
        e.preventDefault();
        cardEl.classList.remove('drag-over');
        const targetId = cardEl.dataset.photoId;
        if (!dragSourcePhotoId || dragSourcePhotoId === targetId) return;
        reorderPhotos(dragSourcePhotoId, targetId);
    });
}

async function reorderPhotos(sourceId, targetId) {
    const categorySelect = document.getElementById('photoCategoryFilter');
    const category = categorySelect ? categorySelect.value : '';
    if (!category) return;

    const inCategory = allPhotos
        .filter((p) => p.category === category)
        .sort((a, b) => a.order_index - b.order_index);

    const fromIdx = inCategory.findIndex((p) => String(p.id) === String(sourceId));
    const toIdx = inCategory.findIndex((p) => String(p.id) === String(targetId));
    if (fromIdx === -1 || toIdx === -1) return;

    const [moved] = inCategory.splice(fromIdx, 1);
    inCategory.splice(toIdx, 0, moved);

    // Re-number by 10s in the new order and reflect it in allPhotos right
    // away so the grid re-renders immediately, before the network round-trip.
    inCategory.forEach((photo, i) => {
        const newOrder = (i + 1) * 10;
        photo.order_index = newOrder;
        const ref = allPhotos.find((p) => p.id === photo.id);
        if (ref) ref.order_index = newOrder;
    });
    renderPhotosGrid();

    const results = await Promise.all(
        inCategory.map((photo) =>
            supabaseClient.from('photos').update({ order_index: photo.order_index }).eq('id', photo.id)
        )
    );
    const failed = results.find((r) => r.error);
    if (failed) {
        console.error('Reorder save failed:', failed.error);
        alert('Could not save the new order: ' + failed.error.message);
        loadPhotos(); // resync with the DB
        return;
    }

    triggerPublish({ reason: `Reordered ${category} photos` });
}

// Edit photo - GLOBAL FUNCTION
window.editPhoto = function(photo) {
    document.getElementById('formTitle').textContent = 'Edit Photo';
    document.getElementById('photoId').value = photo.id;
    document.getElementById('photoTitle').value = photo.title;
    document.getElementById('photoDescription').value = photo.description || '';
    document.getElementById('photoAltText').value = photo.alt_text && photo.alt_text !== photo.title ? photo.alt_text : '';
    document.getElementById('photoCategory').value = photo.category;
    document.getElementById('photoOrder').value = photo.order_index;
    document.getElementById('currentImageUrl').value = photo.image_url;

    const preview = document.getElementById('previewImage');
    preview.src = photo.image_url;
    preview.classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Delete photo - GLOBAL FUNCTION
//
// No confirm() popup: the photo disappears from the grid right away, and
// a toast offers six seconds to undo before the delete actually reaches
// the database. That's the "undo", not a dialog Melissa has to reason
// about mid-click.
window.deletePhoto = function(id) {
    const photo = allPhotos.find((p) => String(p.id) === String(id));
    if (!photo) return;

    allPhotos = allPhotos.filter((p) => String(p.id) !== String(id));
    renderPhotosGrid();

    showUndoToast(
        `Deleted "${photo.title}"`,
        () => {
            // Undo -- nothing was sent to the database yet, so putting it
            // back in the in-memory list is enough.
            allPhotos.push(photo);
            renderPhotosGrid();
        },
        async () => {
            console.log('Deleting photo:', id);
            const { error } = await supabaseClient.from('photos').delete().eq('id', id);
            if (error) {
                console.error('Delete error:', error);
                alert('Error deleting photo: ' + error.message);
                loadPhotos(); // resync -- our optimistic removal may now be wrong
                return;
            }
            console.log('Photo deleted');
            triggerPublish({ reason: 'Photo delete' });
        },
        6000
    );
};

// Reset form
function resetForm() {
    document.getElementById('formTitle').textContent = 'Add New Photo';
    document.getElementById('photoForm').reset();
    document.getElementById('photoId').value = '';
    document.getElementById('currentImageUrl').value = '';
    document.getElementById('photoAltText').value = '';
    document.getElementById('previewImage').classList.add('hidden');
}

// ---------------------------------------------------------------------
// Site text (Content tab)
//
// content-manifest.json (generated by scripts/scan-content.js, served
// as a plain static file next to cpr.html) lists every editable field
// the site's pages currently have, with its default/fallback text. This
// merges that catalogue with whatever's already been saved to the
// site_content table, so every field shows up with its current value
// even before it's ever been edited from here.
// ---------------------------------------------------------------------
const PAGE_LABELS = {
    home: 'Home', about: 'About', contact: 'Contact',
    proposal: 'Proposal', wedding: 'Wedding', portrait: 'Portrait', event: 'Event', sport: 'Sport',
};
const LOCALE_LABELS = { en: 'English', fr: 'Français' };

// Which static file a page/locale combination lives in, for the "View
// live page" link on each section -- a relative link works whether this
// is opened locally or on the live domain, since cpr.html sits next to
// these files.
const PAGE_FILE_MAP = {
    home: { en: 'index.html', fr: 'indexfr.html' },
    about: { en: 'about.html', fr: 'aboutfr.html' },
    contact: { en: 'contact.html', fr: 'contactfr.html' },
    proposal: { en: 'proposal.html', fr: 'proposalfr.html' },
    wedding: { en: 'wedding.html', fr: 'weddingfr.html' },
    portrait: { en: 'portrait.html', fr: 'portraitfr.html' },
    event: { en: 'event.html', fr: 'eventfr.html' },
    sport: { en: 'sport.html', fr: 'sportfr.html' },
};

function draftKeyFor(page, locale, key) {
    return `cpr:draft:${page}:${locale}:${key}`;
}

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
            if (fields.length === 0) return; // gallery pages etc -- nothing to edit as text

            const section = document.createElement('div');
            section.className = 'content-section';
            section.dataset.page = page;
            section.dataset.locale = locale;

            const header = document.createElement('div');
            header.className = 'content-section-header';

            const title = document.createElement('h4');
            title.textContent = `${PAGE_LABELS[page] || page} · ${LOCALE_LABELS[locale] || locale}`;
            header.appendChild(title);

            const liveFile = (PAGE_FILE_MAP[page] || {})[locale];
            if (liveFile) {
                const link = document.createElement('a');
                link.className = 'view-live-link';
                link.href = liveFile;
                link.target = '_blank';
                link.rel = 'noopener';
                link.innerHTML = '<i class="fas fa-external-link-alt"></i> View live page';
                header.appendChild(link);
            }
            section.appendChild(header);

            const meta = document.createElement('div');
            meta.className = 'section-meta';
            meta.textContent = `${fields.length} editable field${fields.length === 1 ? '' : 's'}`;
            section.appendChild(meta);

            const draftBanner = document.createElement('div');
            draftBanner.className = 'draft-banner hidden';
            const draftMsg = document.createElement('span');
            draftMsg.textContent = 'Restored unsaved draft text from earlier.';
            draftBanner.appendChild(draftMsg);
            const discardBtn = document.createElement('button');
            discardBtn.type = 'button';
            discardBtn.textContent = 'Discard draft';
            draftBanner.appendChild(discardBtn);
            section.appendChild(draftBanner);

            const draftResets = [];

            fields.forEach((field) => {
                const saved = savedByKey[`${page}|${locale}|${field.key}`];
                const currentValue = saved ? saved.content : field.default;
                const contentType = saved ? saved.content_type : field.content_type;
                const manifestDefault = field.default;

                const wrap = document.createElement('div');
                wrap.className = 'content-field';
                wrap.dataset.key = field.key;
                wrap.dataset.contentType = contentType;
                wrap.dataset.originalValue = currentValue;
                wrap.dataset.manifestDefault = manifestDefault;
                wrap.dataset.draftKey = draftKeyFor(page, locale, field.key);

                const row = document.createElement('div');
                row.className = 'content-field-row';
                const label = document.createElement('label');
                label.textContent = field.label;
                row.appendChild(label);
                const revertBtn = document.createElement('button');
                revertBtn.type = 'button';
                revertBtn.className = 'revert-field-btn';
                revertBtn.textContent = 'Revert to original';
                row.appendChild(revertBtn);
                wrap.appendChild(row);

                let initialValue = currentValue;
                let draftApplied = false;
                try {
                    const rawDraft = localStorage.getItem(wrap.dataset.draftKey);
                    if (rawDraft) {
                        const draft = JSON.parse(rawDraft);
                        if (draft && typeof draft.value === 'string' && draft.value !== currentValue) {
                            initialValue = draft.value;
                            draftApplied = true;
                        }
                    }
                } catch (err) {
                    console.warn('Could not read autosave draft:', err);
                }

                const isLong = contentType === 'html' || initialValue.length > 80;
                const input = document.createElement(isLong ? 'textarea' : 'input');
                if (!isLong) input.type = 'text';
                else input.rows = Math.min(6, Math.max(2, Math.ceil(initialValue.length / 60)));
                input.className = 'form-control';
                input.value = initialValue;

                const updateDirtyAndRevert = () => {
                    wrap.classList.toggle('is-dirty', input.value !== wrap.dataset.originalValue);
                    revertBtn.disabled = input.value === wrap.dataset.manifestDefault;
                };
                updateDirtyAndRevert();

                const saveDraft = debounce(() => {
                    try {
                        if (input.value === wrap.dataset.originalValue) {
                            localStorage.removeItem(wrap.dataset.draftKey);
                        } else {
                            localStorage.setItem(
                                wrap.dataset.draftKey,
                                JSON.stringify({ value: input.value, savedAt: Date.now() })
                            );
                        }
                    } catch (err) {
                        console.warn('Autosave draft could not be written:', err);
                    }
                }, 600);

                input.addEventListener('input', () => {
                    updateDirtyAndRevert();
                    saveDraft();
                });

                revertBtn.addEventListener('click', () => {
                    input.value = wrap.dataset.manifestDefault;
                    input.dispatchEvent(new Event('input', { bubbles: false }));
                });

                wrap.appendChild(input);
                section.appendChild(wrap);

                if (draftApplied) {
                    draftResets.push(() => {
                        input.value = wrap.dataset.originalValue;
                        updateDirtyAndRevert();
                        try {
                            localStorage.removeItem(wrap.dataset.draftKey);
                        } catch (err) {
                            /* ignore */
                        }
                    });
                }
            });

            if (draftResets.length > 0) {
                draftBanner.classList.remove('hidden');
                discardBtn.addEventListener('click', () => {
                    draftResets.forEach((reset) => reset());
                    draftBanner.classList.add('hidden');
                });
            }

            const saveBtn = document.createElement('button');
            saveBtn.type = 'button';
            saveBtn.className = 'btn btn-success save-section-btn';
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save changes';
            saveBtn.addEventListener('click', () => saveContentSection(section, saveBtn));
            section.appendChild(saveBtn);

            container.appendChild(section);
        });
    });

    const searchInput = document.getElementById('contentSearchInput');
    if (searchInput && searchInput.value.trim()) {
        filterContentSections(searchInput.value.trim().toLowerCase());
    }
}

// Content tab search: matches a section's page/locale heading, or any
// field's label/value within it. Fields (and whole sections, once every
// field in them is hidden) are toggled rather than removed, so nothing
// needs re-rendering.
function filterContentSections(term) {
    const sections = document.querySelectorAll('#contentSections .content-section');
    sections.forEach((section) => {
        const header = section.querySelector('.content-section-header');
        const headingText = (header ? header.textContent : '').toLowerCase();
        const headingMatches = Boolean(term) && headingText.includes(term);

        let anyFieldVisible = false;
        section.querySelectorAll('.content-field').forEach((field) => {
            const label = (field.querySelector('label')?.textContent || '').toLowerCase();
            const valueEl = field.querySelector('textarea, input');
            const value = (valueEl ? valueEl.value : '').toLowerCase();
            const matches = !term || headingMatches || label.includes(term) || value.includes(term);
            field.classList.toggle('field-hidden', !matches);
            if (matches) anyFieldVisible = true;
        });

        section.classList.toggle('section-hidden', !anyFieldVisible);
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
        const revertBtn = wrap.querySelector('.revert-field-btn');
        if (revertBtn) revertBtn.disabled = input.value === wrap.dataset.manifestDefault;
        try {
            localStorage.removeItem(wrap.dataset.draftKey);
        } catch (err) {
            /* ignore */
        }
    });

    triggerPublish({ reason: `Site text: ${PAGE_LABELS[page] || page}/${locale}` });
}
