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
import { Plus, Search, MapPin, Package, Calendar } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Mock data
const mockNeeds = [
  {
    id: 'NEED-1732000001-abc123',
    storageType: 'long_term',
    volume: { type: 'palettes', quantity: 200 },
    location: { region: 'Île-de-France', department: '77' },
    status: 'PUBLISHED',
    publicationType: 'GLOBAL',
    createdAt: '2025-01-15T10:30:00Z',
    deadline: '2025-01-25T23:59:59Z',
    offersCount: 5
  },
  {
    id: 'NEED-1732000002-def456',
    storageType: 'temporary',
    volume: { type: 'm2', quantity: 500 },
    location: { region: 'Auvergne-Rhône-Alpes', department: '69' },
    status: 'PUBLISHED',
    publicationType: 'MIXED',
    createdAt: '2025-01-16T14:20:00Z',
    deadline: '2025-01-18T23:59:59Z',
    offersCount: 3
  },
  {
    id: 'NEED-1732000003-ghi789',
    storageType: 'cross_dock',
    volume: { type: 'palettes', quantity: 100 },
    location: { region: 'Hauts-de-France', department: '59' },
    status: 'PUBLISHED',
    publicationType: 'REFERRED_ONLY',
    createdAt: '2025-01-17T09:15:00Z',
    deadline: '2025-01-22T23:59:59Z',
    offersCount: 4
  },
  {
    id: 'NEED-1732000004-jkl012',
    storageType: 'picking',
    volume: { type: 'm3', quantity: 1000 },
    location: { region: 'Provence-Alpes-Côte d\'Azur', department: '13' },
    status: 'CONTRACTED',
    publicationType: 'GLOBAL',
    createdAt: '2025-01-18T11:45:00Z',
    deadline: '2025-01-20T23:59:59Z',
    offersCount: 6,
    contractId: 'CONTRACT-001'
  }
]

const storageTypeLabels: Record<string, string> = {
  long_term: 'Long terme',
  temporary: 'Temporaire',
  picking: 'Picking',
  cross_dock: 'Cross-dock',
  customs: 'Douane'
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PUBLISHED: { label: 'Publié', variant: 'secondary' },
  CONTRACTED: { label: 'Contracté', variant: 'default' },
  EXPIRED: { label: 'Expiré', variant: 'outline' },
  CANCELLED: { label: 'Annulé', variant: 'destructive' }
}

export default function StorageNeedsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const filteredNeeds = mockNeeds.filter((need) => {
    const matchesSearch = need.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      need.location.region.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || need.status === statusFilter
    const matchesType = typeFilter === 'all' || need.storageType === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mes Besoins de Stockage</h2>
          <p className="text-muted-foreground">
            Gérez vos publications et consultez les offres reçues
          </p>
        </div>
        <Link href="/storage/needs/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Publier un besoin
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Liste des besoins</CardTitle>
              <CardDescription>{filteredNeeds.length} besoins trouvés</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="PUBLISHED">Publié</SelectItem>
                  <SelectItem value="CONTRACTED">Contracté</SelectItem>
                  <SelectItem value="EXPIRED">Expiré</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="long_term">Long terme</SelectItem>
                  <SelectItem value="temporary">Temporaire</SelectItem>
                  <SelectItem value="picking">Picking</SelectItem>
                  <SelectItem value="cross_dock">Cross-dock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Publication</TableHead>
                <TableHead>Offres</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNeeds.map((need) => (
                <TableRow key={need.id}>
                  <TableCell className="font-medium">{need.id.split('-')[0]}-...</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {storageTypeLabels[need.storageType]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      {need.volume.quantity} {need.volume.type}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {need.location.region} ({need.location.department})
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(need.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    {need.status === 'PUBLISHED' && (
                      <Badge variant="secondary" className="bg-blue-50">
                        {need.offersCount} offres
                      </Badge>
                    )}
                    {need.status === 'CONTRACTED' && (
                      <Badge variant="default">Contracté</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusLabels[need.status].variant}>
                      {statusLabels[need.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/storage/needs/${need.id}`}>
                        <Button variant="ghost" size="sm">
                          Voir
                        </Button>
                      </Link>
                      {need.offersCount > 0 && need.status === 'PUBLISHED' && (
                        <Link href={`/storage/needs/${need.id}/offers`}>
                          <Button size="sm">
                            Comparer offres
                          </Button>
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredNeeds.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucun besoin trouvé</p>
              <Link href="/storage/needs/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer votre premier besoin
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
