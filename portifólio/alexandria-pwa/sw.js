const CACHE_NAME = 'alexandria-cache-v2';
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'cursos.html',
  'contato.html',
  'login.html',
  'registro.html',
  'curso-detalhe.html',
  'meus-cursos.html',
  'aula.html',
  'checkout.html',
  'styles.css',
  'styles.css?v=2',
  'app.js',
  'app.js?v=2',
  'data.js',
  'data.js?v=2',
  'auth.js',
  'auth.js?v=2',
  'courses.js',
  'courses.js?v=2',
  'manifest.json',
  'icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Navigation fallback to index.html for root or unknown paths
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('index.html');
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then(fetchRes => {
        // Optionally cache new successful requests
        return fetchRes;
      });
    }).catch(() => {
      // Offline fallback for assets if needed
    })
  );
});
