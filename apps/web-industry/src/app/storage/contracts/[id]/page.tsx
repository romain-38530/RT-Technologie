'use client'

import { use } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Building2, Activity, Package, TrendingUp, AlertCircle, Download } from 'lucide-react'

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  // Mock WMS data
  const contract = {
    id,
    status: 'ACTIVE',
    siteName: 'Site Marseille Port',
    logisticianName: 'LOG-1',
    wmsConnected: true,
    currentOccupancy: 850,
    totalCapacity: 1000,
    performance: {
      totalInboundMovements: 156,
      totalOutboundMovements: 142,
      incidentsCount: 0
    }
  }

  const inventory = [
    { sku: 'PROD-001', quantity: 500, location: 'A-01-01', lastUpdate: '2025-01-18T14:30:00Z' },
    { sku: 'PROD-002', quantity: 300, location: 'A-01-02', lastUpdate: '2025-01-18T14:30:00Z' },
    { sku: 'PROD-003', quantity: 750, location: 'A-02-01', lastUpdate: '2025-01-18T14:30:00Z' }
  ]

  const movements = [
    { date: '2025-01-18T10:00:00Z', type: 'IN', sku: 'PROD-001', quantity: 100, ref: 'BL-001' },
    { date: '2025-01-17T15:30:00Z', type: 'OUT', sku: 'PROD-002', quantity: 50, ref: 'BL-002' },
    { date: '2025-01-16T09:15:00Z', type: 'IN', sku: 'PROD-003', quantity: 200, ref: 'BL-003' }
  ]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <Link href="/storage/contracts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">{contract.siteName}</h2>
          <p className="text-muted-foreground">Suivi temps réel via WMS</p>
        </div>
        <Badge variant="default" className="bg-green-600">
          {contract.status === 'ACTIVE' ? 'Actif' : contract.status}
        </Badge>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupation</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contract.currentOccupancy} m³</div>
            <Progress value={(contract.currentOccupancy / contract.totalCapacity) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((contract.currentOccupancy / contract.totalCapacity) * 100)}% de {contract.totalCapacity} m³
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrées</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contract.performance.totalInboundMovements}</div>
            <p className="text-xs text-muted-foreground">Ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sorties</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contract.performance.totalOutboundMovements}</div>
            <p className="text-xs text-muted-foreground">Ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidents</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contract.performance.incidentsCount}</div>
            <p className="text-xs text-green-600">Aucun incident</p>
          </CardContent>
        </Card>
      </div>

      {/* WMS Connection Status */}
      {contract.wmsConnected && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                <CardTitle>Connexion WMS Active</CardTitle>
              </div>
              <Badge variant="outline" className="bg-green-100">
                Temps réel
              </Badge>
            </div>
            <CardDescription>
              Les données sont synchronisées automatiquement depuis le système WMS du logisticien
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Inventory */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Inventaire Temps Réel
              </CardTitle>
              <CardDescription>Dernière mise à jour: il y a 5 minutes</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Emplacement</TableHead>
                <TableHead>Dernière MAJ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.sku}>
                  <TableCell className="font-medium">{item.sku}</TableCell>
                  <TableCell>{item.quantity} unités</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.location}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(item.lastUpdate).toLocaleString('fr-FR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Movements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Mouvements Récents
          </CardTitle>
          <CardDescription>Historique des 3 derniers mouvements</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Référence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((movement, idx) => (
                <TableRow key={idx}>
                  <TableCell className="text-sm">
                    {new Date(movement.date).toLocaleString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={movement.type === 'IN' ? 'default' : 'secondary'}>
                      {movement.type === 'IN' ? 'Entrée' : 'Sortie'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{movement.sku}</TableCell>
                  <TableCell>{movement.quantity} unités</TableCell>
                  <TableCell>{movement.ref}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Alertes Intelligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg bg-orange-50 border-orange-200">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium">Fin de contrat approchant</div>
                <div className="text-sm text-muted-foreground">
                  Votre contrat se termine le 22/07/2025 (dans 6 mois). Pensez à renouveler ou à publier un nouveau besoin.
                </div>
              </div>
              <Button variant="outline" size="sm">Renouveler</Button>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Activity className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium">Performance optimale</div>
                <div className="text-sm text-muted-foreground">
                  Aucun incident signalé ce mois-ci. Excellente collaboration.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
