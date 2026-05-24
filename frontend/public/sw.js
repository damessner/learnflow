const CACHE_NAME = 'learnflow-v2'

self.addEventListener('install', (_event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    }),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http')) return
  const url = new URL(event.request.url)

  if (url.pathname.endsWith('.html') || url.pathname === '/') {
    return
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached
      return fetch(event.request).then((response) => {
        if (response.ok && (url.pathname.endsWith('.js') || url.pathname.endsWith('.css'))) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
    }),
  )
})
