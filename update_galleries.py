#!/usr/bin/env python3

import os
import re

def update_gallery_page(file_path, gallery_type):
    """Update a gallery page with improvements"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add CSS import
    css_pattern = r'(<link href="css/style\.css" rel="stylesheet"/>[\s\S]*?<link href="css/animations\.css" rel="stylesheet"/>)'
    css_replacement = r'\1\n<link href="css/gallery-improvements.css" rel="stylesheet"/>'
    content = re.sub(css_pattern, css_replacement, content)
    
    # Add booking buttons to gallery header
    header_pattern = r'(<h2 class="site-section-heading text-center">.*?Gallery</h2>[\s\S]*?</div>[\s\S]*?</div>[\s\S]*?</div>)'
    
    header_replacement = f'''<div class="col-md-7">
<div class="row mb-5">
<div class="col-12">
<h2 class="site-section-heading text-center">{gallery_type} Gallery</h2>
<div class="text-center mt-4 mb-4">
<a class="book-now-btn" href="contact.html">📸 Book Your {gallery_type} Session</a>
<a class="google-maps-btn ml-3" href="https://maps.app.goo.gl/HM7SeUP5U4Sm1DDj7" target="_blank">
<i class="fab fa-google"></i> View Our Google Reviews
</a>
</div>
</div>
</div>
</div>'''
    
    content = re.sub(r'<div class="col-md-7">[\s\S]*?</div>[\s\S]*?</div>[\s\S]*?</div>', header_replacement, content, count=1)
    
    # Fix gallery images - remove inline styles
    img_pattern = r'(<img[^>]+)style="[^"]*"([^>]*>)'
    content = re.sub(img_pattern, r'\1\2', content)
    
    # Add lightgallery ID to gallery container
    gallery_row_pattern = r'<div class="row"([^>]*?)>'
    gallery_row_replacement = r'<div class="row gallery-grid" id="lightgallery"\1>'
    content = re.sub(gallery_row_pattern, gallery_row_replacement, content, count=1)
    
    # Add JS script
    js_pattern = r'(<script src="js/performance\.js"></script>)'
    js_replacement = r'\1\n<script src="js/gallery-enhancements.js"></script>'
    content = re.sub(js_pattern, js_replacement, content)
    
    # Add floating button before closing body tag
    floating_btn = '''
<!-- Floating Book Now Button -->
<a href="contact.html" class="floating-book-btn">
📸 Book Now
</a>
</body>'''
    
    content = re.sub(r'</body>', floating_btn, content)
    
    # Improve alt text for images
    alt_replacements = {
        'portrait': 'Professional Portrait Photography Paris',
        'wedding': 'Wedding Photography Paris',
        'event': 'Event Photography Paris', 
        'sport': 'Sports Photography Paris'
    }
    
    if gallery_type.lower() in alt_replacements:
        content = re.sub(r'alt="Image"', f'alt="{alt_replacements[gallery_type.lower()]}"', content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Updated {file_path}")

def main():
    """Update all gallery pages"""
    
    base_dir = "/app/WEBSITE/final-version"
    
    gallery_pages = [
        ("portrait.html", "Portrait"),
        ("wedding.html", "Wedding"), 
        ("event.html", "Event"),
        ("sport.html", "Sports")
    ]
    
    for filename, gallery_type in gallery_pages:
        file_path = os.path.join(base_dir, filename)
        if os.path.exists(file_path):
            update_gallery_page(file_path, gallery_type)
        else:
            print(f"File not found: {file_path}")

if __name__ == "__main__":
    main()