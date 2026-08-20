const CACHE = 'loki-one-app-v5';
const APP_SHELL = ['./','./index.html','./manifest.webmanifest','./jungle-fix.js','../loki-android.css?v=2','../loki-icon.svg','../loki-icon.webp'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const request = event.request;
  const url = new URL(request.url);
  const isAppDocument = url.pathname.endsWith('/app/') || url.pathname.endsWith('/app/index.html');

  if (isAppDocument) {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then(response => {
          if (!response || !response.ok) throw new Error('network response unavailable');
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(request, copy)).catch(() => {});
      return response;
    }))
  );
});
