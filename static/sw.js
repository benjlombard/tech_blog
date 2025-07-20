/**
 * KYROSTECH - Service Worker
 * PWA et cache intelligent pour de meilleures performances
 */

const CACHE_NAME = 'kyrostech-v1.0.0';
const RUNTIME_CACHE = 'kyrostech-runtime';
const IMAGES_CACHE = 'kyrostech-images';
const FONTS_CACHE = 'kyrostech-fonts';

// Ressources à mettre en cache immédiatement
const PRECACHE_URLS = [
  '/',
  '/css/style.css',
  '/js/main.js',
  '/js/lunr.min.js',
  '/manifest.json',
  '/offline/',
  '/images/logo.png',
  '/images/og-default.jpg'
];

// Patterns d'URLs pour le cache runtime
const CACHE_PATTERNS = {
  pages: /^https:\/\/kyrostech\.dev\/(posts|categories|tags|about)/,
  images: /\.(png|jpg|jpeg|webp|svg|ico)$/,
  fonts: /\.(woff|woff2|ttf|eot)$/,
  api: /\/api\//,
  external: /^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net)/
};

// Stratégies de cache
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Configuration des durées de vie du cache
const CACHE_CONFIG = {
  pages: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 }, // 7 jours
  images: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30 jours
  fonts: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 }, // 1 an
  runtime: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 3 } // 3 jours
};

/**
 * Installation du Service Worker
 */
self.addEventListener('install', event => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Précaching des ressources essentielles');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('✅ Précache terminé');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Erreur lors du précache:', error);
      })
  );
});

/**
 * Activation du Service Worker
 */
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      cleanupOldCaches(),
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker activé et prêt');
    })
  );
});

/**
 * Nettoyage des anciens caches
 */
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name => 
    name.startsWith('kyrostech-') && name !== CACHE_NAME &&
    name !== RUNTIME_CACHE && name !== IMAGES_CACHE && name !== FONTS_CACHE
  );
  
  if (oldCaches.length > 0) {
    console.log('🧹 Nettoyage des anciens caches:', oldCaches);
    await Promise.all(oldCaches.map(name => caches.delete(name)));
  }
}

/**
 * Interception des requêtes
 */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Ignorer les requêtes Chrome Extensions
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Router les requêtes selon le type
  if (CACHE_PATTERNS.images.test(url.pathname)) {
    event.respondWith(handleImageRequest(request));
  } else if (CACHE_PATTERNS.fonts.test(url.pathname) || CACHE_PATTERNS.external.test(url.origin)) {
    event.respondWith(handleStaticRequest(request));
  } else if (CACHE_PATTERNS.pages.test(url.href) || url.origin === location.origin) {
    event.respondWith(handlePageRequest(request));
  } else {
    event.respondWith(handleGenericRequest(request));
  }
});

/**
 * Gestion des requêtes d'images - Cache First
 */
async function handleImageRequest(request) {
  try {
    const cachedResponse = await caches.match(request, { cacheName: IMAGES_CACHE });
    
    if (cachedResponse) {
      // Vérifier si l'image est expirée
      const cachedDate = new Date(cachedResponse.headers.get('date'));
      const now = new Date();
      const ageInSeconds = (now - cachedDate) / 1000;
      
      if (ageInSeconds < CACHE_CONFIG.images.maxAgeSeconds) {
        return cachedResponse;
      }
    }
    
    // Récupérer depuis le réseau
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(IMAGES_CACHE);
      await cache.put(request, networkResponse.clone());
      await cleanupCache(IMAGES_CACHE, CACHE_CONFIG.images);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Erreur lors du chargement d\'image:', error);
    
    // Retourner l'image en cache si disponible
    const cachedResponse = await caches.match(request, { cacheName: IMAGES_CACHE });
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Image de fallback
    return caches.match('/images/placeholder.jpg') || new Response('Image non disponible', {
      status: 404,
      statusText: 'Image not found'
    });
  }
}

/**
 * Gestion des requêtes statiques (fonts, CSS, JS) - Cache First
 */
