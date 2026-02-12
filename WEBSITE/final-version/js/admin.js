// Initialize Supabase
let supabaseClient;


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
    
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
        console.log('User logged in:', session.user.email);
        showAdminPanel();
        loadPhotos();
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

// Photo Form Submit - FIXED VERSION
if (document.getElementById('photoForm')) {
    document.getElementById('photoForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        console.log('📸 Form submitted!');
        
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        
        const photoId = document.getElementById('photoId').value;
        const photoFile = document.getElementById('photoFile').files[0];
        const currentImageUrl = document.getElementById('currentImageUrl').value;
        
        let imageUrl = currentImageUrl;
        
        // Upload image if new file selected
        if (photoFile) {
            console.log('📤 Uploading file:', photoFile.name);
            
            const fileExt = photoFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            
            const { data: uploadData, error: uploadError } = await supabaseClient.storage
                .from('photos')
                .upload(fileName, photoFile);
            
            if (uploadError) {
                console.error('❌ Upload error:', uploadError);
                alert('Error uploading image: ' + uploadError.message);
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Photo';
                return;
            }
            
            console.log('✅ File uploaded:', uploadData);
            
            const { data: { publicUrl } } = supabaseClient.storage
                .from('photos')
                .getPublicUrl(fileName);
            
            imageUrl = publicUrl;
            console.log('🔗 Public URL:', publicUrl);
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
        
        console.log('💾 Saving to database:', photoData);
        
        if (photoId) {
            // Update existing photo
            const { data, error } = await supabaseClient
                .from('photos')
                .update(photoData)
                .eq('id', photoId)
                .select();
            
            if (error) {
                console.error('❌ Update error:', error);
                alert('Error updating photo: ' + error.message);
            } else {
                console.log('✅ Photo updated:', data);
                alert('Photo updated successfully!');
                resetForm();
                loadPhotos();
            }
        } else {
            // Insert new photo
            const { data, error } = await supabaseClient
                .from('photos')
                .insert([photoData])
                .select();
            
            if (error) {
                console.error('❌ Insert error:', error);
                alert('Error adding photo: ' + error.message);
            } else {
                console.log('✅ Photo added:', data);
                alert('Photo added successfully!');
                resetForm();
                loadPhotos();
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
            console.log('📁 File selected:', file.name);
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


// Delete photo
window.deletePhoto = async function(id) {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    
    console.log('🗑️ Deleting photo:', id);
    
    const { error } = await supabaseClient
        .from('photos')
        .delete()
        .eq('id', id);
    
    if (error) {
        console.error('Delete error:', error);
        alert('Error deleting photo: ' + error.message);
    } else {
        console.log('✅ Photo deleted');
        alert('Photo deleted successfully!');
        loadPhotos();
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
