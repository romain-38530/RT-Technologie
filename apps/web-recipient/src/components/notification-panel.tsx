'use client'

import { X, Clock, Package, AlertCircle } from 'lucide-react'

interface NotificationPanelProps {
  onClose: () => void
  onClearAll: () => void
}

const mockNotifications = [
  {
    id: 1,
    type: 'delivery',
    title: 'Livraison imminente',
    message: 'Commande #ORD-2024-001 arrive dans 15 minutes',
    time: 'Il y a 5 min',
    unread: true,
  },
  {
    id: 2,
    type: 'slot',
    title: 'Créneau confirmé',
    message: 'RDV confirmé pour 14h30 - Commande #ORD-2024-003',
    time: 'Il y a 1h',
    unread: true,
  },
  {
    id: 3,
    type: 'anomaly',
    title: 'Anomalie en attente',
    message: 'Votre déclaration pour #ORD-2024-002 nécessite plus d\'infos',
    time: 'Il y a 2h',
    unread: true,
  },
]

export function NotificationPanel({ onClose, onClearAll }: NotificationPanelProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'delivery': return Package
      case 'slot': return Clock
      case 'anomaly': return AlertCircle
      default: return Package
    }
  }

  return (
    <div className="absolute right-0 top-full mt-2 mr-6 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={onClearAll}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Tout lire
          </button>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {mockNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucune notification</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {mockNotifications.map((notification) => {
              const Icon = getIcon(notification.type)
              return (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    notification.unread ? 'bg-primary-50/30' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <Icon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.time}
                      </p>
                    </div>
                    {notification.unread && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-primary-600 rounded-full" />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 text-center">
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          Voir toutes les notifications
        </button>
      </div>
    </div>
  )
}
