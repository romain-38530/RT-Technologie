'use client'

import { useQuery } from '@tanstack/react-query'
import { Package, Calendar, MapPin, Truck } from 'lucide-react'
import { pickupsApi } from '@/lib/api/pickups'
import { Navigation } from '@/components/layout/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'

export default function PickupsPage() {
  const { data: pickups, isLoading, error } = useQuery({
    queryKey: ['pickups'],
    queryFn: () => pickupsApi.getAll(),
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

  const getStatusVariant = (status: string): 'default' | 'success' | 'warning' | 'danger' => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
      scheduled: 'default',
      confirmed: 'success',
      in_preparation: 'warning',
      ready: 'success',
      picked_up: 'secondary',
      cancelled: 'danger',
    }
    return variants[status] || 'default'
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Enlevements Prevus</h1>
          <p className="text-slate-600">Consultez et gerez vos pickups planifies</p>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
            <p className="mt-4 text-slate-600">Chargement...</p>
          </div>
        )}

        {error && (
          <Card className="border-danger-200 bg-danger-50">
            <CardContent className="pt-6">
              <p className="text-danger-700">Erreur lors du chargement des enlevements</p>
            </CardContent>
          </Card>
        )}

        {pickups && pickups.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Aucun enlevement prevu pour le moment</p>
            </CardContent>
          </Card>
        )}

        {pickups && pickups.length > 0 && (
          <div className="space-y-4">
            {pickups.map((pickup) => (
              <Card key={pickup.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">Commande #{pickup.orderId}</CardTitle>
                        <Badge variant={getStatusVariant(pickup.status)}>
                          {getStatusLabel(pickup.status)}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {pickup.confirmedDate
                              ? `Confirme pour le ${formatDateTime(pickup.confirmedDate)}`
                              : `Prevu le ${formatDateTime(pickup.scheduledDate)}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          <span>{pickup.carrier.name}</span>
                          {pickup.carrier.contact && (
                            <span className="text-slate-500">- {pickup.carrier.contact}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {pickup.origin.name}, {pickup.origin.city}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h4 className="font-semibold text-sm text-slate-900 mb-2">Articles</h4>
                    <div className="space-y-1">
                      {pickup.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-slate-600">
                            {item.description} ({item.sku})
                          </span>
                          <span className="font-medium">
                            {item.quantity} unites
                            {item.pallets && ` - ${item.pallets} palettes`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {pickup.status === 'scheduled' && (
                      <Link href={`/slots?pickupId=${pickup.id}`}>
                        <Button size="sm">Proposer un creneau</Button>
                      </Link>
                    )}
                    {(pickup.status === 'confirmed' || pickup.status === 'in_preparation') && (
                      <Link href={`/preparation?pickupId=${pickup.id}`}>
                        <Button size="sm">Preparer l'enlevement</Button>
                      </Link>
                    )}
                    <Link href={`/pickups/${pickup.id}`}>
                      <Button size="sm" variant="outline">Voir details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