async function handleStaticRequest(request) {
  try {
    const cachedResponse = await caches.match(request, { cacheName: FONTS_CACHE });
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(FONTS_CACHE);
      await cache.put(request, networkResponse.clone());
      await cleanupCache(FONTS_CACHE, CACHE_CONFIG.fonts);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Erreur lors du chargement de ressource statique:', error);
    return caches.match(request, { cacheName: FONTS_CACHE });
  }
}

/**
 * Gestion des requêtes de pages - Network First avec fallback
 */
async function handlePageRequest(request) {
  try {
    // Essayer le réseau en premier
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), 3000)
      )
    ]);
    
    if (networkResponse.ok) {
      // Mettre en cache la réponse
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put(request, networkResponse.clone());
      await cleanupCache(RUNTIME_CACHE, CACHE_CONFIG.runtime);
      
      return networkResponse;
    }
    
    throw new Error(`Network response not ok: ${networkResponse.status}`);
  } catch (error) {
    console.log('Network failed, trying cache:', error.message);
    
    // Fallback vers le cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Page offline de fallback
    if (request.mode === 'navigate') {
      return caches.match('/offline/') || createOfflinePage();
    }
    
    throw error;
  }
}

/**
 * Gestion des requêtes génériques - Stale While Revalidate
 */
async function handleGenericRequest(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Réponse immédiate depuis le cache
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

/**
 * Nettoyage du cache selon les limites configurées
 */
async function cleanupCache(cacheName, config) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > config.maxEntries) {
    const keysToDelete = keys.slice(0, keys.length - config.maxEntries);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

/**
 * Création d'une page offline
 */
function createOfflinePage() {
  const offlineHTML = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hors ligne - Kyrostech</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          background: #0f172a;
          color: #f8fafc;
          margin: 0;
          padding: 2rem;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .offline-container {
          max-width: 500px;
        }
        .offline-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        .offline-title {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: #6366f1;
        }
        .offline-message {
          font-size: 1.125rem;
          line-height: 1.6;
          color: #cbd5e1;
          margin-bottom: 2rem;
        }
        .offline-button {
          background: #6366f1;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .offline-button:hover {
          background: #5855eb;
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="offline-icon">📡</div>
        <h1 class="offline-title">Vous êtes hors ligne</h1>
        <p class="offline-message">
          Il semble que votre connexion Internet soit interrompue. 
          Vérifiez votre connexion et réessayez.
        </p>
        <button class="offline-button" onclick="window.location.reload()">
          Réessayer
        </button>
      </div>
    </body>
    </html>
  `;
  
  return new Response(offlineHTML, {
    headers: { 'Content-Type': 'text/html' }
  });
}

/**
 * Gestion des messages du client
 */
self.addEventListener('message', event => {
  const { data } = event;
  
  switch (data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_SIZE':
      getCacheSize().then(size => {
        event.ports[0].postMessage({ size });
      });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    case 'PREFETCH_URL':
      prefetchUrl(data.url);
      break;
  }
});

/**
 * Obtenir la taille du cache
 */
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    for (const key of keys) {
      const response = await cache.match(key);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }
  
  return totalSize;
}

/**
 * Vider tous les caches
 */
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
}

/**
 * Précharger une URL
 */
async function prefetchUrl(url) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put(url, response);
    }
  } catch (error) {
    console.error('Erreur lors du préchargement:', error);
  }
}

/**
 * Notification de mise à jour disponible
 */
self.addEventListener('controllerchange', () => {
  // Notifier le client qu'une nouvelle version est disponible
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'UPDATE_AVAILABLE',
        message: 'Une nouvelle version du site est disponible.'
      });
    });
  });
});

/**
 * Gestion des erreurs globales
 */
self.addEventListener('error', event => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection in SW:', event.reason);
  event.preventDefault();
});

// Analytics pour Service Worker (optionnel)
function trackServiceWorkerEvent(eventName, data = {}) {
  // Envoyer des données d'usage à votre service d'analytics
  // if (self.gtag) {
  //   self.gtag('event', eventName, {
  //     event_category: 'Service Worker',
  //     ...data
  //   });
  // }
}

console.log('🎉 Service Worker Kyrostech chargé et prêt !');