importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// Skip waiting so updates apply immediately on refresh
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Cache FFmpeg core files permanently (Network-First with long timeout for initial load)
workbox.routing.registerRoute(
  ({ url }) => url.pathname.startsWith('/ffmpeg') || url.pathname.includes('ffmpeg-core'),
  new workbox.strategies.NetworkFirst({
    cacheName: 'ffmpeg-core',
    networkTimeoutSeconds: 60, // Increased timeout for large WASM files
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
      })
    ]
  })
);

// Cache JS/wasm workers with Network-First strategy
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'worker',
  new workbox.strategies.NetworkFirst({
    cacheName: 'js-cache',
    networkTimeoutSeconds: 30, // Increased from 3 to 30 seconds
    plugins: [
      new workbox.expiration.ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 })
    ]
  })
); 