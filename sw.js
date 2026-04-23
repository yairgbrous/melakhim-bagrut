/* =========================================================================
   sw.js — offline-first service worker for ספר מלכים · בגרות 2551.
   Strategy:
     - Precache index.html + manifest + all components/*.js + all data/*.js
       + all assets/*.css at install time.
     - Navigation requests: network first, fall back to cached index.html so
       the PWA opens offline.
     - Other requests: stale-while-revalidate — serve cache immediately,
       refresh in background. Falls back to cache on network error.
     - Cross-origin (Tailwind / React / Firebase / Google Fonts) CDN: runtime
       cache-first, so the app still boots offline after one online visit.

   Bump CACHE_VERSION on every release so old caches are cleaned.
   ========================================================================= */
const CACHE_VERSION = 'melakhim-v1340';
const RUNTIME_CACHE = 'melakhim-runtime-v1340';
const CDN_CACHE     = 'melakhim-cdn-v1';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './share.html',

  // assets
  './assets/quote-cards.css',
  './assets/contrast-hotfix.css',
  './assets/layout-fix.css',

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

  // data
  './data/_entity-index.js',
  './data/characters.js',
  './data/flashcards.js',
  './data/key-concepts.js',
  './data/kings.js',
  './data/past-exams.js',
  './data/places.js',
  './data/review-questions.js',
  './data/quotes.js'
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

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;

  // Navigation: network first → cached index.html fallback so the SPA boots offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  if (isSameOrigin) {
    // Same-origin static assets: stale-while-revalidate.
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

  // Cross-origin (CDN: Tailwind, React, Babel, Firebase, Google Fonts):
  // cache-first so the app boots offline after first online visit. Never cache
  // Firebase auth / RTDB data requests (these are dynamic and user-scoped).
  const isFirebaseData =
    url.hostname.endsWith('firebaseio.com') ||
    url.hostname.endsWith('firebasedatabase.app') ||
    url.hostname.endsWith('googleapis.com') ||
    url.hostname.endsWith('identitytoolkit.googleapis.com');

  if (isFirebaseData) return; // let the browser handle it directly

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
