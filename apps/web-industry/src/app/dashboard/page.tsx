'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, TrendingUp, Clock, CheckCircle2, PackageOpen } from 'lucide-react'
import { palettesApi, type PalletLedger } from '@/lib/api/palettes'
// TEMPORAIRE: Désactivé pour déploiement Vercel (dépendance workspace non disponible)
// import { TrainingButton } from '@rt/design-system'

export default function DashboardPage() {
  const [palletBalance, setPalletBalance] = useState<number | null>(null)

  // Mock data - in real app would come from API
  const stats = {
    totalOrders: 156,
    activeOrders: 23,
    pendingOrders: 8,
    acceptedOrders: 15,
    acceptanceRate: 87.5,
    avgResponseTime: 1.8,
  }

  useEffect(() => {
    // Fetch pallet balance
    palettesApi.getLedger('IND-1')
      .then(ledger => setPalletBalance(ledger.balance))
      .catch(err => console.error('Error fetching pallet balance:', err))
  }, [])

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      /* <TrainingButton toolName="Industrie" /> */
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total commandes
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" /> */
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Toutes les commandes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Commandes actives
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" /> */
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground">
              En cours de traitement
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              En attente
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" /> */
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Attendent dispatch
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Acceptees
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" /> */
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.acceptedOrders}</div>
            <p className="text-xs text-muted-foreground">
              Par transporteurs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Solde palettes
            </CardTitle>
            <PackageOpen className="h-4 w-4 text-muted-foreground" /> */
          </CardHeader>
          <CardContent>
            {palletBalance !== null ? (
              <>
                <div className={`text-2xl font-bold ${palletBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {palletBalance >= 0 ? '+' : ''}{palletBalance}
                </div>
                <p className="text-xs text-muted-foreground">
                  {palletBalance >= 0 ? 'Crédit' : 'Débit'}
                </p>
              </> */
            ) : (
              <div className="text-2xl font-bold text-muted-foreground">-</div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Vue d'ensemble</CardTitle>
            <CardDescription>
              Statistiques des commandes sur les 30 derniers jours
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Taux d'acceptation
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {stats.acceptanceRate}% des commandes acceptees
                  </p>
                </div>
                <div className="ml-auto font-medium">
                  {stats.acceptanceRate}%
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Delai moyen de reponse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Temps moyen avant acceptation
                  </p>
                </div>
                <div className="ml-auto font-medium">
                  {stats.avgResponseTime}h
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Raccourcis vers les fonctionnalites principales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a
                href="/orders/import"
                className="block w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent"
              >
                <div className="font-medium">Importer des commandes</div>
                <div className="text-sm text-muted-foreground">
                  Importer depuis CSV/Excel
                </div>
              </a>
              <a
                href="/palettes/generate"
                className="block w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent"
              >
                <div className="font-medium">Générer chèque palette</div>
                <div className="text-sm text-muted-foreground">
                  Économie circulaire des palettes
                </div>
              </a>
              <a
                href="/grids/upload"
                className="block w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent"
              >
                <div className="font-medium">Uploader une grille</div>
                <div className="text-sm text-muted-foreground">
                  Grille tarifaire FTL/LTL
                </div>
              </a>
              <a
                href="/carriers"
                className="block w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent"
              >
                <div className="font-medium">Inviter un transporteur</div>
                <div className="text-sm text-muted-foreground">
                  Ajouter a votre reseau
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
