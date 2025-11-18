'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Bell, X } from 'lucide-react'
import { notificationApi } from '@/lib/api/notifications'
import { pushNotifications } from '@/lib/notifications/push'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'

export function NotificationManager() {
  const [isOpen, setIsOpen] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false)

  const { data: notifications, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getAll(),
    refetchInterval: 30000, // Refetch every 30s
  })

  useEffect(() => {
    // Vérifier si les notifications push sont déjà activées
    pushNotifications.getSubscription().then((subscription) => {
      setPushEnabled(!!subscription)
    })

    // Demander la permission au chargement si pas encore fait
    if (pushNotifications.isSupported() && Notification.permission === 'default') {
      setTimeout(() => {
        pushNotifications.requestPermission()
      }, 5000) // Attendre 5s avant de demander
    }
  }, [])

  const unreadCount = notifications?.filter(n => !n.read).length || 0

  const handleEnablePush = async () => {
    const subscription = await pushNotifications.subscribe()
    setPushEnabled(!!subscription)
  }

  const handleDisablePush = async () => {
    const success = await pushNotifications.unsubscribe()
    if (success) {
      setPushEnabled(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    await notificationApi.markAsRead(id)
    refetch()
  }

  const handleMarkAllAsRead = async () => {
    await notificationApi.markAllAsRead()
    refetch()
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-md text-slate-600 hover:bg-slate-50"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-5 w-5 bg-danger-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed right-4 top-20 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-lg">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Push Toggle */}
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              {pushNotifications.isSupported() ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Notifications Push</span>
                  <Button
                    size="sm"
                    variant={pushEnabled ? 'default' : 'outline'}
                    onClick={pushEnabled ? handleDisablePush : handleEnablePush}
                  >
                    {pushEnabled ? 'Activees' : 'Activer'}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Notifications push non supportees par votre navigateur
                </p>
              )}
            </div>

            {/* Actions */}
            {unreadCount > 0 && (
              <div className="p-3 border-b border-slate-200">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleMarkAllAsRead}
                  className="w-full"
                >
                  Tout marquer comme lu
                </Button>
              </div>
            )}

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications && notifications.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-slate-50 cursor-pointer ${
                        !notification.read ? 'bg-primary-50' : ''
                      }`}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h4 className="font-medium text-sm text-slate-900">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <Badge variant="default" className="text-xs">Nouveau</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDateTime(notification.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">Aucune notification</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
