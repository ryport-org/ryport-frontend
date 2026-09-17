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

// Web Push Notification Listeners
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || "Ryport Notification";
    const options = {
      body: data.body || data.message || "You have a new update from Ryport.",
      icon: "/icon-192.png",
      badge: "/favicon-32x32.png",
      data: data.data || { url: "/app/notifications" },
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch {
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification("Ryport", {
        body: text,
        icon: "/icon-192.png",
        badge: "/favicon-32x32.png",
        data: { url: "/app/notifications" },
      }),
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/app";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    }),
  );
});
