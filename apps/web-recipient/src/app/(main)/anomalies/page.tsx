'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAnomalies } from '@/lib/api/anomalies'
import { AnomalyCard } from '@/components/anomaly-card'
import { CreateAnomalyModal } from '@/components/create-anomaly-modal'
import { AlertTriangle, Plus, Filter } from 'lucide-react'
import clsx from 'clsx'

type AnomalyStatusFilter = 'all' | 'reported' | 'in_review' | 'resolved'
type AnomalySeverityFilter = 'all' | 'minor' | 'major' | 'critical'

export default function AnomaliesPage() {
  const [statusFilter, setStatusFilter] = useState<AnomalyStatusFilter>('all')
  const [severityFilter, setSeverityFilter] = useState<AnomalySeverityFilter>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { data: anomalies, isLoading } = useQuery({
    queryKey: ['anomalies', 'DEST-001'],
    queryFn: () => getAnomalies('DEST-001'),
    refetchInterval: 60000, // Refresh every minute
  })

  const filteredAnomalies = anomalies?.filter(anomaly => {
    if (statusFilter !== 'all' && anomaly.status !== statusFilter) return false
    if (severityFilter !== 'all' && anomaly.severity !== severityFilter) return false
    return true
  })

  const stats = {
    total: anomalies?.length || 0,
    reported: anomalies?.filter(a => a.status === 'reported').length || 0,
    inReview: anomalies?.filter(a => a.status === 'in_review').length || 0,
    critical: anomalies?.filter(a => a.severity === 'critical').length || 0,
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Anomalies</h1>
          <p className="text-gray-600 mt-1">
            Déclarez et suivez les anomalies de livraison
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Déclarer une anomalie</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-gray-50 to-white border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-warning-50 to-white border-warning-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-warning-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Signalées</p>
              <p className="text-2xl font-bold text-gray-900">{stats.reported}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-primary-50 to-white border-primary-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">En révision</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inReview}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-danger-50 to-white border-danger-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-danger-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-danger-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Critiques</p>
              <p className="text-2xl font-bold text-gray-900">{stats.critical}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Filter */}
          <div>
            <label className="label">Statut</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as AnomalyStatusFilter)}
              className="input"
            >
              <option value="all">Tous les statuts</option>
              <option value="reported">Signalée</option>
              <option value="in_review">En révision</option>
              <option value="resolved">Résolue</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="label">Gravité</label>
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value as AnomalySeverityFilter)}
              className="input"
            >
              <option value="all">Toutes les gravités</option>
              <option value="minor">Mineure</option>
              <option value="major">Majeure</option>
              <option value="critical">Critique</option>
            </select>
          </div>
        </div>
      </div>

      {/* Anomalies List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      ) : filteredAnomalies && filteredAnomalies.length > 0 ? (
        <div className="space-y-4">
          {filteredAnomalies.map(anomaly => (
            <AnomalyCard key={anomaly.id} anomaly={anomaly} />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucune anomalie
          </h3>
          <p className="text-gray-600 mb-6">
            {statusFilter !== 'all' || severityFilter !== 'all'
              ? 'Aucune anomalie ne correspond à vos filtres'
              : 'Aucune anomalie déclarée pour le moment'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Déclarer une anomalie</span>
          </button>
        </div>
      )}

      {/* Create Anomaly Modal */}
      {showCreateModal && (
        <CreateAnomalyModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  )
}
