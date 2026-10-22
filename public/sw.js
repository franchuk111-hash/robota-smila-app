// Cache only public static files. Auth, redirects, HTML and RSC always use the network.
const CACHE = "robota-smila-v3";
const PUBLIC_FILES = new Set([
  "/manifest.webmanifest", "/favicon.ico", "/icon.svg", "/apple-icon.png",
  "/icon-192x192.png", "/icon-512x512.png", "/icon-maskable-512.png",
]);

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key.startsWith("robota-smila-") && key !== CACHE)
        .map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || request.mode === "navigate") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.search || request.headers.has("RSC")) return;
  if (!url.pathname.startsWith("/_next/static/") && !PUBLIC_FILES.has(url.pathname)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    const policy = response.headers.get("Cache-Control") || "";
    const type = response.headers.get("Content-Type") || "";
    if (response.ok && !response.redirected && !/\b(no-store|private|no-cache)\b/i.test(policy) &&
        !/text\/(html|x-component)/i.test(type)) {
      const copy = response.clone();
      event.waitUntil(cache.put(request, copy).catch(() => {}));
    }
    return response;
  })());
});
