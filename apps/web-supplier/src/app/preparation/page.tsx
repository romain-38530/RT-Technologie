'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { ClipboardCheck, Upload, FileText, Image, CheckCircle2 } from 'lucide-react'
import { pickupsApi } from '@/lib/api/pickups'
import { Navigation } from '@/components/layout/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { ChecklistItem, Document } from '@/types'

export default function PreparationPage() {
  const searchParams = useSearchParams()
  const pickupId = searchParams.get('pickupId')
  const queryClient = useQueryClient()

  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: '1', label: 'Verifier les quantites commandees', completed: false },
    { id: '2', label: 'Preparer les palettes', completed: false },
    { id: '3', label: 'Emballer et proteger la marchandise', completed: false },
    { id: '4', label: 'Etiqueter les colis', completed: false },
    { id: '5', label: 'Preparer le bon de livraison (BL)', completed: false },
    { id: '6', label: 'Preparer la packing list', completed: false },
    { id: '7', label: 'Prendre des photos des palettes', completed: false },
  ])

  const { data: pickups } = useQuery({
    queryKey: ['pickups'],
    queryFn: () => pickupsApi.getAll(),
  })

  const selectedPickup = pickups?.find(p => p.id === pickupId) ||
    pickups?.find(p => p.status === 'confirmed' || p.status === 'in_preparation')

  const { data: documents } = useQuery({
    queryKey: ['pickup-documents', selectedPickup?.id],
    queryFn: () => pickupsApi.getDocuments(selectedPickup!.id),
    enabled: !!selectedPickup,
  })

  const uploadMutation = useMutation({
    mutationFn: ({ file, type }: { file: File; type: Document['type'] }) =>
      pickupsApi.uploadDocument(selectedPickup!.id, file, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickup-documents', selectedPickup?.id] })
    },
  })

  const markAsReadyMutation = useMutation({
    mutationFn: () => pickupsApi.markAsReady(selectedPickup!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickups'] })
    },
  })

  const handleFileUpload = (type: Document['type']) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadMutation.mutate({ file, type })
    }
  }

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, completed: !item.completed, completedAt: !item.completed ? new Date().toISOString() : undefined }
          : item
      )
    )
  }

  const allChecklistCompleted = checklist.every(item => item.completed)
  const hasRequiredDocuments = documents?.some(d => d.type === 'bl') &&
    documents?.some(d => d.type === 'packing_list')

  const canMarkAsReady = allChecklistCompleted && hasRequiredDocuments

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Preparation de l&apos;Enlevement</h1>
          <p className="text-slate-600">Preparez et validez votre marchandise avant le pickup</p>
        </div>

        {!selectedPickup ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <ClipboardCheck className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Aucun enlevement a preparer</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Pickup Info */}
            <Card>
              <CardHeader>
                <CardTitle>Commande #{selectedPickup.orderId}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Transporteur:</span>
                    <span className="ml-2 font-medium">{selectedPickup.carrier.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Articles:</span>
                    <span className="ml-2 font-medium">{selectedPickup.items.length} article(s)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Checklist */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Checklist de Preparation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {checklist.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleChecklistItem(item.id)}
                        className="h-5 w-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                      />
                      <span className={item.completed ? 'line-through text-slate-500' : 'text-slate-700'}>
                        {item.label}
                      </span>
                      {item.completed && (
                        <CheckCircle2 className="h-4 w-4 text-success-600 ml-auto" />
                      )}
                    </label>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                  <p className="text-sm text-primary-700">
                    {checklist.filter(i => i.completed).length} / {checklist.length} taches completees
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Documents Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Documents a Telecharger
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                    <FileText className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                    <p className="font-medium text-slate-700 mb-2">Bon de Livraison (BL)</p>
                    <label className="cursor-pointer">
                      <span className="text-sm text-primary-600 hover:text-primary-700">
                        {documents?.find(d => d.type === 'bl') ? 'Remplacer' : 'Telecharger'}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.png"
                        onChange={handleFileUpload('bl')}
                      />
                    </label>
                  </div>

                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                    <FileText className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                    <p className="font-medium text-slate-700 mb-2">Packing List</p>
                    <label className="cursor-pointer">
                      <span className="text-sm text-primary-600 hover:text-primary-700">
                        {documents?.find(d => d.type === 'packing_list') ? 'Remplacer' : 'Telecharger'}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.png"
                        onChange={handleFileUpload('packing_list')}
                      />
                    </label>
                  </div>

                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                    <Image className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                    <p className="font-medium text-slate-700 mb-2">Photos Palettes</p>
                    <label className="cursor-pointer">
                      <span className="text-sm text-primary-600 hover:text-primary-700">
                        Ajouter photo
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileUpload('photo')}
                      />
                    </label>
                  </div>

                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                    <FileText className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                    <p className="font-medium text-slate-700 mb-2">CMR (optionnel)</p>
                    <label className="cursor-pointer">
                      <span className="text-sm text-primary-600 hover:text-primary-700">
                        {documents?.find(d => d.type === 'cmr') ? 'Remplacer' : 'Telecharger'}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.png"
                        onChange={handleFileUpload('cmr')}
                      />
                    </label>
                  </div>
                </div>

                {uploadMutation.isPending && (
                  <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                    <p className="text-sm text-primary-700">Upload en cours...</p>
                  </div>
                )}

                {documents && documents.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-sm text-slate-900 mb-3">Documents telecharges</h4>
                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-slate-500" />
                            <span className="text-sm">{doc.name}</span>
                          </div>
                          <span className="text-xs text-slate-500">{doc.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mark as Ready */}
            <Card className={canMarkAsReady ? 'border-success-200 bg-success-50' : ''}>
              <CardContent className="pt-6">
                {canMarkAsReady ? (
                  <div className="text-center">
                    <CheckCircle2 className="h-12 w-12 text-success-600 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-success-900 mb-2">
                      Preparation Terminee !
                    </p>
                    <p className="text-sm text-success-700 mb-4">
                      Vous pouvez maintenant marquer cet enlevement comme pret
                    </p>
                    <Button
                      size="lg"
                      onClick={() => markAsReadyMutation.mutate()}
                      disabled={markAsReadyMutation.isPending}
                      className="bg-success-600 hover:bg-success-700"
                    >
                      {markAsReadyMutation.isPending ? 'Confirmation...' : 'Marquer comme Pret'}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-slate-600 mb-2">
                      Pour marquer l&apos;enlevement comme pret:
                    </p>
                    <ul className="text-sm text-slate-500 space-y-1">
                      {!allChecklistCompleted && (
                        <li>Completez toutes les taches de la checklist</li>
                      )}
                      {!documents?.some(d => d.type === 'bl') && (
                        <li>Telechargez le bon de livraison</li>
                      )}
                      {!documents?.some(d => d.type === 'packing_list') && (
                        <li>Telechargez la packing list</li>
                      )}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
