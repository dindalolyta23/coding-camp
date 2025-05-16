import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache API responses
registerRoute(
  ({ url }) => url.pathname.startsWith('/v1/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
  })
);

// Push Notification (tetap pertahankan)
self.addEventListener("push", (event) => {
  const payload = event.data.json();
  event.waitUntil(
    self.registration.showNotification(payload.title, payload.options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("https://yourdomain.com/"));
});