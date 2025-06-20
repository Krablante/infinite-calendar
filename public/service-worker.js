
const CACHE_NAME = 'cosmic-calendar-cache-v4'; // Incremented version
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  // Add paths to your icon files if they are not in the root or are different
  // e.g., '/icons/icon-192x192.png', '/icons/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Spectral:wght@400;700&family=Orbitron:wght@400;700&display=swap'
];

const FIREBASE_HOSTNAMES = [
  'firestore.googleapis.com',
  'firebaseauth.googleapis.com',
  // 'firebasestorage.googleapis.com', // Uncomment if you use Firebase Storage
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Opened cache ' + CACHE_NAME);
        const requests = urlsToCache.map(url => {
          if (url.startsWith('http')) {
            // For external resources like Google Fonts, use 'no-cors' to allow caching
            // of opaque responses. This means you can't inspect the response, but it can be served.
            return new Request(url, { mode: 'no-cors' });
          }
          return url;
        });
        return cache.addAll(requests)
          .catch(error => {
            console.error('Service Worker: Failed to cache some resources during install:', error);
            // Log which specific requests failed if possible
            requests.forEach(req => {
              const urlToLog = typeof req === 'string' ? req : req.url;
              cache.match(urlToLog).then(res => {
                if (!res) console.error('Failed to cache:', urlToLog);
              });
            });
          });
      })
  );
  self.skipWaiting(); // Force the new service worker to activate immediately
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
    }).then(() => {
      console.log('Service Worker: Activated and old caches cleaned.');
      return self.clients.claim(); // Ensure new SW takes control of all clients immediately
    })
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // **** Critical: Bypass Firebase requests ENTIRELY from SW caching logic ****
  if (FIREBASE_HOSTNAMES.includes(requestUrl.hostname)) {
    // For Firebase, let the browser handle the request directly.
    // DO NOT call event.respondWith() here.
    return;
  }

  // For navigation requests (HTML pages), try network first, then cache.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // It's a good practice to cache successful navigation responses
          // if they are part of your app shell or frequently accessed pages.
          // However, for single-page apps, caching index.html during install is usually enough.
          return networkResponse;
        })
        .catch(() => {
          console.log('Service Worker: Network failed for navigation, trying cache for', event.request.url);
          return caches.match(event.request) // Try to match the specific navigation request
            .then(cachedResponse => {
              if (cachedResponse) return cachedResponse;
              // If specific navigation request not in cache, fallback to root index.html
              console.log('Service Worker: Specific navigation not found in cache, falling back to /index.html');
              return caches.match('/index.html');
            });
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
            // Ensure you don't cache opaque responses here unless intended (e.g., for CDNs where you control the content)
            // For most assets, this is fine.
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
        // Optionally, return a fallback response for certain asset types (e.g., placeholder image)
        // return new Response('', { status: 404, statusText: 'Not Found' });
      })
  );
});
