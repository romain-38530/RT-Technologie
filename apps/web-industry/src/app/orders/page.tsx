'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Plus, Search, Filter } from 'lucide-react'
import { getStatusColor } from '@/lib/utils'
import type { Order } from '@/types'

// Mock data - in real app would come from API
const mockOrders: Order[] = [
  {
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
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'ORD-002',
    ref: 'REF-2024-002',
    ownerOrgId: 'IND-1',
    status: 'ACCEPTED',
    ship_from: {
      address: '789 Rue de Marseille',
      city: 'Marseille',
      postalCode: '13001',
      country: 'FR',
    },
    ship_to: {
      address: '321 Rue de Toulouse',
      city: 'Toulouse',
      postalCode: '31000',
      country: 'FR',
    },
    pallets: 15,
    weight: 3500,
    assignedCarrierId: 'CAR-001',
    createdAt: '2024-01-16T14:30:00Z',
  },
]

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredOrders = mockOrders.filter(
    (order) =>
      order.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Commandes</h2>
          <p className="text-muted-foreground">
            Gerez vos commandes et leur statut
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/orders/import">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Importer
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liste des commandes</CardTitle>
              <CardDescription>
                {filteredOrders.length} commande(s)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>De</TableHead>
                <TableHead>Vers</TableHead>
                <TableHead>Palettes</TableHead>
                <TableHead>Poids (kg)</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.ref}</TableCell>
                  <TableCell>{order.ship_from.city}</TableCell>
                  <TableCell>{order.ship_to.city}</TableCell>
                  <TableCell>{order.pallets}</TableCell>
                  <TableCell>{order.weight}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="ghost" size="sm">
                        Voir details
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
