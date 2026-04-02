const CACHE_NAME = 'draicor-bros-v2'; // Subimos la versión a v2
const ASSETS_TO_CACHE = [
  '/'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith('http')) return;
  // Ignorar peticiones que no sean GET (como tus envíos a la base de datos)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si hay internet, clona la respuesta y guárdala en caché actualizada
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Si el internet falla o es el móvil pidiendo ?m=1, usa el caché e ignora el parámetro
        return caches.match(event.request, { ignoreSearch: true });
      })
  );
});
