const CACHE_NAME = 'ticketmaster-v6';
const STATIC_ASSETS = ['/'];

// Install: cache shell immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
});

// Activate: clean up all old cache versions and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch handler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, cross-origin, API, or WebSocket requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/socket.io/')) return;

  const isNavigation = request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html');

  if (isNavigation) {
    // Network-first for navigation, fallback to cached index shell
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/', copy)).catch(() => {});
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match('/');
          if (cached) return cached;
          // If no cache, return a friendly offline HTML message instead of crashing
          return new Response(
            '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ticketmaster</title><style>body{font-family:sans-serif;text-align:center;padding:40px 20px;background:#f5f5f5;color:#333}h2{color:#026cdf}button{background:#026cdf;color:#fff;border:none;padding:12px 24px;border-radius:20px;font-size:16px;cursor:pointer;margin-top:20px}</style></head><body><h2>Ticketmaster</h2><p>Unable to connect. Please check your internet connection and try again.</p><button onclick="location.reload()">Retry</button></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // Cache-first for static assets (images, css, js)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return response;
        })
        .catch(() => {
          // Fallback to empty response rather than throwing fatal Response.error()
          return new Response('', { status: 408, statusText: 'Network Timeout' });
        });
    })
  );
});

