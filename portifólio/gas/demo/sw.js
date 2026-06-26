const CACHE = 'vitao-gas-v1';
const url = self.location;

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  if (req.url.startsWith('https://cdn.tailwindcss.com') ||
      req.url.startsWith('https://fonts.googleapis.com')) {
    e.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        return caches.open(CACHE).then((cache) => {
          cache.put(req, res.clone());
          return res;
        });
      }))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req).then((res) => {
        if (res.ok) {
          caches.open(CACHE).then((cache) => cache.put(req, res.clone()));
        }
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
