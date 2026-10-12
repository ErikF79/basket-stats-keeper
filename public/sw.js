/* Basket Stats Keeper - service worker (offline app shell + runtime cache) */
const VERSION = 'v1';
const CACHE = `bsk-${VERSION}`;

const PRECACHE = [
  './',
  './index.html',
  './analysis/',
  './analysis/index.html',
  './manifest.json',
  './basketball-court.svg',
  './icon-192x192.png',
  './icon-512x512.png',
  './apple-touch-icon.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then(cache => Promise.all(PRECACHE.map(url => cache.add(url).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigations: network first, fall back to cached shell (works offline).
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then(cached => cached || caches.match('./index.html'))
        )
    );
    return;
  }

  // Static assets: cache first, revalidate in background.
  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request)
        .then(response => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
