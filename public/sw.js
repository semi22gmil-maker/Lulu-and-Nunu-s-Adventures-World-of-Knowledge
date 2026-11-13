const CACHE_NAME = 'lulu-nono-offline-v1';
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg',
];

async function cacheAssetUrls(urls) {
  const cache = await caches.open(CACHE_NAME);
  await Promise.all(
    urls.map(async (url) => {
      try {
        const existing = await cache.match(url, { ignoreVary: true });
        if (existing) return;
        const response = await fetch(url, { credentials: 'same-origin' });
        if (response && (response.status === 200 || response.type === 'opaque')) {
          await cache.put(url, response.clone());
        }
      } catch {
        // Ignore individual offline/network warm errors
      }
    })
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(cacheAssetUrls(APP_SHELL_URLS));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || data.type !== 'CACHE_ASSETS' || !Array.isArray(data.urls)) return;
  event.waitUntil(
    cacheAssetUrls(data.urls).then(() => {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ ok: true, count: data.urls.length });
      }
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isGoogleFont =
    url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';

  if (!isSameOrigin && !isGoogleFont) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached =
        (await cache.match(request, { ignoreVary: true })) ||
        (isSameOrigin ? await cache.match(url.pathname + url.search, { ignoreVary: true }) : undefined);

      if (cached) return cached;

      try {
        const response = await fetch(request);
        if (response && (response.status === 200 || response.type === 'opaque')) {
          await cache.put(request, response.clone());
        }
        return response;
      } catch {
        if (request.mode === 'navigate') {
          const shell =
            (await cache.match('/index.html', { ignoreVary: true })) ||
            (await cache.match('/', { ignoreVary: true }));
          if (shell) return shell;
        }
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      }
    })()
  );
});
