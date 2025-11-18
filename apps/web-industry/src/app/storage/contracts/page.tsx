'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Building2, Eye, TrendingUp } from 'lucide-react'

const mockContracts = [
  {
    id: 'CONTRACT-1732100001-xyz123',
    siteId: 'SITE-004',
    siteName: 'Site Marseille Port',
    logisticianName: 'LOG-1',
    status: 'ACTIVE',
    startDate: '2025-01-22',
    endDate: '2025-07-22',
    volume: { type: 'm3', quantity: 1000 },
    currentOccupancy: 85,
    monthlyPrice: 12000,
    wmsConnected: true
  },
  {
    id: 'CONTRACT-1732100002-xyz456',
    siteId: 'SITE-003',
    siteName: 'Plateforme Lille Métropole',
    logisticianName: 'LOG-3',
    status: 'PENDING_START',
    startDate: '2025-02-05',
    endDate: '2025-12-31',
    volume: { type: 'palettes', quantity: 100 },
    currentOccupancy: 0,
    monthlyPrice: 1000,
    wmsConnected: false
  }
]

const statusColors = {
  ACTIVE: 'default',
  PENDING_START: 'secondary',
  COMPLETED: 'outline'
} as const

export default function ContractsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mes Contrats de Stockage</h2>
        <p className="text-muted-foreground">
          Suivi opérationnel en temps réel de vos missions actives
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contrats actifs</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">1 démarrage imminent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux occupation moyen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">Optimisation en cours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coût mensuel total</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">13 000 €</div>
            <p className="text-xs text-muted-foreground">Facture février</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des contrats</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contrat</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Occupation</TableHead>
                <TableHead>Prix/mois</TableHead>
                <TableHead>WMS</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">{contract.id.split('-')[0]}-...</TableCell>
                  <TableCell>{contract.siteName}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(contract.startDate).toLocaleDateString('fr-FR')} - {new Date(contract.endDate).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>{contract.volume.quantity} {contract.volume.type}</TableCell>
                  <TableCell>
                    {contract.status === 'ACTIVE' && (
                      <Badge variant={contract.currentOccupancy > 80 ? 'default' : 'secondary'}>
                        {contract.currentOccupancy}%
                      </Badge>
                    )}
                    {contract.status !== 'ACTIVE' && <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell className="font-medium">{contract.monthlyPrice.toLocaleString('fr-FR')} €</TableCell>
                  <TableCell>
                    {contract.wmsConnected ? (
                      <Badge variant="outline" className="bg-green-50">Connecté</Badge>
                    ) : (
                      <Badge variant="outline">Non connecté</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[contract.status as keyof typeof statusColors]}>
                      {contract.status === 'ACTIVE' ? 'Actif' : contract.status === 'PENDING_START' ? 'À venir' : contract.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/storage/contracts/${contract.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
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
