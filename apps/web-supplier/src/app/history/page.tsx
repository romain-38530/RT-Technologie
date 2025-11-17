'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { History, TrendingUp, Clock, CheckCircle, XCircle, Package } from 'lucide-react'
import { pickupsApi } from '@/lib/api/pickups'
import { Navigation } from '@/components/layout/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'

export default function HistoryPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')

  const getPeriodDates = () => {
    const end = new Date()
    const start = new Date()

    switch (period) {
      case 'week':
        start.setDate(start.getDate() - 7)
        break
      case 'month':
        start.setMonth(start.getMonth() - 1)
        break
      case 'year':
        start.setFullYear(start.getFullYear() - 1)
        break
    }

    return {
      start: start.toISOString(),
      end: end.toISOString(),
    }
  }

  const { start, end } = getPeriodDates()

  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['kpis', start, end],
    queryFn: () => pickupsApi.getKPIs(start, end),
  })

  const { data: pickups, isLoading: pickupsLoading } = useQuery({
    queryKey: ['pickups-history'],
    queryFn: () => pickupsApi.getAll('picked_up'),
  })

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      scheduled: 'Planifie',
      confirmed: 'Confirme',
      in_preparation: 'En Preparation',
      ready: 'Pret',
      picked_up: 'Enleve',
      cancelled: 'Annule',
    }
    return labels[status] || status
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Historique et Performances</h1>
          <p className="text-slate-600">Consultez vos enlevements passes et vos indicateurs de performance</p>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                period === 'week'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              7 derniers jours
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                period === 'month'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              30 derniers jours
            </button>
            <button
              onClick={() => setPeriod('year')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                period === 'year'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              12 derniers mois
            </button>
          </div>
        </div>

        {/* KPIs */}
        {kpisLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          </div>
        ) : kpis ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Total Enlevements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{kpis.totalPickups}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  A l'heure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success-600">{kpis.onTimePickups}</div>
                <p className="text-sm text-slate-500 mt-1">
                  {kpis.totalPickups > 0
                    ? `${Math.round((kpis.onTimePickups / kpis.totalPickups) * 100)}%`
                    : '0%'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  En retard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-warning-600">{kpis.delayedPickups}</div>
                <p className="text-sm text-slate-500 mt-1">
                  {kpis.totalPickups > 0
                    ? `${Math.round((kpis.delayedPickups / kpis.totalPickups) * 100)}%`
                    : '0%'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Taux de Conformite
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary-600">
                  {Math.round(kpis.complianceRate)}%
                </div>
                <p className="text-sm text-slate-500 mt-1">Documents complets</p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Additional Stats */}
        {kpis && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Temps Moyen de Preparation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  {Math.round(kpis.averagePreparationTime / 60)} min
                </div>
                <p className="text-sm text-slate-500">
                  Du debut de preparation jusqu'au statut "Pret"
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Annulations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-danger-600 mb-2">
                  {kpis.cancelledPickups}
                </div>
                <p className="text-sm text-slate-500">
                  {kpis.totalPickups > 0
                    ? `${Math.round((kpis.cancelledPickups / kpis.totalPickups) * 100)}% du total`
                    : '0% du total'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* History List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historique des Enlevements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pickupsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
              </div>
            ) : pickups && pickups.length > 0 ? (
              <div className="space-y-3">
                {pickups.slice(0, 20).map((pickup) => (
                  <div
                    key={pickup.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-slate-900">
                          Commande #{pickup.orderId}
                        </span>
                        <Badge variant="secondary">
                          {getStatusLabel(pickup.status)}
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-600">
                        {pickup.carrier.name} • {pickup.items.length} article(s)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-900">
                        {pickup.actualDate ? formatDateTime(pickup.actualDate) :
                         pickup.confirmedDate ? formatDateTime(pickup.confirmedDate) :
                         formatDateTime(pickup.scheduledDate)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">
                Aucun enlevement dans l'historique
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
