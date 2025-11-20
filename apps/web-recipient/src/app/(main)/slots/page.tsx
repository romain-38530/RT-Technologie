'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { getAvailableSlots, proposeSlot, confirmSlot } from '@/lib/api/slots'
import { getExpectedDeliveries } from '@/lib/api/deliveries'
import { Calendar, Clock, Check, AlertCircle } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import clsx from 'clsx'

export default function SlotsPage() {
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const deliveryIdFromParams = searchParams.get('deliveryId')

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(
    deliveryIdFromParams
  )
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)

  // Get deliveries
  const { data: deliveries } = useQuery({
    queryKey: ['deliveries', 'DEST-001'],
    queryFn: () => getExpectedDeliveries('DEST-001'),
  })

  // Get available slots
  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ['slots', 'DEST-001', selectedDate],
    queryFn: () => getAvailableSlots('DEST-001', selectedDate),
  })

  // Propose slot mutation
  const proposeMutation = useMutation({
    mutationFn: (slotId: string) => {
      if (!selectedDeliveryId) throw new Error('No delivery selected')
      const slot = slots?.find(s => s.id === slotId)
      if (!slot) throw new Error('Slot not found')

      return proposeSlot(selectedDeliveryId, {
        date: selectedDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
        recipientId: 'DEST-001',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] })
      queryClient.invalidateQueries({ queryKey: ['deliveries'] })
    },
  })

  // Confirm slot mutation
  const confirmMutation = useMutation({
    mutationFn: (slotId: string) => confirmSlot(slotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] })
      queryClient.invalidateQueries({ queryKey: ['deliveries'] })
    },
  })

  const handleProposeSlot = async () => {
    if (!selectedSlotId || !selectedDeliveryId) return
    await proposeMutation.mutateAsync(selectedSlotId)
    setSelectedSlotId(null)
  }

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i)
    return {
      value: date.toISOString().split('T')[0],
      label: format(date, 'EEE dd MMM', { locale: fr }),
      isToday: i === 0,
    }
  })

  const selectedDelivery = deliveries?.find(d => d.id === selectedDeliveryId)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Créneaux</h1>
        <p className="text-gray-600 mt-1">
          Proposez et confirmez vos créneaux de réception
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Delivery Selection & Calendar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Delivery Selection */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Sélectionner une livraison
            </h2>
            <div className="space-y-2">
              {deliveries && deliveries.length > 0 ? (
                deliveries.map(delivery => (
                  <button
                    key={delivery.id}
                    onClick={() => setSelectedDeliveryId(delivery.id)}
                    className={clsx(
                      'w-full text-left p-3 rounded-lg border-2 transition-colors',
                      selectedDeliveryId === delivery.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <p className="font-medium text-gray-900">
                      {delivery.orderReference}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {delivery.carrier.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {delivery.totalPallets} palettes
                    </p>
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Aucune livraison disponible
                </p>
              )}
            </div>
          </div>

          {/* Date Selection */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Sélectionner une date</span>
            </h2>
            <div className="space-y-2">
              {dates.map(date => (
                <button
                  key={date.value}
                  onClick={() => setSelectedDate(date.value)}
                  className={clsx(
                    'w-full text-left p-3 rounded-lg border-2 transition-colors',
                    selectedDate === date.value
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <p className="font-medium text-gray-900 capitalize">
                    {date.label}
                  </p>
                  {date.isToday && (
                    <span className="badge-info text-xs mt-1">Aujourd'hui</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Slots */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Créneaux disponibles</span>
            </h2>

            {!selectedDeliveryId ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">
                  Veuillez sélectionner une livraison
                </p>
              </div>
            ) : slotsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
              </div>
            ) : slots && slots.length > 0 ? (
              <div className="space-y-3">
                {slots.map(slot => {
                  const isOccupied = slot.status === 'occupied'
                  const isProposed = slot.status === 'proposed'
                  const isConfirmed = slot.status === 'confirmed'
                  const isSelected = selectedSlotId === slot.id

                  return (
                    <button
                      key={slot.id}
                      onClick={() => !isOccupied && setSelectedSlotId(slot.id)}
                      disabled={isOccupied}
                      className={clsx(
                        'w-full p-4 rounded-lg border-2 transition-all text-left',
                        isOccupied &&
                          'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60',
                        !isOccupied && !isSelected && 'border-gray-200 hover:border-primary-300',
                        isSelected && 'border-primary-600 bg-primary-50',
                        isProposed && 'border-warning-300 bg-warning-50',
                        isConfirmed && 'border-success-300 bg-success-50'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Clock className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="font-semibold text-gray-900">
                              {slot.startTime} - {slot.endTime}
                            </p>
                            {slot.notes && (
                              <p className="text-sm text-gray-600 mt-1">{slot.notes}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          {isOccupied && (
                            <span className="badge bg-gray-200 text-gray-700">Occupé</span>
                          )}
                          {isProposed && (
                            <span className="badge-warning">Proposé</span>
                          )}
                          {isConfirmed && (
                            <span className="badge-success">Confirmé</span>
                          )}
                          {!isOccupied && !isProposed && !isConfirmed && (
                            <span className="badge-info">Disponible</span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">Aucun créneau disponible</p>
              </div>
            )}

            {/* Selected Delivery Info */}
            {selectedDelivery && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Livraison sélectionnée
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Commande</p>
                    <p className="font-medium text-gray-900">
                      {selectedDelivery.orderReference}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Transporteur</p>
                    <p className="font-medium text-gray-900">
                      {selectedDelivery.carrier.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Palettes</p>
                    <p className="font-medium text-gray-900">
                      {selectedDelivery.totalPallets}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Poids</p>
                    <p className="font-medium text-gray-900">
                      {selectedDelivery.totalWeight} kg
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            {selectedSlotId && selectedDeliveryId && (
              <div className="mt-6 flex items-center justify-end">
                <button
                  onClick={handleProposeSlot}
                  disabled={proposeMutation.isPending}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {proposeMutation.isPending
                      ? 'Proposition en cours...'
                      : 'Proposer ce créneau'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
