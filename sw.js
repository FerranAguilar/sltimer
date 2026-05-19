// SLTimer Service Worker v1.0
const CACHE = 'sltimer-v1';

// Archivos que se guardan en caché para modo offline
const PRECACHE = [
  '/app.html',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap',
];

// Instalar: guardar en caché los archivos principales
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      // Intentar cachear cada archivo individualmente para no fallar todos si uno falla
      return Promise.allSettled(
        PRECACHE.map(url => cache.add(url).catch(() => console.warn('No cacheado:', url)))
      );
    }).then(() => self.skipWaiting())
  );
});

// Activar: limpiar cachés antiguas
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: Network first, caché como fallback
self.addEventListener('fetch', e => {
  // Solo interceptar peticiones GET
  if (e.request.method !== 'GET') return;

  // Para peticiones a Supabase (API), siempre ir a la red
  if (e.request.url.includes('supabase.co')) return;

  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Si la respuesta es válida, guardarla en caché
        if (response && response.status === 200 && response.type !== 'opaque') {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Sin red: intentar servir desde caché
        return caches.match(e.request).then(cached => {
          if (cached) return cached;
          // Si es una navegación, devolver la app principal
          if (e.request.mode === 'navigate') {
            return caches.match('/app.html');
          }
        });
      })
  );
});
