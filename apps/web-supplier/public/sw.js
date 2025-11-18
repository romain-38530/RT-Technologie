// Service Worker pour les notifications push

self.addEventListener('push', (event) => {
  if (!event.data) {
    return
  }

  const data = event.data.json()

  const options = {
    body: data.message || 'Nouvelle notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      pickupId: data.pickupId,
    },
    actions: data.actions || [],
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'RT Supplier', options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si une fenêtre est déjà ouverte, la focus
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }
      // Sinon, ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})
