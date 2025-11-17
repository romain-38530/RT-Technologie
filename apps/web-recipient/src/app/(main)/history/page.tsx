'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClients } from '@/lib/api/client'
import { Delivery, Statistics } from '@/lib/api/types'
import {
  History as HistoryIcon,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Package,
  BarChart3,
} from 'lucide-react'
import { format, subDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import clsx from 'clsx'

type PeriodFilter = '7d' | '30d' | '90d' | 'all'

export default function HistoryPage() {
  const [period, setPeriod] = useState<PeriodFilter>('30d')
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null)

  // Fetch past deliveries
  const { data: deliveries, isLoading: deliveriesLoading } = useQuery({
    queryKey: ['deliveries-history', 'DEST-001', period],
    queryFn: async () => {
      // Mock data - in production this would call the API
      return getMockPastDeliveries(period)
    },
  })

  // Fetch statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['statistics', 'DEST-001', period],
    queryFn: async () => {
      // Mock data - in production this would call the API
      return getMockStatistics(period)
    },
  })

  const selectedDelivery = deliveries?.find(d => d.id === selectedDeliveryId)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Historique des Livraisons</h1>
          <p className="text-gray-600 mt-1">
            Consultez vos livraisons passées et vos statistiques
          </p>
        </div>

        {/* Period Filter */}
        <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-1">
          {[
            { value: '7d' as PeriodFilter, label: '7 jours' },
            { value: '30d' as PeriodFilter, label: '30 jours' },
            { value: '90d' as PeriodFilter, label: '90 jours' },
            { value: 'all' as PeriodFilter, label: 'Tout' },
          ].map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={clsx(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                period === p.value
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics */}
      {statsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      ) : stats ? (
        <>
          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card bg-gradient-to-br from-primary-50 to-white border-primary-200">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Package className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total livraisons</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalDeliveries}
                  </p>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-success-50 to-white border-success-200">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-success-100 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-success-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">À l'heure</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.onTimeDeliveries}
                  </p>
                  <p className="text-xs text-success-700">
                    {Math.round((stats.onTimeDeliveries / stats.totalDeliveries) * 100)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-warning-50 to-white border-warning-200">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-warning-100 rounded-lg">
                  <Clock className="w-6 h-6 text-warning-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">En retard</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.lateDeliveries}
                  </p>
                  <p className="text-xs text-warning-700">
                    {Math.round((stats.lateDeliveries / stats.totalDeliveries) * 100)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-danger-50 to-white border-danger-200">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-danger-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-danger-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avec anomalies</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.withAnomalies}
                  </p>
                  <p className="text-xs text-danger-700">
                    {Math.round((stats.withAnomalies / stats.totalDeliveries) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Conformity Rate */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Taux de conformité</h3>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-success-600 h-4 rounded-full transition-all"
                      style={{ width: `${stats.conformityRate}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-success-600">
                    {stats.conformityRate}%
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Livraisons conformes sans anomalies
              </p>
            </div>

            {/* Average Delay */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Retard moyen</h3>
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex items-center space-x-3">
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.averageDelay}
                  </p>
                  <p className="text-sm text-gray-600">minutes</p>
                </div>
                {stats.averageDelay > 30 ? (
                  <TrendingUp className="w-8 h-8 text-danger-500" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-success-500" />
                )}
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Pour les livraisons en retard
              </p>
            </div>
          </div>

          {/* Top Carriers */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Performance des transporteurs
            </h3>
            <div className="space-y-3">
              {stats.topCarriers.map((carrier, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{carrier.name}</p>
                      <p className="text-sm text-gray-600">
                        {carrier.deliveries} livraisons
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {carrier.onTimeRate}%
                    </p>
                    <p className="text-xs text-gray-600">ponctualité</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {/* Deliveries History */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <HistoryIcon className="w-5 h-5" />
          <span>Historique détaillé</span>
        </h3>

        {deliveriesLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : deliveries && deliveries.length > 0 ? (
          <div className="space-y-2">
            {deliveries.map(delivery => (
              <button
                key={delivery.id}
                onClick={() =>
                  setSelectedDeliveryId(
                    selectedDeliveryId === delivery.id ? null : delivery.id
                  )
                }
                className="w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <p className="font-semibold text-gray-900">
                        {delivery.orderReference}
                      </p>
                      <span
                        className={clsx(
                          'badge',
                          delivery.status === 'delivered'
                            ? 'badge-success'
                            : 'badge-danger'
                        )}
                      >
                        {delivery.status === 'delivered' ? 'Livrée' : delivery.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(new Date(delivery.scheduledDate), 'dd MMM yyyy', {
                            locale: fr,
                          })}
                        </span>
                      </span>
                      <span>{delivery.carrier.name}</span>
                      <span>{delivery.totalPallets} palettes</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedDeliveryId === delivery.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Origine</p>
                        <p className="font-medium text-gray-900">
                          {delivery.origin.name}
                        </p>
                        <p className="text-gray-600">{delivery.origin.city}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Poids total</p>
                        <p className="font-medium text-gray-900">
                          {delivery.totalWeight} kg
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-gray-600 text-sm mb-2">Articles livrés</p>
                      {delivery.items.map(item => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-sm bg-gray-50 rounded px-3 py-2 mb-1"
                        >
                          <span className="text-gray-900">{item.productName}</span>
                          <span className="text-gray-600">{item.quantity} unités</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <HistoryIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun historique
            </h3>
            <p className="text-gray-600">
              Aucune livraison pour la période sélectionnée
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Mock data functions
function getMockPastDeliveries(period: PeriodFilter): Delivery[] {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 180
  const count = Math.floor(days / 3) // ~1 delivery every 3 days

  return Array.from({ length: count }, (_, i) => ({
    id: `DEL-PAST-${i + 1}`,
    orderId: `ORD-2024-${1000 + i}`,
    orderReference: `CMD-2024-${1000 + i}`,
    status: 'delivered' as const,
    eta: null,
    scheduledDate: subDays(new Date(), i * 3).toISOString().split('T')[0],
    scheduledTime: '10:00',
    carrier: {
      id: `CAR-${(i % 3) + 1}`,
      name: ['Transport Express', 'Logistics Pro', 'Speed Cargo'][i % 3],
    },
    origin: {
      name: 'Entrepôt Central',
      address: '123 Rue Logistique',
      city: 'Paris',
    },
    destination: {
      id: 'DEST-001',
      name: 'Entrepôt Principal',
      address: '456 Avenue Commerce',
      city: 'Lyon',
    },
    items: [
      {
        id: `ITEM-${i + 1}`,
        productCode: `PROD-${(i % 5) + 1}`,
        productName: `Produit ${(i % 5) + 1}`,
        quantity: 100 + i * 10,
        pallets: 2 + (i % 3),
        weight: 500 + i * 50,
      },
    ],
    totalPallets: 2 + (i % 3),
    totalWeight: 500 + i * 50,
    createdAt: subDays(new Date(), i * 3 + 1).toISOString(),
    updatedAt: subDays(new Date(), i * 3).toISOString(),
  }))
}

function getMockStatistics(period: PeriodFilter): Statistics {
  const baseTotal = period === '7d' ? 5 : period === '30d' ? 22 : period === '90d' ? 65 : 150

  return {
    period,
    totalDeliveries: baseTotal,
    onTimeDeliveries: Math.floor(baseTotal * 0.85),
    lateDeliveries: Math.floor(baseTotal * 0.15),
    withAnomalies: Math.floor(baseTotal * 0.08),
    averageDelay: 18,
    conformityRate: 92,
    topCarriers: [
      {
        name: 'Transport Express',
        deliveries: Math.floor(baseTotal * 0.4),
        onTimeRate: 88,
      },
      {
        name: 'Logistics Pro',
        deliveries: Math.floor(baseTotal * 0.35),
        onTimeRate: 92,
      },
      {
        name: 'Speed Cargo',
        deliveries: Math.floor(baseTotal * 0.25),
        onTimeRate: 85,
      },
    ],
  }
}
