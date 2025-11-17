'use client'

import { Delivery } from '@/lib/api/types'
import { MapPin, Clock, Package, User, Phone, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'
import clsx from 'clsx'

interface DeliveryCardProps {
  delivery: Delivery
}

const statusConfig = {
  scheduled: {
    label: 'Planifiée',
    color: 'badge-info',
    bgColor: 'bg-primary-50',
    borderColor: 'border-primary-200',
  },
  confirmed: {
    label: 'Confirmée',
    color: 'badge-success',
    bgColor: 'bg-success-50',
    borderColor: 'border-success-200',
  },
  in_transit: {
    label: 'En transit',
    color: 'badge-warning',
    bgColor: 'bg-warning-50',
    borderColor: 'border-warning-200',
  },
  arriving_soon: {
    label: 'Arrivée imminente',
    color: 'badge-danger',
    bgColor: 'bg-danger-50',
    borderColor: 'border-danger-200',
  },
  delivered: {
    label: 'Livrée',
    color: 'badge-success',
    bgColor: 'bg-success-50',
    borderColor: 'border-success-200',
  },
  cancelled: {
    label: 'Annulée',
    color: 'badge',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
  delayed: {
    label: 'Retardée',
    color: 'badge-danger',
    bgColor: 'bg-danger-50',
    borderColor: 'border-danger-200',
  },
}

export function DeliveryCard({ delivery }: DeliveryCardProps) {
  const status = statusConfig[delivery.status]
  const isUrgent = delivery.status === 'arriving_soon'

  const etaText = delivery.eta
    ? formatDistanceToNow(new Date(delivery.eta), {
        addSuffix: true,
        locale: fr,
      })
    : null

  return (
    <div
      className={clsx(
        'card transition-shadow hover:shadow-md',
        status.borderColor,
        isUrgent && 'ring-2 ring-danger-500'
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {delivery.orderReference}
            </h3>
            <span className={status.color}>{status.label}</span>
            {isUrgent && (
              <span className="flex items-center space-x-1 text-danger-600 text-sm font-medium">
                <AlertCircle className="w-4 h-4" />
                <span>Urgent</span>
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">Commande #{delivery.orderId}</p>
        </div>

        {etaText && (
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">Arrivée estimée</p>
            <p className="text-sm text-danger-600 font-semibold">{etaText}</p>
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Origin */}
        <div className="flex items-start space-x-3">
          <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">{delivery.origin.name}</p>
            <p className="text-sm text-gray-600">{delivery.origin.city}</p>
          </div>
        </div>

        {/* Schedule */}
        <div className="flex items-start space-x-3">
          <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {new Date(delivery.scheduledDate).toLocaleDateString('fr-FR')}
            </p>
            {delivery.scheduledTime && (
              <p className="text-sm text-gray-600">à {delivery.scheduledTime}</p>
            )}
          </div>
        </div>

        {/* Carrier */}
        <div className="flex items-start space-x-3">
          <User className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">{delivery.carrier.name}</p>
            {delivery.carrier.contact && (
              <a
                href={`tel:${delivery.carrier.contact}`}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
              >
                <Phone className="w-3 h-3" />
                <span>{delivery.carrier.contact}</span>
              </a>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="flex items-start space-x-3">
          <Package className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {delivery.totalPallets} palette{delivery.totalPallets > 1 ? 's' : ''}
            </p>
            <p className="text-sm text-gray-600">{delivery.totalWeight} kg</p>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="border-t border-gray-200 pt-4 mb-4">
        <p className="text-sm font-medium text-gray-900 mb-2">Articles</p>
        <div className="space-y-2">
          {delivery.items.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between text-sm bg-gray-50 rounded px-3 py-2"
            >
              <div>
                <p className="font-medium text-gray-900">{item.productName}</p>
                <p className="text-gray-600 text-xs">{item.productCode}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-900">
                  {item.quantity} unités
                </p>
                <p className="text-gray-600 text-xs">
                  {item.pallets} palette{item.pallets > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      {delivery.notes && (
        <div className="border-t border-gray-200 pt-4 mb-4">
          <p className="text-sm text-gray-600 italic">{delivery.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-3">
        <Link
          href={`/slots?deliveryId=${delivery.id}`}
          className="btn-secondary flex-1 text-center"
        >
          Gérer le créneau
        </Link>
        {(delivery.status === 'arriving_soon' || delivery.status === 'confirmed') && (
          <Link
            href={`/receive?deliveryId=${delivery.id}`}
            className="btn-primary flex-1 text-center"
          >
            Commencer la réception
          </Link>
        )}
      </div>
    </div>
  )
}
