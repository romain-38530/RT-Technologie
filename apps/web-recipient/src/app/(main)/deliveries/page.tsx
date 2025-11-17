'use client'

import { useQuery } from '@tanstack/react-query'
import { getExpectedDeliveries } from '@/lib/api/deliveries'
import { DeliveryCard } from '@/components/delivery-card'
import { Package, Clock, TruckIcon } from 'lucide-react'
import { useState } from 'react'

export default function DeliveriesPage() {
  const [filter, setFilter] = useState<'all' | 'today' | 'arriving_soon'>('all')

  const { data: deliveries, isLoading } = useQuery({
    queryKey: ['deliveries', 'DEST-001'],
    queryFn: () => getExpectedDeliveries('DEST-001'),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const filteredDeliveries = deliveries?.filter(delivery => {
    if (filter === 'all') return true
    if (filter === 'today') {
      const today = new Date().toISOString().split('T')[0]
      return delivery.scheduledDate === today
    }
    if (filter === 'arriving_soon') {
      return delivery.status === 'arriving_soon'
    }
    return true
  })

  const stats = {
    total: deliveries?.length || 0,
    today: deliveries?.filter(d => {
      const today = new Date().toISOString().split('T')[0]
      return d.scheduledDate === today
    }).length || 0,
    arrivingSoon: deliveries?.filter(d => d.status === 'arriving_soon').length || 0,
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Livraisons Attendues</h1>
          <p className="text-gray-600 mt-1">
            Suivez vos livraisons en temps réel
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-primary-50 to-white border-primary-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Package className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total attendu</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-success-50 to-white border-success-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-success-100 rounded-lg">
              <Clock className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Aujourd'hui</p>
              <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-warning-50 to-white border-warning-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-warning-100 rounded-lg">
              <TruckIcon className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Arrivée imminente</p>
              <p className="text-2xl font-bold text-gray-900">{stats.arrivingSoon}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-3 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            filter === 'all'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Toutes
        </button>
        <button
          onClick={() => setFilter('today')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            filter === 'today'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Aujourd'hui
        </button>
        <button
          onClick={() => setFilter('arriving_soon')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            filter === 'arriving_soon'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Arrivée imminente
        </button>
      </div>

      {/* Deliveries List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      ) : filteredDeliveries && filteredDeliveries.length > 0 ? (
        <div className="space-y-4">
          {filteredDeliveries.map(delivery => (
            <DeliveryCard key={delivery.id} delivery={delivery} />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucune livraison
          </h3>
          <p className="text-gray-600">
            {filter === 'all'
              ? 'Aucune livraison attendue pour le moment'
              : filter === 'today'
              ? 'Aucune livraison prévue aujourd\'hui'
              : 'Aucune livraison en arrivée imminente'}
          </p>
        </div>
      )}
    </div>
  )
}
