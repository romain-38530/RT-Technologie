'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import { getExpectedDeliveries } from '@/lib/api/deliveries'
import { createReception, completeReception, signCMR } from '@/lib/api/receptions'
import { SignatureCanvas } from '@/components/signature-canvas'
import { PhotoUpload } from '@/components/photo-upload'
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Check,
  Camera,
  FileSignature,
} from 'lucide-react'
import clsx from 'clsx'
import { ReceptionItem } from '@/lib/api/types'

export default function ReceivePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const deliveryIdFromParams = searchParams.get('deliveryId')

  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(
    deliveryIdFromParams
  )
  const [receptionItems, setReceptionItems] = useState<ReceptionItem[]>([])
  const [receptionId, setReceptionId] = useState<string | null>(null)
  const [step, setStep] = useState<'select' | 'control' | 'photos' | 'signature'>('select')
  const [showSignatureCanvas, setShowSignatureCanvas] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])
  const [notes, setNotes] = useState('')
  const [signerName, setSignerName] = useState('')

  // Get deliveries
  const { data: deliveries } = useQuery({
    queryKey: ['deliveries', 'DEST-001'],
    queryFn: () => getExpectedDeliveries('DEST-001'),
  })

  const selectedDelivery = deliveries?.find(d => d.id === selectedDeliveryId)

  // Initialize reception items
  const initializeReceptionItems = () => {
    if (!selectedDelivery) return

    const items: ReceptionItem[] = selectedDelivery.items.map(item => ({
      deliveryItemId: item.id,
      productCode: item.productCode,
      productName: item.productName,
      expectedQuantity: item.quantity,
      expectedPallets: item.pallets,
      receivedQuantity: item.quantity,
      receivedPallets: item.pallets,
      condition: 'good',
      notes: '',
    }))

    setReceptionItems(items)
    setStep('control')
  }

  // Update reception item
  const updateReceptionItem = (
    itemId: string,
    updates: Partial<ReceptionItem>
  ) => {
    setReceptionItems(prev =>
      prev.map(item =>
        item.deliveryItemId === itemId ? { ...item, ...updates } : item
      )
    )
  }

  // Create reception mutation
  const createReceptionMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDeliveryId) throw new Error('No delivery selected')
      const reception = await createReception(selectedDeliveryId, receptionItems)
      setReceptionId(reception.id)
      return reception
    },
    onSuccess: () => {
      setStep('photos')
    },
  })

  // Complete reception mutation
  const completeReceptionMutation = useMutation({
    mutationFn: async () => {
      if (!receptionId) throw new Error('No reception created')
      return completeReception(receptionId, receptionItems, notes)
    },
    onSuccess: () => {
      setStep('signature')
    },
  })

  // Sign CMR mutation
  const signCMRMutation = useMutation({
    mutationFn: async (signatureData: string) => {
      if (!receptionId || !selectedDeliveryId) {
        throw new Error('Missing reception or delivery ID')
      }
      return signCMR({
        receptionId,
        deliveryId: selectedDeliveryId,
        signatureData,
        signedBy: signerName,
      })
    },
    onSuccess: () => {
      router.push('/deliveries')
    },
  })

  const handleStartReception = () => {
    initializeReceptionItems()
    createReceptionMutation.mutate()
  }

  const handleCompleteControl = () => {
    completeReceptionMutation.mutate()
  }

  const handleContinueToSignature = () => {
    setStep('signature')
  }

  const handleSaveSignature = (signatureData: string) => {
    signCMRMutation.mutate(signatureData)
  }

  const hasAnomalies = receptionItems.some(
    item => item.condition !== 'good' || item.receivedQuantity !== item.expectedQuantity
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Réception de Livraison</h1>
        <p className="text-gray-600 mt-1">
          Contrôlez et validez la réception de vos marchandises
        </p>
      </div>

      {/* Progress Steps */}
      <div className="card">
        <div className="flex items-center justify-between">
          {[
            { key: 'select', label: 'Sélection', icon: Package },
            { key: 'control', label: 'Contrôle', icon: CheckCircle2 },
            { key: 'photos', label: 'Photos', icon: Camera },
            { key: 'signature', label: 'Signature', icon: FileSignature },
          ].map((s, index, arr) => {
            const StepIcon = s.icon
            const isActive = step === s.key
            const isCompleted =
              arr.findIndex(x => x.key === step) > arr.findIndex(x => x.key === s.key)

            return (
              <div key={s.key} className="flex items-center flex-1">
                <div className="flex items-center space-x-3">
                  <div
                    className={clsx(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      isCompleted
                        ? 'bg-success-600 text-white'
                        : isActive
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={clsx(
                      'font-medium',
                      isActive ? 'text-gray-900' : 'text-gray-500'
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {index < arr.length - 1 && (
                  <div
                    className={clsx(
                      'flex-1 h-0.5 mx-4',
                      isCompleted ? 'bg-success-600' : 'bg-gray-200'
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step: Select Delivery */}
      {step === 'select' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Sélectionner une livraison à réceptionner
          </h2>
          <div className="space-y-3">
            {deliveries?.filter(d => d.status === 'arriving_soon' || d.status === 'confirmed')
              .map(delivery => (
                <button
                  key={delivery.id}
                  onClick={() => setSelectedDeliveryId(delivery.id)}
                  className={clsx(
                    'w-full text-left p-4 rounded-lg border-2 transition-colors',
                    selectedDeliveryId === delivery.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
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
                    <span
                      className={clsx(
                        'badge',
                        delivery.status === 'arriving_soon'
                          ? 'badge-danger'
                          : 'badge-success'
                      )}
                    >
                      {delivery.status === 'arriving_soon'
                        ? 'Arrivée imminente'
                        : 'Confirmée'}
                    </span>
                  </div>
                </button>
              ))}
          </div>

          {selectedDeliveryId && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleStartReception}
                disabled={createReceptionMutation.isPending}
                className="btn-primary"
              >
                {createReceptionMutation.isPending
                  ? 'Démarrage...'
                  : 'Commencer la réception'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step: Control */}
      {step === 'control' && selectedDelivery && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Contrôle de réception - {selectedDelivery.orderReference}
            </h2>

            <div className="space-y-4">
              {receptionItems.map(item => (
                <div key={item.deliveryItemId} className="p-4 border-2 border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                      <p className="text-sm text-gray-600">{item.productCode}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Quantity */}
                    <div>
                      <label className="label">Quantité reçue</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={item.receivedQuantity}
                          onChange={e =>
                            updateReceptionItem(item.deliveryItemId, {
                              receivedQuantity: parseInt(e.target.value) || 0,
                            })
                          }
                          className="input"
                        />
                        <span className="text-sm text-gray-600">
                          / {item.expectedQuantity}
                        </span>
                      </div>
                    </div>

                    {/* Pallets */}
                    <div>
                      <label className="label">Palettes reçues</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={item.receivedPallets}
                          onChange={e =>
                            updateReceptionItem(item.deliveryItemId, {
                              receivedPallets: parseInt(e.target.value) || 0,
                            })
                          }
                          className="input"
                        />
                        <span className="text-sm text-gray-600">
                          / {item.expectedPallets}
                        </span>
                      </div>
                    </div>

                    {/* Condition */}
                    <div>
                      <label className="label">État</label>
                      <select
                        value={item.condition}
                        onChange={e =>
                          updateReceptionItem(item.deliveryItemId, {
                            condition: e.target.value as 'good' | 'damaged' | 'missing',
                          })
                        }
                        className="input"
                      >
                        <option value="good">Bon</option>
                        <option value="damaged">Endommagé</option>
                        <option value="missing">Manquant</option>
                      </select>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center space-x-2">
                    {item.condition === 'good' &&
                    item.receivedQuantity === item.expectedQuantity ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-success-600" />
                        <span className="text-sm text-success-700 font-medium">
                          Conforme
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5 text-warning-600" />
                        <span className="text-sm text-warning-700 font-medium">
                          Anomalie détectée
                        </span>
                      </>
                    )}
                  </div>

                  {/* Notes */}
                  {(item.condition !== 'good' ||
                    item.receivedQuantity !== item.expectedQuantity) && (
                    <div className="mt-4">
                      <label className="label">Notes (obligatoire pour anomalies)</label>
                      <textarea
                        value={item.notes}
                        onChange={e =>
                          updateReceptionItem(item.deliveryItemId, {
                            notes: e.target.value,
                          })
                        }
                        rows={2}
                        className="input"
                        placeholder="Décrivez l'anomalie..."
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* General Notes */}
            <div className="mt-6">
              <label className="label">Notes générales (optionnel)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className="input"
                placeholder="Commentaires généraux sur la réception..."
              />
            </div>

            {/* Alert if anomalies */}
            {hasAnomalies && (
              <div className="mt-6 p-4 bg-warning-50 border border-warning-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-warning-900">Anomalies détectées</p>
                    <p className="text-sm text-warning-700 mt-1">
                      Des photos seront demandées à l'étape suivante pour documenter les
                      anomalies.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCompleteControl}
                disabled={completeReceptionMutation.isPending}
                className="btn-primary"
              >
                {completeReceptionMutation.isPending
                  ? 'Validation...'
                  : 'Valider le contrôle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step: Photos */}
      {step === 'photos' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Documentation photographique
          </h2>

          {hasAnomalies ? (
            <div className="mb-4 p-4 bg-warning-50 border border-warning-200 rounded-lg">
              <p className="text-sm text-warning-700">
                Des anomalies ont été détectées. Veuillez prendre des photos pour les
                documenter.
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600 mb-4">
              Vous pouvez ajouter des photos de la livraison (optionnel).
            </p>
          )}

          <PhotoUpload
            onPhotosChange={setPhotos}
            maxPhotos={5}
            label="Photos de la réception"
            description={
              hasAnomalies
                ? 'Documentez les anomalies constatées'
                : 'Photos de la livraison pour archivage'
            }
          />

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={handleContinueToSignature}
              className="btn-primary"
            >
              Continuer vers la signature
            </button>
          </div>
        </div>
      )}

      {/* Step: Signature */}
      {step === 'signature' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Signature du CMR
          </h2>

          <p className="text-sm text-gray-600 mb-6">
            La signature du CMR confirme la réception de la marchandise. Veuillez vérifier
            toutes les informations avant de signer.
          </p>

          {/* Summary */}
          <div className="p-4 bg-gray-50 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Résumé de la réception</h3>
            <div className="space-y-2">
              {receptionItems.map(item => (
                <div key={item.deliveryItemId} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{item.productName}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-900">
                      {item.receivedQuantity} / {item.expectedQuantity}
                    </span>
                    {item.condition === 'good' &&
                    item.receivedQuantity === item.expectedQuantity ? (
                      <CheckCircle2 className="w-4 h-4 text-success-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-warning-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="label">Nom du signataire</label>
            <input
              type="text"
              value={signerName}
              onChange={e => setSignerName(e.target.value)}
              className="input"
              placeholder="Votre nom complet"
            />
          </div>

          <button
            onClick={() => setShowSignatureCanvas(true)}
            disabled={!signerName.trim() || signCMRMutation.isPending}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            <FileSignature className="w-5 h-5" />
            <span>Signer le CMR</span>
          </button>

          {showSignatureCanvas && (
            <SignatureCanvas
              signerName={signerName}
              onSave={handleSaveSignature}
              onCancel={() => setShowSignatureCanvas(false)}
            />
          )}
        </div>
      )}
    </div>
  )
}
