const CACHE_NAME = 'cosmic-calendar-cache-v2'; // Incremented version
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  // You should add paths to your actual icon files here if different
  // '/icons/icon-192x192.png', 
  // '/icons/icon-512x512.png',
  // Attempt to cache Google Fonts (might be opaque responses)
  'https://fonts.googleapis.com/css2?family=Spectral:wght@400;700&family=Orbitron:wght@400;700&display=swap'
  // Main JS/CSS are loaded via ESM and Tailwind CDN, caching them directly is complex here.
  // For robust offline, consider bundling and versioning these assets.
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Opened cache');
        // Use addAll with a filter for potentially problematic CDN URLs or handle opaque responses
        const requests = urlsToCache.map(url => {
          if (url.startsWith('http')) { // External URLs
            return new Request(url, { mode: 'no-cors' }); // Request as no-cors
          }
          return url;
        });
        return cache.addAll(requests)
          .catch(error => {
            console.error('Service Worker: Failed to cache some resources during install:', error);
            // Even if some non-critical resources fail (like fonts due to opaque responses),
            // the SW should still install.
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
  // For navigation requests, try network first, then cache (NetworkFallingBackToCache)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
        .then(response => response || caches.match('/index.html')) // Fallback to index.html if network & specific cache fail
    );
    return;
  }

  // For other requests (assets), try cache first, then network (CacheFirst)
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(networkResponse => {
          // Optionally cache new resources on the fly
          // Be careful with caching opaque responses from CDNs
          if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET' && !event.request.url.includes('firestore.googleapis.com') && !event.request.url.includes('firebaseauth.googleapis.com')) {
             if (event.request.url.startsWith('http') && !event.request.url.startsWith(self.location.origin)) {
                // For cross-origin requests, only cache if they are not opaque or you handle them specifically
                if (networkResponse.type !== 'opaque') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
                }
             } else { // Same-origin requests
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
             }
          }
          return networkResponse;
        }).catch(error => {
            console.error("Service Worker: Fetch failed; returning offline page or error.", error);
            // Optionally return a generic offline page or error response
            if(event.request.destination === 'document'){
                 return caches.match('/index.html'); // Fallback for HTML pages
            }
        });
      })
  );
});
