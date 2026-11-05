/*
 * TKT-76: cache-first store for the Home journey's media, so a repeat visit plays from disk.
 * It only answers versioned home-media requests ("…/home-media/<file>?v=<hash>"); every other request on the site
 * goes straight to the network untouched. URLs change whenever a file's content changes, so cached copies never
 * go stale; older versions of the same file are deleted when a new one is stored.
 */
const CACHE = "home-media-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith("home-media-") && key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || req.headers.has("range")) return;
  const url = new URL(req.url);
  if (!url.pathname.includes("/home-media/") || !url.searchParams.has("v")) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req);
    if (hit) return hit;
    const res = await fetch(req);
    // Only readable responses are stored (opaque ones are padded to megabytes by browsers' quota accounting).
    if (res.ok && (res.type === "cors" || res.type === "basic")) {
      const copy = res.clone();
      event.waitUntil((async () => {
        await cache.put(req, copy);
        for (const old of await cache.keys()) {
          const o = new URL(old.url);
          if (o.pathname === url.pathname && o.search !== url.search) await cache.delete(old);
        }
      })());
    }
    return res;
  })());
});
