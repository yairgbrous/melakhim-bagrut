/* =========================================================================
   sw.js — offline-first service worker for ספר מלכים · בגרות 2551.

   Strategies:
     - Navigation: network-first → cached index.html fallback (SPA shell).
     - JS (components/, data/):  network-first with cache fallback (always
       gets freshest code on good connections, stays usable offline).
     - CSS, fonts (woff/woff2/ttf), images: cache-first with background
       refresh (fast + offline-resilient).
     - Cross-origin CDN (Tailwind, React, Babel, Google Fonts): cache-first.
     - Firebase auth/RTDB: pass-through (never cached).

   Offline state is signalled to the app via postMessage so it can render a
   banner. Bump CACHE_VERSION on every release so old caches drop.
   ========================================================================= */
const CACHE_VERSION = 'melakhim-v13100';
const RUNTIME_CACHE = 'melakhim-runtime-v13100';
const CDN_CACHE     = 'melakhim-cdn-v13100';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './share.html',

  // assets (CSS — cache-first)
  './assets/quote-cards.css',
  './assets/contrast-hotfix.css',
  './assets/layout-fix.css',
  './assets/readability-pass.css',

  // components (cache-busted via ?v= in index.html; SW caches bare URLs too)
  './components/QuizEngine.js',
  './components/ExamSim2551.js',
  './components/EventPage.js',
  './components/PlacePage.js',
  './components/KingsUtils.js',
  './components/KingsTable.js',
  './components/CharacterPage.js',
  './components/MapsPage.js',
  './components/BreadthPage.js',
  './components/AuthProvider.js',
  './components/Home.js',
  './components/EntityLink.js',
  './components/FlashcardDrill.js',
  './components/ThemeToggle.js',
  './components/ErrorBoundary.js',
  './components/Toast.js',
  './components/DailyChallenge.js',
  './components/XpBadge.js',
  './components/InstantSearch.js',
  './components/NotFound.js',
  './components/PwaShell.js',

  // data (JS constants)
  './data/_entity-index.js',
  './data/_id-aliases.js',
  './data/archaeology.js',
  './data/characters.js',
  './data/events.js',
  './data/flashcards.js',
  './data/hebrew-dates.js',
  './data/key-concepts.js',
  './data/kings.js',
  './data/motifs.js',
  './data/past-exams.js',
  './data/places.js',
  './data/quotes.js',
  './data/recurring-items.js',
  './data/review-questions.js',
  './data/unit-deep-summaries.js'
];

// Precache: tolerate individual 404s (file may not exist on older deploys).
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch(() => null)
        )
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION && key !== RUNTIME_CACHE && key !== CDN_CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

function broadcastOffline(isOffline){
  self.clients.matchAll({ type:'window' }).then((clients) => {
    clients.forEach((c) => c.postMessage({ type: isOffline ? 'offline' : 'online' }));
  });
}

function isFontRequest(url){
  if (/\.woff2?($|\?)/i.test(url.pathname)) return true;
  if (/\.ttf($|\?)/i.test(url.pathname))    return true;
  if (url.hostname === 'fonts.gstatic.com') return true;
  if (url.hostname === 'fonts.googleapis.com') return true;
  return false;
}

function isCssRequest(url){
  return /\.css($|\?)/i.test(url.pathname);
}

function isJsRequest(url){
  return /\.(js|mjs)($|\?)/i.test(url.pathname);
}

function isImageRequest(url){
  return /\.(png|jpe?g|gif|svg|webp|avif|ico)($|\?)/i.test(url.pathname);
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;

  // Pass-through for Firebase auth / RTDB (never cache user data).
  const isFirebaseData =
    url.hostname.endsWith('firebaseio.com') ||
    url.hostname.endsWith('firebasedatabase.app') ||
    url.hostname.endsWith('googleapis.com') ||
    url.hostname.endsWith('identitytoolkit.googleapis.com');
  if (isFirebaseData) return;

  // Navigation: network-first, fall back to cached index.html.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          broadcastOffline(false);
          return response;
        })
        .catch(() => {
          broadcastOffline(true);
          return caches.match(request).then((cached) => cached || caches.match('./index.html'));
        })
    );
    return;
  }

  // Fonts: cache-first with background refresh (cross-origin allowed).
  if (isFontRequest(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchAndStore = fetch(request).then((response) => {
          if (response && (response.status === 200 || response.type === 'opaque')) {
            const copy = response.clone();
            caches.open(CDN_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }).catch(() => cached);
        return cached || fetchAndStore;
      })
    );
    return;
  }

  if (isSameOrigin) {
    // CSS: cache-first.
    if (isCssRequest(url)) {
      event.respondWith(
        caches.match(request).then((cached) => {
          const fetchAndStore = fetch(request).then((response) => {
            if (response && response.status === 200) {
              const copy = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          }).catch(() => cached);
          return cached || fetchAndStore;
        })
      );
      return;
    }

    // JS: network-first (prefer freshest code), cache fallback.
    if (isJsRequest(url)) {
      event.respondWith(
        fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const copy = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
            }
            broadcastOffline(false);
            return response;
          })
          .catch(() => {
            broadcastOffline(true);
            return caches.match(request);
          })
      );
      return;
    }

    // Images + everything else same-origin: stale-while-revalidate.
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchAndUpdate = fetch(request)
          .then((response) => {
            if (response && response.status === 200 && response.type === 'basic') {
              const copy = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => cached);
        return cached || fetchAndUpdate;
      })
    );
    return;
  }

  // Cross-origin (CDN): cache-first.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CDN_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
