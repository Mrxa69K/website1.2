#!/usr/bin/env python3
import os
import re
from bs4 import BeautifulSoup

def simple_css_minify(css_content):
    # Remove comments
    css_content = re.sub(r'/\*.*?\*/', '', css_content, flags=re.DOTALL)
    # Remove extra whitespace
    css_content = re.sub(r'\s+', ' ', css_content)
    # Remove spaces around certain characters
    css_content = re.sub(r'\s*([{}:;,>+~])\s*', r'\1', css_content)
    return css_content.strip()

def minify_css_file(css_file):
    with open(css_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    minified = simple_css_minify(content)
    
    # Create minified version
    base_name = os.path.splitext(css_file)[0]
    min_file = f"{base_name}.min.css"
    
    with open(min_file, 'w', encoding='utf-8') as f:
        f.write(minified)
    
    return min_file

def update_html_css_refs(html_file):
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    links = soup.find_all('link', rel='stylesheet')
    changes_made = False
    
    for link in links:
        href = link.get('href', '')
        if href and not href.startswith('http' ) and href.endswith('.css') and not href.endswith('.min.css'):
            min_href = href.replace('.css', '.min.css')
            if os.path.exists(min_href.lstrip('./')):
                link['href'] = min_href
                changes_made = True
    
    if changes_made:
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(str(soup))
    
    return changes_made

# Find and minify CSS files
css_files = []
for root, dirs, files in os.walk('.'):
    if '.git' in root or 'node_modules' in root:
        continue
    for file in files:
        if file.endswith('.css') and not file.endswith('.min.css'):
            css_files.append(os.path.join(root, file))

minified_count = 0
for css_file in css_files:
    try:
        min_file = minify_css_file(css_file)
        minified_count += 1
        print(f"Minified: {css_file}")
    except Exception as e:
        print(f"Error minifying {css_file}: {e}")

# Update HTML references
html_files = []
for root, dirs, files in os.walk('.'):
    if '.git' in root:
        continue
    for file in files:
        if file.endswith('.html'):
            html_files.append(os.path.join(root, file))

updated_count = 0
for html_file in html_files:
    if update_html_css_refs(html_file):
        updated_count += 1

print(f"Minified {minified_count} CSS files, updated {updated_count} HTML files")
