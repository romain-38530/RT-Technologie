'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getExpectedDeliveries } from '@/lib/api/deliveries'
import { createAnomaly } from '@/lib/api/anomalies'
import { PhotoUpload } from './photo-upload'
import { X, AlertTriangle } from 'lucide-react'
import { AnomalyType } from '@/lib/api/types'

interface CreateAnomalyModalProps {
  onClose: () => void
}

const anomalyTypes: { value: AnomalyType; label: string }[] = [
  { value: 'damaged_goods', label: 'Marchandises endommagées' },
  { value: 'missing_items', label: 'Articles manquants' },
  { value: 'wrong_items', label: 'Articles incorrects' },
  { value: 'quantity_mismatch', label: 'Écart de quantité' },
  { value: 'quality_issue', label: 'Problème de qualité' },
  { value: 'packaging_issue', label: 'Problème d\'emballage' },
]

export function CreateAnomalyModal({ onClose }: CreateAnomalyModalProps) {
  const queryClient = useQueryClient()
  const [step, setStep] = useState<'select' | 'details'>('select')

  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>('')
  const [type, setType] = useState<AnomalyType>('damaged_goods')
  const [severity, setSeverity] = useState<'minor' | 'major' | 'critical'>('major')
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<File[]>([])

  const { data: deliveries } = useQuery({
    queryKey: ['deliveries', 'DEST-001'],
    queryFn: () => getExpectedDeliveries('DEST-001'),
  })

  const selectedDelivery = deliveries?.find(d => d.id === selectedDeliveryId)

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDeliveryId || !selectedDelivery) {
        throw new Error('No delivery selected')
      }

      // Create anomaly items from delivery items
      const items = selectedDelivery.items.map(item => ({
        productCode: item.productCode,
        productName: item.productName,
        expectedQuantity: item.quantity,
        receivedQuantity: item.quantity, // This should be adjusted based on actual received
        issue: description,
      }))

      return createAnomaly({
        receptionId: 'REC-TEMP', // This should come from actual reception
        deliveryId: selectedDeliveryId,
        orderId: selectedDelivery.orderId,
        type,
        severity,
        description,
        items,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anomalies'] })
      onClose()
    },
  })

  const handleSubmit = () => {
    if (!description.trim()) {
      alert('Veuillez fournir une description de l\'anomalie')
      return
    }
    createMutation.mutate()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-warning-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Déclarer une anomalie
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {step === 'select'
                  ? 'Sélectionnez la livraison concernée'
                  : 'Détails de l\'anomalie'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'select' ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Sélectionnez la livraison pour laquelle vous souhaitez déclarer une anomalie
              </p>
              {deliveries && deliveries.length > 0 ? (
                deliveries.map(delivery => (
                  <button
                    key={delivery.id}
                    onClick={() => {
                      setSelectedDeliveryId(delivery.id)
                      setStep('details')
                    }}
                    className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {delivery.orderReference}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {delivery.carrier.name} • {delivery.totalPallets} palettes
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          {delivery.items.map(item => (
                            <span key={item.id} className="text-gray-600">
                              {item.productName}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  Aucune livraison disponible
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Selected Delivery Info */}
              {selectedDelivery && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    Livraison: {selectedDelivery.orderReference}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedDelivery.carrier.name}
                  </p>
                </div>
              )}

              {/* Type */}
              <div>
                <label className="label">Type d'anomalie *</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as AnomalyType)}
                  className="input"
                >
                  {anomalyTypes.map(t => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Severity */}
              <div>
                <label className="label">Gravité *</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSeverity('minor')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      severity === 'minor'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium text-gray-900">Mineure</p>
                    <p className="text-xs text-gray-600 mt-1">Impact faible</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeverity('major')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      severity === 'major'
                        ? 'border-warning-600 bg-warning-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium text-gray-900">Majeure</p>
                    <p className="text-xs text-gray-600 mt-1">Impact modéré</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeverity('critical')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      severity === 'critical'
                        ? 'border-danger-600 bg-danger-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium text-gray-900">Critique</p>
                    <p className="text-xs text-gray-600 mt-1">Impact élevé</p>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="label">Description détaillée *</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  className="input"
                  placeholder="Décrivez l'anomalie de manière détaillée..."
                />
              </div>

              {/* Photos */}
              <PhotoUpload
                onPhotosChange={setPhotos}
                maxPhotos={5}
                label="Photos de l'anomalie"
                description="Ajoutez des photos pour documenter l'anomalie"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'details' && (
          <div className="p-6 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setStep('select')}
              className="btn-secondary"
            >
              Retour
            </button>
            <button
              onClick={handleSubmit}
              disabled={createMutation.isPending || !description.trim()}
              className="btn-primary"
            >
              {createMutation.isPending
                ? 'Création en cours...'
                : 'Déclarer l\'anomalie'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
