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

# Find and minify CSS files
css_files = []
for root, dirs, files in os.walk('.'):
    if '.git' in root or 'node_modules' in root:
        continue
    for file in files:
        if file.endswith('.css') and not file.endswith('.min.css'):
            css_files.append(os.path.join(root, file))

print(f"Found {len(css_files)} CSS files to minify")
minified_count = 0
for css_file in css_files:
    try:
        min_file = minify_css_file(css_file)
        minified_count += 1
        print(f"✅ Minified: {css_file}")
    except Exception as e:
        print(f"❌ Error minifying {css_file}: {e}")

print(f"🎉 Minified {minified_count} CSS files")
