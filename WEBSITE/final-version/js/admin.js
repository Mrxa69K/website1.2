// Initialize Supabase client using config
const supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Check authentication on page load
window.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        showAdminPanel();
        loadPhotos();
    } else {
        showLogin();
    }
});

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    
    if (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('hidden');
    } else {
        showAdminPanel();
        loadPhotos();
    }
});

// Logout
async function logout() {
    await supabase.auth.signOut();
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

// Photo Form Submit
document.getElementById('photoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    
    const photoId = document.getElementById('photoId').value;
    const photoFile = document.getElementById('photoFile').files[0];
    const currentImageUrl = document.getElementById('currentImageUrl').value;
    
    let imageUrl = currentImageUrl;
    
    // Upload image if new file selected
    if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('photos')
            .upload(fileName, photoFile);
        
        if (uploadError) {
            alert('Error uploading image: ' + uploadError.message);
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Photo';
            return;
        }
        
        const { data: { publicUrl } } = supabase.storage
            .from('photos')
            .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
    }
    
    const photoData = {
        title: document.getElementById('photoTitle').value,
        description: document.getElementById('photoDescription').value,
        category: document.getElementById('photoCategory').value,
        order_index: parseInt(document.getElementById('photoOrder').value),
        image_url: imageUrl,
        updated_at: new Date().toISOString()
    };
    
    if (photoId) {
        // Update existing photo
        const { error } = await supabase
            .from('photos')
            .update(photoData)
            .eq('id', photoId);
        
        if (error) {
            alert('Error updating photo: ' + error.message);
        } else {
            alert('Photo updated successfully!');
            resetForm();
            loadPhotos();
        }
    } else {
        // Insert new photo
        const { error } = await supabase
            .from('photos')
            .insert([photoData]);
        
        if (error) {
            alert('Error adding photo: ' + error.message);
        } else {
            alert('Photo added successfully!');
            resetForm();
            loadPhotos();
        }
    }
    
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Photo';
});

// Image preview
document.getElementById('photoFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('previewImage');
            preview.src = e.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
});

// Load photos from database
async function loadPhotos() {
    const { data: photos, error } = await supabase
        .from('photos')
        .select('*')
        .order('order_index', { ascending: true });
    
    if (error) {
        console.error('Error loading photos:', error);
        return;
    }
    
    const grid = document.getElementById('photosGrid');
    grid.innerHTML = '';
    
    photos.forEach(photo => {
        const card = document.createElement('div');
        card.className = 'col-md-4';
        card.innerHTML = `
            <div class="photo-card">
                <img src="${photo.image_url}" alt="${photo.title}">
                <h5 class="mt-2">${photo.title}</h5>
                <p class="text-muted">${photo.description || ''}</p>
                <span class="badge bg-primary">${photo.category}</span>
                <span class="badge bg-secondary">Order: ${photo.order_index}</span>
                <div class="mt-3">
                    <button class="btn btn-sm btn-warning" onclick='editPhoto(${JSON.stringify(photo)})'>
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deletePhoto('${photo.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Edit photo
function editPhoto(photo) {
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
}

// Delete photo
async function deletePhoto(id) {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    
    const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', id);
    
    if (error) {
        alert('Error deleting photo: ' + error.message);
    } else {
        alert('Photo deleted successfully!');
        loadPhotos();
    }
}

// Reset form
function resetForm() {
    document.getElementById('formTitle').textContent = 'Add New Photo';
    document.getElementById('photoForm').reset();
    document.getElementById('photoId').value = '';
    document.getElementById('currentImageUrl').value = '';
    document.getElementById('previewImage').classList.add('hidden');
}
