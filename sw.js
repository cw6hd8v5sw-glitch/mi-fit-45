
/* MI FIT 45 - SERVICE WORKER V3.1 */

const CACHE_NAME = "mi-fit-45-v3.1";

const BASE = self.registration.scope;

const APP_FILES = [
  new URL("./", BASE).href,
  new URL("index.html", BASE).href,
  new URL("manifest.json", BASE).href,
  new URL("icon.svg", BASE).href
];

/* INSTALACION */

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

/* ACTIVACION */

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key =>
            key.startsWith("mi-fit-45-") &&
            key !== CACHE_NAME
          )
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

/* FUNCIONAMIENTO ONLINE Y OFFLINE */

self.addEventListener("fetch", event => {

  const request = event.request;

  if (request.method !== "GET") return;

  if (!request.url.startsWith(BASE)) return;

  event.respondWith(
    (async () => {

      const cache = await caches.open(CACHE_NAME);

      try {

        const response = await fetch(request);

        if (response.ok) {
          await cache.put(request, response.clone());
        }

        return response;

      } catch (error) {

        const saved = await cache.match(request);

        if (saved) return saved;

        if (request.mode === "navigate") {

          const home = await cache.match(
            new URL("index.html", BASE).href
          );

          if (home) return home;

        }

        return new Response(
          "Contenido no disponible sin internet.",
          {
            status: 503,
            headers: {
              "Content-Type": "text/plain; charset=utf-8"
            }
          }
        );

      }

    })()
  );

});
