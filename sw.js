const CACHE_NAME = "dd-gabelstapler-v4";
const ASSETS = [
  "./",
  "./index.html",
  "./impressum.html",
  "./datenschutz.html",
  "./style.css",
  "./app.js",
  "./bestand.js",
  "./stapler.html",
  "./stapler.js",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    // cache: "reload" umgeht den HTTP-Cache, sonst landen veraltete Dateien im neuen Cache.
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(ASSETS.map((url) => new Request(url, { cache: "reload" })))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

// Network first, damit Änderungen sofort sichtbar sind; Cache nur als Offline-Fallback.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== location.origin) return;
  event.respondWith(
    fetch(event.request, { cache: "no-cache" })
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
