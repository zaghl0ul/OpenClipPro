// Simple Service Worker for FFmpeg Caching (No external dependencies)
// This avoids CORS issues with Workbox CDN while keeping COOP/COEP headers for FFmpeg

const CACHE_NAME = 'openclip-pro-v1';
const FFMPEG_CACHE_NAME = 'ffmpeg-core-v1';

// Skip waiting so updates apply immediately on refresh
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Helper function to check if we should cache a request
function shouldCache(request) {
  const url = new URL(request.url);
  
  // Don't cache development files
  if (url.searchParams.has('t')) {
    return false; // Skip HMR files with timestamp
  }
  
  // Don't cache TypeScript files
  if (url.pathname.endsWith('.tsx') || url.pathname.endsWith('.ts')) {
    return false;
  }
  
  // Don't cache CSS files with timestamp parameters (development)
  if (url.pathname.endsWith('.css') && url.searchParams.has('t')) {
    return false;
  }
  
  // Don't cache localhost development files
  if (url.hostname === 'localhost' && url.port === '5173') {
    return false;
  }
  
  return true;
}

// Network-first strategy for FFmpeg files with fallback to cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle FFmpeg core files
  if (url.pathname.startsWith('/ffmpeg') || url.pathname.includes('ffmpeg-core')) {
    event.respondWith(handleFFmpegFiles(event.request));
    return;
  }
  
  // Handle JS/WASM worker files - but only if we should cache them
  if (shouldCache(event.request) && (
      event.request.destination === 'script' || 
      event.request.destination === 'worker' ||
      url.pathname.endsWith('.wasm'))) {
    event.respondWith(handleWorkerFiles(event.request));
    return;
  }
  
  // Default: just fetch from network without caching
  event.respondWith(fetch(event.request));
});

async function handleFFmpegFiles(request) {
  const cache = await caches.open(FFMPEG_CACHE_NAME);
  
  try {
    // Try network first with timeout
    const networkPromise = fetch(request, {
      mode: 'cors',
      credentials: 'omit'
    });
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Network timeout')), 60000)
    );
    
    const response = await Promise.race([networkPromise, timeoutPromise]);
    
    if (response.ok) {
      // Cache successful response
      cache.put(request, response.clone());
      return response;
    }
  } catch (error) {
    console.warn('Network failed for FFmpeg file, trying cache:', error);
  }
  
  // Fallback to cache
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // If all fails, throw error
  throw new Error(`Failed to fetch ${request.url} from network and cache`);
}

async function handleWorkerFiles(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // Try network first with shorter timeout for JS files
    const networkPromise = fetch(request, {
      mode: 'cors',
      credentials: 'omit'
    });
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Network timeout')), 30000)
    );
    
    const response = await Promise.race([networkPromise, timeoutPromise]);
    
    if (response.ok) {
      // Cache successful response
      cache.put(request, response.clone());
      return response;
    }
  } catch (error) {
    console.warn('Network failed for worker file, trying cache:', error);
  }
  
  // Fallback to cache
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // If all fails, throw error
  throw new Error(`Failed to fetch ${request.url} from network and cache`);
}

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== FFMPEG_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 