/**
 * MELISSA PHOTOGRAPHY PARIS - SERVICE WORKER
 * Cache intelligent et sécurisé pour performance optimale
 */

const CACHE_NAME = 'melissa-photography-v1.0';
const STATIC_CACHE = 'melissa-static-v1.0';
const DYNAMIC_CACHE = 'melissa-dynamic-v1.0';

// Ressources critiques à mettre en cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/contact.html',
  '/services.html',
  '/css/style.css',
  '/css/bootstrap.min.css',
  '/js/main.js',
  '/js/security.js',
  '/js/animations.js',
  '/js/performance.js',
  '/js/jquery-3.3.1.min.js',
  '/js/bootstrap.min.js',
  '/fonts/icomoon/style.css'
];

// Ressources dynamiques (images, etc.)
const DYNAMIC_ASSETS = [
  '/images/',
  '/proposal.html',
  '/wedding.html',
  '/portrait.html',
  '/event.html',
  '/sport.html'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('SW: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('SW: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('SW: Installation failed', error);
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('SW: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('SW: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('SW: Activation complete');
        return self.clients.claim();
      })
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-HTTP
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Stratégie de cache selon le type de ressource
  if (isStaticAsset(request.url)) {
    event.respondWith(cacheFirst(request));
  } else if (isImageRequest(request.url)) {
    event.respondWith(cacheFirstWithFallback(request));
  } else if (isHTMLRequest(request.url)) {
    event.respondWith(networkFirstWithCache(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});

// Vérifier si c'est un asset statique
function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => url.includes(asset)) ||
         url.includes('.css') ||
         url.includes('.js') ||
         url.includes('.woff') ||
         url.includes('.woff2');
}

// Vérifier si c'est une image
function isImageRequest(url) {
  return url.includes('/images/') ||
         url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
}

// Vérifier si c'est du HTML
function isHTMLRequest(url) {
  return url.includes('.html') || 
         url.endsWith('/') ||
         !url.includes('.');
}

// Stratégie Cache First (pour assets statiques)
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('SW: Cache first failed', error);
    return new Response('Ressource non disponible', { status: 503 });
  }
}

// Stratégie Cache First avec fallback (pour images)
async function cacheFirstWithFallback(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    // Fallback pour images manquantes
    return generateImageFallback();
  } catch (error) {
    console.error('SW: Image cache failed', error);
    return generateImageFallback();
  }
}

// Stratégie Network First avec cache (pour HTML)
async function networkFirstWithCache(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    // Fallback vers le cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Page non disponible', { status: 503 });
  } catch (error) {
    // Réseau indisponible, utiliser le cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return generateOfflinePage();
  }
}

// Stratégie Network First (pour autres ressources)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Ressource non disponible', { status: 503 });
  }
}

// Générer une image de fallback
function generateImageFallback() {
  const svg = `
    <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f8f9fa"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6c757d" font-family="Arial, sans-serif">
        Melissa Photography Paris
      </text>
      <text x="50%" y="65%" text-anchor="middle" dy=".3em" fill="#adb5bd" font-family="Arial, sans-serif" font-size="12">
        Image temporairement indisponible
      </text>
    </svg>
  `;
  
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-cache'
    }
  });
}

// Générer une page offline
function generateOfflinePage() {
  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Melissa Photography Paris - Hors ligne</title>
      <style>
        body {
          font-family: 'Playfair Display', serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          margin: 0;
          padding: 0;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .offline-container {
          text-align: center;
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          max-width: 500px;
        }
        h1 {
          color: #2c2c2c;
          margin-bottom: 20px;
        }
        p {
          color: #666;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .btn {
          background: #2c2c2c;
          color: white;
          padding: 12px 30px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
        }
        .btn:hover {
          background: #444;
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <h1>Melissa Photography Paris</h1>
        <p>Vous êtes actuellement hors ligne. Certaines fonctionnalités peuvent ne pas être disponibles.</p>
        <p>Veuillez vérifier votre connexion internet et réessayer.</p>
        <button class="btn" onclick="window.location.reload()">Réessayer</button>
      </div>
    </body>
    </html>
  `;
  
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache'
    }
  });
}

// Gestion des messages du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    getCacheSize().then(size => {
      event.ports[0].postMessage({ cacheSize: size });
    });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    clearCache().then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

// Obtenir la taille du cache
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }
  
  return totalSize;
}

// Nettoyer le cache
async function clearCache() {
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
}

// Nettoyage automatique du cache (limiter à 50MB)
async function cleanupCache() {
  const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
  const currentSize = await getCacheSize();
  
  if (currentSize > MAX_CACHE_SIZE) {
    console.log('SW: Cache size exceeded, cleaning up...');
    
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    
    // Supprimer les plus anciens (FIFO)
    const toDelete = Math.ceil(requests.length * 0.3); // Supprimer 30%
    for (let i = 0; i < toDelete; i++) {
      await cache.delete(requests[i]);
    }
  }
}

// Nettoyage périodique
setInterval(cleanupCache, 60000); // Toutes les minutes

console.log('SW: Melissa Photography Service Worker loaded');

