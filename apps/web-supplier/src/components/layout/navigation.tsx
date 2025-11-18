'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, Calendar, ClipboardCheck, History } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NotificationManager } from '@/components/notifications/notification-manager'

const navigation = [
  { name: 'Enlevements', href: '/pickups', icon: Package },
  { name: 'Creneaux', href: '/slots', icon: Calendar },
  { name: 'Preparation', href: '/preparation', icon: ClipboardCheck },
  { name: 'Historique', href: '/history', icon: History },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Package className="h-8 w-8 text-primary-600" />
            <span className="font-bold text-xl text-slate-900">RT Supplier</span>
          </Link>

          <div className="hidden md:flex space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          <NotificationManager />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-slate-200">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center py-3 rounded-md text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
