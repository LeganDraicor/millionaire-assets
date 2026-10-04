// Draicor Bros service worker (v3): network first, falls back to the saved copy when offline.
// v3 only changes the cache name so every installed app drops the old saved pages after the new design.
const CACHE_NAME = 'draicor-bros-v3';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add('/')).catch(() => {}).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;                       // POST (login, backend) always goes straight to the network
  const sameOrigin = new URL(req.url).origin === self.location.origin;
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (sameOrigin && res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }))
  );
});
