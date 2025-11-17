'use client'

import { Bell, User, Settings } from 'lucide-react'
import { useState } from 'react'
import { NotificationPanel } from './notification-panel'

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(3)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-primary-600">RT Recipient</h1>
          <span className="text-sm text-gray-500">Gestion des Livraisons</span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
            )}
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Entrepôt Principal</p>
              <p className="text-xs text-gray-500">Réceptionnaire</p>
            </div>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <User className="w-5 h-5" />
            </button>
          </div>

          {/* Settings */}
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Notification Panel */}
      {showNotifications && (
        <NotificationPanel
          onClose={() => setShowNotifications(false)}
          onClearAll={() => setUnreadCount(0)}
        />
      )}
    </header>
  )
}
