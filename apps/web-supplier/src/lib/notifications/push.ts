'use client'

import { notificationApi } from '@/lib/api/notifications'

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export const pushNotifications = {
  isSupported: () => {
    return 'serviceWorker' in navigator && 'PushManager' in window
  },

  requestPermission: async (): Promise<NotificationPermission> => {
    if (!pushNotifications.isSupported()) {
      throw new Error('Push notifications not supported')
    }

    return await Notification.requestPermission()
  },

  subscribe: async (): Promise<PushSubscription | null> => {
    if (!pushNotifications.isSupported()) {
      console.warn('Push notifications not supported')
      return null
    }

    try {
      const permission = await pushNotifications.requestPermission()

      if (permission !== 'granted') {
        console.log('Notification permission denied')
        return null
      }

      const registration = await navigator.serviceWorker.ready

      // Clé publique VAPID (à remplacer par la vraie clé du serveur)
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      })

      // Envoyer l'abonnement au serveur
      await notificationApi.subscribe(subscription)

      return subscription
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      return null
    }
  },

  unsubscribe: async (): Promise<boolean> => {
    if (!pushNotifications.isSupported()) {
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()
        await notificationApi.unsubscribe()
        return true
      }

      return false
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      return false
    }
  },

  getSubscription: async (): Promise<PushSubscription | null> => {
    if (!pushNotifications.isSupported()) {
      return null
    }

    try {
      const registration = await navigator.serviceWorker.ready
      return await registration.pushManager.getSubscription()
    } catch (error) {
      console.error('Error getting subscription:', error)
      return null
    }
  },

  showNotification: (title: string, options?: NotificationOptions) => {
    if (!pushNotifications.isSupported()) {
      return
    }

    if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          vibrate: [200, 100, 200],
          ...options,
        })
      })
    }
  },
}
