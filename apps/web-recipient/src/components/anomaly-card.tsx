'use client'

import { Anomaly } from '@/lib/api/types'
import { AlertTriangle, Clock, User, Package, CheckCircle2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import clsx from 'clsx'

interface AnomalyCardProps {
  anomaly: Anomaly
}

const severityConfig = {
  minor: {
    label: 'Mineure',
    color: 'badge-info',
    bgColor: 'bg-primary-50',
    borderColor: 'border-primary-200',
  },
  major: {
    label: 'Majeure',
    color: 'badge-warning',
    bgColor: 'bg-warning-50',
    borderColor: 'border-warning-200',
  },
  critical: {
    label: 'Critique',
    color: 'badge-danger',
    bgColor: 'bg-danger-50',
    borderColor: 'border-danger-200',
  },
}

const statusConfig = {
  reported: {
    label: 'Signalée',
    color: 'badge-warning',
  },
  acknowledged: {
    label: 'Accusée',
    color: 'badge-info',
  },
  in_review: {
    label: 'En révision',
    color: 'badge-info',
  },
  resolved: {
    label: 'Résolue',
    color: 'badge-success',
  },
  closed: {
    label: 'Clôturée',
    color: 'badge',
  },
}

const typeLabels = {
  damaged_goods: 'Marchandises endommagées',
  missing_items: 'Articles manquants',
  wrong_items: 'Articles incorrects',
  quantity_mismatch: 'Écart de quantité',
  quality_issue: 'Problème de qualité',
  packaging_issue: 'Problème d\'emballage',
}

export function AnomalyCard({ anomaly }: AnomalyCardProps) {
  const severity = severityConfig[anomaly.severity]
  const status = statusConfig[anomaly.status]

  const reportedTimeAgo = formatDistanceToNow(new Date(anomaly.reportedAt), {
    addSuffix: true,
    locale: fr,
  })

  return (
    <div className={clsx('card', severity.borderColor)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className={clsx('p-2 rounded-lg', severity.bgColor)}>
            <AlertTriangle
              className={clsx(
                'w-5 h-5',
                anomaly.severity === 'critical'
                  ? 'text-danger-600'
                  : anomaly.severity === 'major'
                  ? 'text-warning-600'
                  : 'text-primary-600'
              )}
            />
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {typeLabels[anomaly.type]}
              </h3>
              <span className={severity.color}>{severity.label}</span>
              <span className={status.color}>{status.label}</span>
            </div>
            <p className="text-sm text-gray-600">
              Anomalie #{anomaly.id} • Commande #{anomaly.orderId}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="text-gray-700">{anomaly.description}</p>
      </div>

      {/* Items */}
      <div className="border-t border-gray-200 pt-4 mb-4">
        <p className="text-sm font-medium text-gray-900 mb-2">Articles concernés</p>
        <div className="space-y-2">
          {anomaly.items.map((item, index) => (
            <div
              key={index}
              className="flex items-start justify-between text-sm bg-gray-50 rounded px-3 py-2"
            >
              <div>
                <p className="font-medium text-gray-900">{item.productName}</p>
                <p className="text-gray-600 text-xs">{item.productCode}</p>
                <p className="text-gray-600 text-xs mt-1">{item.issue}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-900">
                  {item.receivedQuantity} / {item.expectedQuantity}
                </p>
                <p className="text-xs text-gray-600">unités</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Photos */}
      {anomaly.photos.length > 0 && (
        <div className="border-t border-gray-200 pt-4 mb-4">
          <p className="text-sm font-medium text-gray-900 mb-2">
            Photos ({anomaly.photos.length})
          </p>
          <div className="flex items-center space-x-2">
            {anomaly.photos.slice(0, 3).map((photo, index) => (
              <div
                key={index}
                className="w-16 h-16 bg-gray-200 rounded border border-gray-300"
              >
                {/* Photo preview would go here */}
              </div>
            ))}
            {anomaly.photos.length > 3 && (
              <div className="w-16 h-16 bg-gray-100 rounded border border-gray-300 flex items-center justify-center">
                <span className="text-xs text-gray-600">
                  +{anomaly.photos.length - 3}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="flex items-center justify-between text-sm border-t border-gray-200 pt-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <User className="w-4 h-4" />
            <span>{anomaly.reportedBy}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{reportedTimeAgo}</span>
          </div>
        </div>

        {anomaly.status === 'resolved' && anomaly.resolution && (
          <div className="flex items-center space-x-2 text-success-700">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-medium">Résolue</span>
          </div>
        )}
      </div>

      {/* Resolution */}
      {anomaly.resolution && (
        <div className="mt-4 p-3 bg-success-50 border border-success-200 rounded-lg">
          <p className="text-sm font-medium text-success-900 mb-1">Résolution</p>
          <p className="text-sm text-success-800">{anomaly.resolution}</p>
          {anomaly.resolvedBy && anomaly.resolvedAt && (
            <p className="text-xs text-success-700 mt-2">
              Par {anomaly.resolvedBy} •{' '}
              {formatDistanceToNow(new Date(anomaly.resolvedAt), {
                addSuffix: true,
                locale: fr,
              })}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
