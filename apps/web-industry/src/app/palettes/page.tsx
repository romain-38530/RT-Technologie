'use client'

import { useState, useEffect } from 'react'
import { palettesApi, type PalletLedger, type PalletSite } from '@/lib/api/palettes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  PackageOpen,
  MapPin,
  TrendingUp,
  TrendingDown,
  Clock,
  Plus,
} from 'lucide-react'
import Link from 'next/link'
// TEMPORAIRE: Désactivé pour déploiement Vercel (dépendance workspace non disponible)
// import { TrainingButton } from '@rt/design-system'

export default function PalettesPage() {
  const [ledger, setLedger] = useState<PalletLedger | null>(null)
  const [sites, setSites] = useState<PalletSite[]>([])
  const [loading, setLoading] = useState(true)

  // For demo purposes, using IND-1 as company ID
  const companyId = 'IND-1'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [ledgerData, sitesData] = await Promise.all([
          palettesApi.getLedger(companyId),
          palettesApi.getSites(),
        ])
        setLedger(ledgerData)
        setSites(sitesData)
      } catch (error) {
        console.error('Error fetching palette data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [companyId])

  if (loading) {
    return (
      <div className="container p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  const balance = ledger?.balance || 0
  const isPositive = balance >= 0
  const recentHistory = ledger?.history?.slice(-5).reverse() || []

  return (
    <div className="container p-6 space-y-6">
      /* <TrainingButton toolName="Palettes" /> */
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Palettes</h1>
          <p className="text-muted-foreground mt-1">
            Économie circulaire des palettes Europe
          </p>
        </div>
        <Link href="/palettes/generate">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> */
            Générer un chèque
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solde de palettes</CardTitle>
            <PackageOpen className="h-4 w-4 text-muted-foreground" /> */
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{balance}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isPositive ? 'Palettes en crédit' : 'Palettes en débit'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sites de retour</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" /> */
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sites.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sites disponibles dans le réseau
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mouvements récents</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" /> */
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentHistory.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Dernières opérations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="sites">Sites de retour</TabsTrigger>
        </TabsList>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des mouvements</CardTitle>
              <CardDescription>
                Historique complet de vos échanges de palettes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aucun mouvement enregistré
                </p>
              ) : (
                <div className="space-y-2">
                  {recentHistory.map((entry, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        {entry.delta > 0 ? (
                          <TrendingUp className="h-5 w-5 text-green-600" /> */
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600" /> */
                        )}
                        <div>
                          <p className="font-medium">{entry.reason}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${entry.delta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {entry.delta > 0 ? '+' : ''}{entry.delta}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Solde: {entry.newBalance}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sites Tab */}
        <TabsContent value="sites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sites de retour</CardTitle>
              <CardDescription>
                Liste des sites disponibles pour le retour de palettes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sites.map((site) => {
                  const quotaPercent = (site.quotaConsumed / site.quotaDailyMax) * 100
                  const isNearCapacity = quotaPercent > 80

                  return (
                    <div
                      key={site.id}
                      className="p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{site.name}</h3>
                            <span
                              className={`px-2 py-0.5 text-xs rounded-full ${
                                site.priority === 'INTERNAL'
                                  ? 'bg-blue-100 text-blue-800'
                                  : site.priority === 'NETWORK'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {site.priority}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {site.address}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>
                              Horaires: {site.openingHours.start} - {site.openingHours.end}
                            </span>
                            <span>
                              Jours: {site.availableDays.map(d => ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][d]).join(', ')}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${isNearCapacity ? 'text-orange-600' : 'text-green-600'}`}>
                            {site.quotaDailyMax - site.quotaConsumed} / {site.quotaDailyMax}
                          </p>
                          <p className="text-xs text-muted-foreground">places dispos</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              isNearCapacity ? 'bg-orange-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(quotaPercent, 100)}%` }}
                          /> */
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
