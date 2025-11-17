import { notificationsApi } from './client'
import type { Notification } from '@/types'

export const notificationApi = {
  // Récupérer toutes les notifications
  getAll: async (unreadOnly = false): Promise<Notification[]> => {
    const params = unreadOnly ? { unread: true } : {}
    const { data } = await notificationsApi.get('/notifications', { params })
    return data
  },

  // Marquer comme lue
  markAsRead: async (id: string): Promise<void> => {
    await notificationsApi.put(`/notifications/${id}/read`)
  },

  // Marquer toutes comme lues
  markAllAsRead: async (): Promise<void> => {
    await notificationsApi.put('/notifications/read-all')
  },

  // S'abonner aux notifications push
  subscribe: async (subscription: PushSubscription): Promise<void> => {
    await notificationsApi.post('/notifications/subscribe', subscription)
  },

  // Se désabonner
  unsubscribe: async (): Promise<void> => {
    await notificationsApi.post('/notifications/unsubscribe')
  },
}
