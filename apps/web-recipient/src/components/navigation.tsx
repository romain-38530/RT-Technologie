'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Truck,
  Calendar,
  ClipboardCheck,
  AlertTriangle,
  History,
  Package
} from 'lucide-react'
import clsx from 'clsx'

const navigation = [
  {
    name: 'Livraisons Attendues',
    href: '/deliveries',
    icon: Truck,
    description: 'Livraisons à venir',
  },
  {
    name: 'Créneaux',
    href: '/slots',
    icon: Calendar,
    description: 'Gestion des RDV',
  },
  {
    name: 'Réception',
    href: '/receive',
    icon: ClipboardCheck,
    description: 'Contrôle et signature',
  },
  {
    name: 'Anomalies',
    href: '/anomalies',
    icon: AlertTriangle,
    description: 'Déclarations',
  },
  {
    name: 'Historique',
    href: '/history',
    icon: History,
    description: 'Livraisons passées',
  },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="w-64 bg-white border-r border-gray-200 p-4">
      <div className="space-y-1">
        {navigation.map((item) => {
          const isActive = pathname?.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors group',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <Icon
                className={clsx(
                  'w-5 h-5',
                  isActive ? 'text-primary-600' : 'text-gray-500 group-hover:text-gray-700'
                )}
              />
              <div className="flex-1">
                <p className={clsx(
                  'text-sm font-medium',
                  isActive ? 'text-primary-700' : 'text-gray-900'
                )}>
                  {item.name}
                </p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Aujourd'hui
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Attendues</span>
            <span className="text-sm font-semibold text-gray-900">5</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2 bg-success-50 rounded-lg">
            <span className="text-sm text-success-700">Reçues</span>
            <span className="text-sm font-semibold text-success-900">12</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2 bg-warning-50 rounded-lg">
            <span className="text-sm text-warning-700">Anomalies</span>
            <span className="text-sm font-semibold text-warning-900">2</span>
          </div>
        </div>
      </div>
    </nav>
  )
}
