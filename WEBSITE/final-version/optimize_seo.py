#!/usr/bin/env python3
import os
from bs4 import BeautifulSoup

def optimize_seo(html_file):
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    changes_made = False
    
    # Add lang attribute to html tag
    html_tag = soup.find('html')
    if html_tag and not html_tag.get('lang'):
        if 'fr' in os.path.basename(html_file):
            html_tag['lang'] = 'fr'
        else:
            html_tag['lang'] = 'en'
        changes_made = True
    
    # Add meta viewport if missing
    if not soup.find('meta', attrs={'name': 'viewport'}):
        if soup.head:
            meta_viewport = soup.new_tag('meta')
            meta_viewport.attrs['name'] = 'viewport'
            meta_viewport.attrs['content'] = 'width=device-width, initial-scale=1.0'
            soup.head.append(meta_viewport)
            changes_made = True
    
    # Add meta description if missing
    if not soup.find('meta', attrs={'name': 'description'}):
        if soup.head:
            meta_desc = soup.new_tag('meta')
            meta_desc.attrs['name'] = 'description'
            meta_desc.attrs['content'] = 'Professional photographer in Paris - Melissa Photography. Specializing in proposals, couples, weddings and portraits.'
            soup.head.append(meta_desc)
            changes_made = True
    
    if changes_made:
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(str(soup))
        print(f"✅ SEO optimized: {html_file}")
        return True
    return False

# Process all HTML files
html_files = []
for root, dirs, files in os.walk('.'):
    if '.git' in root:
        continue
    for file in files:
        if file.endswith('.html'):
            html_files.append(os.path.join(root, file))

optimized_count = 0
for html_file in html_files:
    if optimize_seo(html_file):
        optimized_count += 1

print(f"🎉 SEO optimized {optimized_count} HTML files")
