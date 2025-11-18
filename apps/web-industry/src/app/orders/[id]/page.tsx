'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, Package, Truck } from 'lucide-react'
import { getStatusColor, formatDateTime } from '@/lib/utils'
import { useDispatchOrder } from '@/lib/hooks'

// Mock order data
const mockOrder = {
  id: 'ORD-001',
  ref: 'REF-2024-001',
  ownerOrgId: 'IND-1',
  status: 'DISPATCHED',
  ship_from: {
    address: '123 Rue de Paris',
    city: 'Paris',
    postalCode: '75001',
    country: 'FR',
  },
  ship_to: {
    address: '456 Rue de Lyon',
    city: 'Lyon',
    postalCode: '69001',
    country: 'FR',
  },
  pallets: 20,
  weight: 5000,
  assignedCarrierId: 'CAR-001',
  createdAt: '2024-01-15T10:00:00Z',
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  const dispatchMutation = useDispatchOrder()

  const handleDispatch = async () => {
    try {
      await dispatchMutation.mutateAsync({
        orderId,
        traceId: `dispatch-${Date.now()}`,
      })
      alert('Commande dispatchee avec succes!')
      router.refresh()
    } catch (error) {
      console.error('Dispatch error:', error)
      alert('Erreur lors du dispatch')
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <Link href="/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">
            Commande {mockOrder.ref}
          </h2>
          <p className="text-muted-foreground">
            ID: {mockOrder.id}
          </p>
        </div>
        <Badge className={getStatusColor(mockOrder.status)}>
          {mockOrder.status}
        </Badge>
        {mockOrder.status === 'NEW' && (
          <Button onClick={handleDispatch} disabled={dispatchMutation.isPending}>
            <Truck className="mr-2 h-4 w-4" />
            Dispatcher
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Depart
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium">Adresse</p>
              <p className="text-sm text-muted-foreground">
                {mockOrder.ship_from.address}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Ville</p>
              <p className="text-sm text-muted-foreground">
                {mockOrder.ship_from.city}, {mockOrder.ship_from.postalCode}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Pays</p>
              <p className="text-sm text-muted-foreground">
                {mockOrder.ship_from.country}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Arrivee
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium">Adresse</p>
              <p className="text-sm text-muted-foreground">
                {mockOrder.ship_to.address}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Ville</p>
              <p className="text-sm text-muted-foreground">
                {mockOrder.ship_to.city}, {mockOrder.ship_to.postalCode}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Pays</p>
              <p className="text-sm text-muted-foreground">
                {mockOrder.ship_to.country}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Details du chargement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium">Nombre de palettes</p>
              <p className="text-2xl font-bold">{mockOrder.pallets}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Poids total</p>
              <p className="text-2xl font-bold">{mockOrder.weight} kg</p>
            </div>
            <div>
              <p className="text-sm font-medium">Date de creation</p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(mockOrder.createdAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {mockOrder.assignedCarrierId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Transporteur assigne
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-sm font-medium">ID Transporteur</p>
              <p className="text-sm text-muted-foreground">
                {mockOrder.assignedCarrierId}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>Historique de la commande</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Commande creee</p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(mockOrder.createdAt)}
                </p>
              </div>
            </div>
            {mockOrder.status === 'DISPATCHED' && (
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-yellow-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Dispatchee</p>
                  <p className="text-xs text-muted-foreground">
                    En attente d'acceptation
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
