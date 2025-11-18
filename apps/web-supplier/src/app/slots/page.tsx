'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { Calendar, Clock, Plus, Check, X } from 'lucide-react'
import { pickupsApi } from '@/lib/api/pickups'
import { Navigation } from '@/components/layout/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, formatTime } from '@/lib/utils'
import type { TimeSlot } from '@/types'

export default function SlotsPage() {
  const searchParams = useSearchParams()
  const pickupId = searchParams.get('pickupId')
  const queryClient = useQueryClient()

  const [showAddSlot, setShowAddSlot] = useState(false)
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
  })

  const { data: pickups } = useQuery({
    queryKey: ['pickups'],
    queryFn: () => pickupsApi.getAll('scheduled'),
  })

  const selectedPickup = pickups?.find(p => p.id === pickupId) || pickups?.[0]

  const { data: slots, isLoading } = useQuery({
    queryKey: ['slots', selectedPickup?.id],
    queryFn: () => pickupsApi.getSlots(selectedPickup!.id),
    enabled: !!selectedPickup,
  })

  const proposeSlotMutation = useMutation({
    mutationFn: (slot: typeof newSlot) =>
      pickupsApi.proposeSlot(selectedPickup!.id, {
        pickupId: selectedPickup!.id,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        proposedBy: 'supplier',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots', selectedPickup?.id] })
      setShowAddSlot(false)
      setNewSlot({ date: '', startTime: '', endTime: '' })
    },
  })

  const confirmSlotMutation = useMutation({
    mutationFn: (slotId: string) =>
      pickupsApi.confirmSlot(selectedPickup!.id, slotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots', selectedPickup?.id] })
      queryClient.invalidateQueries({ queryKey: ['pickups'] })
    },
  })

  const handleProposeSlot = () => {
    if (newSlot.date && newSlot.startTime && newSlot.endTime) {
      proposeSlotMutation.mutate(newSlot)
    }
  }

  const getStatusLabel = (status: TimeSlot['status']) => {
    const labels: Record<TimeSlot['status'], string> = {
      proposed: 'Propose',
      confirmed: 'Confirme',
      rejected: 'Refuse',
    }
    return labels[status]
  }

  const getStatusVariant = (status: TimeSlot['status']): 'default' | 'success' | 'danger' => {
    const variants: Record<TimeSlot['status'], 'default' | 'success' | 'danger'> = {
      proposed: 'default',
      confirmed: 'success',
      rejected: 'danger',
    }
    return variants[status]
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Creneaux de Pickup</h1>
          <p className="text-slate-600">Proposez et confirmez vos disponibilites</p>
        </div>

        {!selectedPickup ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Aucun enlevement en attente de creneau</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Pickup Info */}
            <Card>
              <CardHeader>
                <CardTitle>Enlevement Selectionne</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Commande</span>
                    <span className="font-medium">#{selectedPickup.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Transporteur</span>
                    <span className="font-medium">{selectedPickup.carrier.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Articles</span>
                    <span className="font-medium">{selectedPickup.items.length} article(s)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Slot Form */}
            {showAddSlot && (
              <Card className="border-primary-200">
                <CardHeader>
                  <CardTitle className="text-lg">Proposer un Creneau</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={newSlot.date}
                        onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Heure de debut
                        </label>
                        <input
                          type="time"
                          value={newSlot.startTime}
                          onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Heure de fin
                        </label>
                        <input
                          type="time"
                          value={newSlot.endTime}
                          onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleProposeSlot}
                        disabled={!newSlot.date || !newSlot.startTime || !newSlot.endTime || proposeSlotMutation.isPending}
                      >
                        {proposeSlotMutation.isPending ? 'Envoi...' : 'Proposer'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddSlot(false)
                          setNewSlot({ date: '', startTime: '', endTime: '' })
                        }}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add Slot Button */}
            {!showAddSlot && (
              <Button
                onClick={() => setShowAddSlot(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Proposer un nouveau creneau
              </Button>
            )}

            {/* Slots List */}
            <Card>
              <CardHeader>
                <CardTitle>Creneaux Proposes</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
                  </div>
                ) : slots && slots.length > 0 ? (
                  <div className="space-y-3">
                    {slots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant={getStatusVariant(slot.status)}>
                              {getStatusLabel(slot.status)}
                            </Badge>
                            {slot.proposedBy === 'carrier' && (
                              <Badge variant="secondary">Propose par transporteur</Badge>
                            )}
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-slate-700">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(slot.date)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-700">
                              <Clock className="h-4 w-4" />
                              <span>
                                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {slot.status === 'proposed' && slot.proposedBy === 'carrier' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => confirmSlotMutation.mutate(slot.id)}
                              disabled={confirmSlotMutation.isPending}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Accepter
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Refuser
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-8">
                    Aucun creneau propose pour le moment
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
