'use client'

import { use } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, Package, Calendar, FileText, ThermometerSnowflake, Shield } from 'lucide-react'

export default function StorageNeedDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  // Mock data - would come from API
  const need = {
    id: 'NEED-1732000001-abc123',
    status: 'PUBLISHED',
    storageType: 'long_term',
    volume: { type: 'palettes', quantity: 200 },
    duration: {
      startDate: '2025-02-01',
      endDate: '2025-08-31',
      flexible: true,
      renewable: true
    },
    location: {
      region: 'Île-de-France',
      department: '77',
      maxRadius: 50
    },
    constraints: {
      temperature: 'ambient',
      adrAuthorized: false,
      securityLevel: 'standard',
      certifications: ['ISO 9001']
    },
    infrastructure: {
      dockCount: 2,
      liftingEquipment: true,
      handlingEquipment: ['forklift', 'pallet_jack']
    },
    activity: {
      schedule: 'Mon-Fri 8h-18h',
      dailyMovements: 10
    },
    budget: { indicative: 5000, currency: 'EUR', period: 'monthly' },
    deadline: '2025-01-25T23:59:59Z',
    createdAt: '2025-01-15T10:30:00Z',
    publicationType: 'GLOBAL',
    offersCount: 5
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <Link href="/storage/needs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">{id}</h2>
          <p className="text-muted-foreground">
            Détails du besoin de stockage
          </p>
        </div>
        <div className="flex gap-2">
          {need.offersCount > 0 && (
            <Link href={`/storage/needs/${id}/offers`}>
              <Button>
                Voir les {need.offersCount} offres
              </Button>
            </Link>
          )}
          <Badge variant={need.status === 'PUBLISHED' ? 'secondary' : 'default'}>
            {need.status === 'PUBLISHED' ? 'Publié' : need.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Caractéristiques */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Caractéristiques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Type de stockage</div>
              <div className="font-medium">{need.storageType === 'long_term' ? 'Long terme' : need.storageType}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Volume demandé</div>
              <div className="font-medium">{need.volume.quantity} {need.volume.type}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Période</div>
              <div className="font-medium">
                Du {new Date(need.duration.startDate).toLocaleDateString('fr-FR')}
                {' au '}
                {new Date(need.duration.endDate).toLocaleDateString('fr-FR')}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {need.duration.flexible && 'Dates flexibles • '}
                {need.duration.renewable && 'Reconduction possible'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Budget indicatif</div>
              <div className="font-medium">
                {need.budget.indicative.toLocaleString('fr-FR')} {need.budget.currency} / {need.budget.period === 'monthly' ? 'mois' : 'total'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Localisation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Localisation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Région</div>
              <div className="font-medium">{need.location.region}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Département</div>
              <div className="font-medium">{need.location.department}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Rayon maximum</div>
              <div className="font-medium">{need.location.maxRadius} km</div>
            </div>
          </CardContent>
        </Card>

        {/* Contraintes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ThermometerSnowflake className="h-5 w-5" />
              Contraintes opérationnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Température</div>
              <div className="font-medium">
                {need.constraints.temperature === 'ambient' ? 'Ambiante' : need.constraints.temperature}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">ADR (matières dangereuses)</div>
              <div className="font-medium">{need.constraints.adrAuthorized ? 'Autorisé' : 'Non requis'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Niveau de sécurité</div>
              <div className="font-medium">
                {need.constraints.securityLevel === 'standard' ? 'Standard' : 'Haute sécurité'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Certifications requises</div>
              <div className="flex gap-2 mt-1">
                {need.constraints.certifications.map((cert) => (
                  <Badge key={cert} variant="outline">{cert}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Infrastructure et Activité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Infrastructure et Activité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Quais de chargement</div>
              <div className="font-medium">{need.infrastructure.dockCount} minimum</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Équipement de levage</div>
              <div className="font-medium">{need.infrastructure.liftingEquipment ? 'Requis' : 'Non requis'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Horaires</div>
              <div className="font-medium">{need.activity.schedule}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Mouvements quotidiens estimés</div>
              <div className="font-medium">{need.activity.dailyMovements} entrées/sorties</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Publication Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informations de publication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Mode de publication</div>
              <div className="font-medium">
                {need.publicationType === 'GLOBAL' ? 'Bourse globale' :
                 need.publicationType === 'REFERRED_ONLY' ? 'Partenaires référencés' :
                 'Publication mixte'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Publié le</div>
              <div className="font-medium">
                {new Date(need.createdAt).toLocaleDateString('fr-FR')}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Date limite de réponse</div>
              <div className="font-medium">
                {new Date(need.deadline).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offres Summary */}
      {need.offersCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Offres reçues</CardTitle>
            <CardDescription>
              {need.offersCount} logisticiens ont répondu à votre besoin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/storage/needs/${id}/offers`}>
              <Button className="w-full" size="lg">
                Comparer les {need.offersCount} offres
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
