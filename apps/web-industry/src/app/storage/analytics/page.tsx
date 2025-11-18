'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react'

export default function StorageAnalyticsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics & Statistiques</h2>
        <p className="text-muted-foreground">
          Vue d'ensemble de vos opérations de stockage
        </p>
      </div>

      {/* Global KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coût total mensuel</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">13 000 €</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-green-600" />
              <span className="text-green-600">-8%</span> vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume total stocké</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1 850 m³</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-blue-600" />
              <span className="text-blue-600">+12%</span> vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux occupation</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <Progress value={78} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mouvements/mois</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">298</div>
            <p className="text-xs text-muted-foreground">156 entrées • 142 sorties</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance by Contract */}
      <Card>
        <CardHeader>
          <CardTitle>Performance par contrat</CardTitle>
          <CardDescription>Comparaison de vos différents sites de stockage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { site: 'Site Marseille Port', occupation: 85, cost: 12000, movements: 270, quality: 98 },
              { site: 'Plateforme Lille Métropole', occupation: 70, cost: 1000, movements: 28, quality: 95 }
            ].map((contract) => (
              <div key={contract.site} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-medium">{contract.site}</div>
                  <Badge variant="outline">Score qualité: {contract.quality}%</Badge>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Occupation</div>
                    <div className="font-medium">{contract.occupation}%</div>
                    <Progress value={contract.occupation} className="mt-1 h-1" />
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Coût/mois</div>
                    <div className="font-medium">{contract.cost.toLocaleString('fr-FR')} €</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Mouvements</div>
                    <div className="font-medium">{contract.movements}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Coût/mouvement</div>
                    <div className="font-medium">{Math.round(contract.cost / contract.movements)} €</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Savings Opportunities */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-blue-600" />
            Opportunités d'optimisation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-600 text-white w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
              <div className="flex-1">
                <div className="font-medium">Consolidation possible</div>
                <div className="text-sm text-muted-foreground">
                  Vos deux contrats pourraient être regroupés dans un seul site à Lyon, économie estimée: 15%/mois (1950 €)
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-600 text-white w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
              <div className="flex-1">
                <div className="font-medium">Optimisation de l'espace</div>
                <div className="text-sm text-muted-foreground">
                  Le site de Lille n'est occupé qu'à 70%. Envisagez de réduire la capacité contractuelle ou d'augmenter le volume.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
