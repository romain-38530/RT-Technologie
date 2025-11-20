'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Package, FileText, TrendingUp, AlertCircle, Plus, Building2 } from 'lucide-react'
// TEMPORAIRE: Désactivé pour déploiement Vercel (dépendance workspace non disponible)
// import { TrainingButton } from '@rt/design-system'

export default function StorageDashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      /* <TrainingButton toolName="Bourse de Stockage" /> */
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bourse de Stockage</h2>
          <p className="text-muted-foreground">
            Gérez vos besoins de stockage et suivez vos contrats actifs
          </p>
        </div>
        <Link href="/storage/needs/new">
          <Button size="lg">
            <Plus className="mr-2 h-4 w-4" /> */
            Publier un besoin
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Besoins actifs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" /> */
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              2 en attente d'offres
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contrats actifs</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" /> */
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Taux occupation: 78%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offres reçues</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" /> */
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Moyenne 4 par besoin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" /> */
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Fin de contrat proche
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Needs */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Besoins récents</CardTitle>
            <CardDescription>
              Vos dernières publications sur la bourse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: 'NEED-001',
                  type: 'Long terme',
                  volume: '200 palettes',
                  location: 'Île-de-France',
                  status: 'PUBLISHED',
                  offers: 5
                },
                {
                  id: 'NEED-002',
                  type: 'Temporaire',
                  volume: '500 m²',
                  location: 'Rhône-Alpes',
                  status: 'PUBLISHED',
                  offers: 3
                },
                {
                  id: 'NEED-003',
                  type: 'Cross-dock',
                  volume: '100 palettes',
                  location: 'Hauts-de-France',
                  status: 'CONTRACTED',
                  offers: 4
                }
              ].map((need) => (
                <div key={need.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{need.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {need.type} • {need.volume} • {need.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {need.status === 'PUBLISHED' && (
                      <Badge variant="outline" className="bg-blue-50">
                        {need.offers} offres
                      </Badge>
                    )}
                    <Badge variant={need.status === 'CONTRACTED' ? 'default' : 'secondary'}>
                      {need.status === 'PUBLISHED' ? 'Publié' : 'Contracté'}
                    </Badge>
                    <Link href={`/storage/needs/${need.id}`}>
                      <Button variant="ghost" size="sm">Voir</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Contracts */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Contrats actifs</CardTitle>
            <CardDescription>
              Suivi de vos missions en cours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: 'CONTRACT-001',
                  site: 'Entrepôt Marseille Port',
                  volume: '1000 m³',
                  occupancy: 85,
                  endDate: '22/07/2025'
                },
                {
                  id: 'CONTRACT-002',
                  site: 'Hub Lyon Est',
                  volume: '300 m²',
                  occupancy: 70,
                  endDate: '15/03/2025'
                }
              ].map((contract) => (
                <div key={contract.id} className="space-y-2 border-b pb-4 last:border-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{contract.site}</p>
                    <Badge variant="outline">{contract.occupancy}%</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {contract.volume} • Fin: {contract.endDate}
                  </p>
                  <Link href={`/storage/contracts/${contract.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Voir détails
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/storage/needs">
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> */
                Mes besoins
              </CardTitle>
              <CardDescription>
                Gérer mes publications et offres reçues
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/storage/contracts">
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" /> */
                Mes contrats
              </CardTitle>
              <CardDescription>
                Suivi opérationnel temps réel
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/storage/analytics">
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> */
                Analytics
              </CardTitle>
              <CardDescription>
                Statistiques et rapports
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}
