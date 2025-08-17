#!/usr/bin/env python3
import os
import re
from bs4 import BeautifulSoup
try:
    from PIL import Image
except ImportError:
    Image = None

def get_image_dimensions(image_path):
    if not Image:
        return None, None
    try:
        with Image.open(image_path) as img:
            return img.size
    except:
        return None, None

def optimize_html_images(html_file):
    print(f"Processing: {html_file}")
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    images = soup.find_all('img')
    changes_made = False
    
    for img in images:
        src = img.get('src', '')
        if not src or src.startswith('http' ):
            continue
        
        # Get image dimensions
        image_path = src.lstrip('./')
        if os.path.exists(image_path):
            width, height = get_image_dimensions(image_path)
            if width and height:
                if not img.get('width'):
                    img['width'] = str(width)
                    changes_made = True
                if not img.get('height'):
                    img['height'] = str(height)
                    changes_made = True
        
        # Add loading="lazy"
        if not img.get('loading') and 'hero' not in src.lower() and 'logo' not in src.lower():
            img['loading'] = 'lazy'
            changes_made = True
        
        # Add object-fit style
        current_style = img.get('style', '')
        if 'object-fit' not in current_style:
            if current_style:
                new_style = current_style + '; object-fit: cover;'
            else:
                new_style = 'object-fit: cover;'
            img['style'] = new_style
            changes_made = True
        
        # Add alt if missing
        if not img.get('alt'):
            if 'logo' in src.lower():
                img['alt'] = 'Melissa Photography Paris Logo'
            else:
                img['alt'] = 'Professional Photography by Melissa Paris'
            changes_made = True
    
    if changes_made:
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(str(soup))
        print(f"✅ Optimized: {html_file}")
        return True
    else:
        print(f"⏭️ No changes needed: {html_file}")
        return False

# Process all HTML files
html_files = []
for root, dirs, files in os.walk('.'):
    if '.git' in root or 'node_modules' in root:
        continue
    for file in files:
        if file.endswith('.html'):
            html_files.append(os.path.join(root, file))

print(f"Found {len(html_files)} HTML files")
optimized_count = 0
for html_file in html_files:
    if optimize_html_images(html_file):
        optimized_count += 1

print(f"🎉 Optimized {optimized_count} HTML files with images")
