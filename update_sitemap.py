#!/usr/bin/env python3
import os
from datetime import datetime

# Generate sitemap.xml
sitemap_content = '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
'''

base_url = 'https://melissaphotography.paris'
current_date = datetime.now( ).strftime('%Y-%m-%d')

# Find all HTML files
html_files = []
for root, dirs, files in os.walk('.'):
    if '.git' in root or 'fonts' in root:
        continue
    for file in files:
        if file.endswith('.html') and not file.startswith('demo'):
            rel_path = os.path.relpath(os.path.join(root, file), '.')
            if rel_path.count('/') <= 1:
                html_files.append(rel_path)

# Page priorities
priorities = {
    'index.html': '1.0',
    'indexfr.html': '1.0',
    'services.html': '0.9',
    'servicesfr.html': '0.9',
    'about.html': '0.8',
    'aboutfr.html': '0.8'
}

for page in sorted(html_files):
    if page == 'index.html':
        url = f'{base_url}/'
    else:
        url = f'{base_url}/{page}'
    
    priority = priorities.get(page, '0.5')
    
    sitemap_content += f'''  <url>
    <loc>{url}</loc>
    <lastmod>{current_date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>{priority}</priority>
  </url>
'''

sitemap_content += '</urlset>'

with open('sitemap.xml', 'w', encoding='utf-8') as f:
    f.write(sitemap_content)

# Update robots.txt
robots_content = f'''User-agent: *
Allow: /

Sitemap: {base_url}/sitemap.xml

Disallow: /admin/
Disallow: /.git/
Disallow: /.vscode/
Disallow: /scss/

Allow: /css/
Allow: /js/
Allow: /images/
Allow: /fonts/
'''

with open('robots.txt', 'w') as f:
    f.write(robots_content)

print(f"Updated sitemap.xml with {len(html_files)} pages")
print("Updated robots.txt")
