// Ryport PWA Service Worker (Minimal installability requirements)
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Minimal no-op fetch handler to fulfill PWA installability requirements
});
