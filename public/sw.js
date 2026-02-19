const CACHE_NAME = 'tripcalc-v1';

// Assets to pre-cache on install
const PRE_CACHE_ASSETS = [
  '/',
  '/logo.png',
  '/logo-small.png',
];

// Install: pre-cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRE_CACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: delete old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: serve from cache when possible, fallback to network
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip API requests (always fetch fresh data)
  if (url.pathname.startsWith('/api/')) return;

  // Skip analytics and auth endpoints
  if (
    url.pathname.startsWith('/api/analytics') ||
    url.pathname.startsWith('/api/auth')
  ) return;

  // Strategy: Network first, fallback to cache
  // This ensures users always get fresh content when online
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses for static assets
        if (
          response.ok &&
          (
            event.request.destination === 'script' ||
            event.request.destination === 'style' ||
            event.request.destination === 'image' ||
            event.request.destination === 'font' ||
            event.request.destination === 'document'
          )
        ) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Offline: serve from cache if available
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Fallback for navigation requests
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});
