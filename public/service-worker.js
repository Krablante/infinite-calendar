const CACHE_NAME = 'cosmic-calendar-cache-v3'; // Incremented version
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  // You should add paths to your actual icon files here if different from manifest
  // e.g., '/icons/icon-192x192.png', '/icons/icon-512x512.png',
  // Google Fonts (attempt to cache, may be opaque)
  'https://fonts.googleapis.com/css2?family=Spectral:wght@400;700&family=Orbitron:wght@400;700&display=swap'
];

const FIREBASE_HOSTNAMES = [
  'firestore.googleapis.com',
  'firebaseauth.googleapis.com',
  // Add other Firebase service hostnames if you use them, e.g., for Storage or Functions
  // 'firebasestorage.googleapis.com',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Opened cache');
        const requests = urlsToCache.map(url => {
          if (url.startsWith('http')) {
            return new Request(url, { mode: 'no-cors' });
          }
          return url;
        });
        return cache.addAll(requests)
          .catch(error => {
            console.error('Service Worker: Failed to cache some critical resources during install:', error, requests.filter(r => typeof r === 'string' && r.startsWith('http')));
          });
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // **** Critical: Bypass Firebase requests ENTIRELY from SW caching logic ****
  if (FIREBASE_HOSTNAMES.includes(requestUrl.hostname)) {
    // For Firebase, always go to the network. Do not attempt to serve from cache.
    // Do not attempt to cache the response.
    event.respondWith(fetch(event.request));
    return;
  }

  // For navigation requests (HTML pages), try network first, then cache.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          console.log('Service Worker: Network failed for navigation, trying cache for', event.request.url);
          return caches.match(event.request);
        })
        .then(response => {
          if (response) return response;
          // If specific navigation request not in cache, fallback to root index.html
          console.log('Service Worker: Specific navigation not found, falling back to /index.html');
          return caches.match('/index.html');
        })
        .catch(error => {
            console.error('Service Worker: Error handling navigation for', event.request.url, error);
            // This would be a place for a truly generic offline page if /index.html also fails
        })
    );
    return;
  }

  // For other requests (assets: CSS, JS, images), try cache first, then network (CacheFirst).
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse; // Serve from cache
        }

        // Not in cache, fetch from network
        return fetch(event.request).then(networkResponse => {
          // Check if we should cache this new resource
          if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
      .catch(error => {
        console.warn('Service Worker: Failed to serve asset from cache/network:', event.request.url, error);
        // For assets, you might not want a fallback, or a specific placeholder (e.g., for images)
        // Returning a new Response for error states can prevent browser's default error page for assets.
        // For example: return new Response('', { status: 404, statusText: 'Not Found' });
      })
  );
});
