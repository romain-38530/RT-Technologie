'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Star, MapPin, TrendingUp, Clock, CheckCircle2, Sparkles } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function OffersComparisonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null)

  // Mock data with AI ranking
  const offers = [
    {
      id: 'OFFER-001',
      logisticianId: 'LOG-2',
      logisticianName: 'Hub Lyon Est',
      siteLocation: { city: 'Chassieu', region: 'Rhône-Alpes', distance: 12 },
      pricing: {
        monthlyPerPallet: 11,
        totalPrice: 7700,
        setupFee: 400
      },
      certifications: ['ISO 9001', 'ISO 14001', 'IFS'],
      availability: { readyDate: '2025-01-19', flexibleStart: false },
      reliabilityScore: 95,
      responseTimeHours: 1.5,
      aiScore: 94.5,
      aiRank: 1,
      aiRecommended: true,
      aiReasons: [
        'Prix très compétitif (-15% vs moyenne)',
        'Très proche (12km)',
        'Excellent historique de fiabilité',
        'Réponse ultra-rapide'
      ]
    },
    {
      id: 'OFFER-002',
      logisticianId: 'LOG-1',
      logisticianName: 'Entrepôt Paris Nord',
      siteLocation: { city: 'Gennevilliers', region: 'Île-de-France', distance: 45 },
      pricing: {
        monthlyPerPallet: 12,
        totalPrice: 8400,
        setupFee: 500
      },
      certifications: ['ISO 9001', 'IFS'],
      availability: { readyDate: '2025-01-28', flexibleStart: true },
      reliabilityScore: 92,
      responseTimeHours: 3,
      aiScore: 87.2,
      aiRank: 2,
      aiRecommended: true,
      aiReasons: [
        'Prix avantageux',
        'Proximité acceptable (45km)',
        'Bonne fiabilité',
        'Réponse rapide'
      ]
    },
    {
      id: 'OFFER-003',
      logisticianId: 'LOG-4',
      logisticianName: 'Entrepôt Bordeaux Lac',
      siteLocation: { city: 'Bordeaux', region: 'Nouvelle-Aquitaine', distance: 520 },
      pricing: {
        monthlyPerPallet: 11.5,
        totalPrice: 8050,
        setupFee: 450
      },
      certifications: ['ISO 9001', 'IFS'],
      availability: { readyDate: '2025-02-01', flexibleStart: true },
      reliabilityScore: 85,
      responseTimeHours: 6,
      aiScore: 62.3,
      aiRank: 3,
      aiRecommended: true,
      aiReasons: [
        'Prix dans la moyenne',
        'Distance élevée (520km)',
        'Bonne fiabilité'
      ]
    },
    {
      id: 'OFFER-004',
      logisticianId: 'LOG-3',
      logisticianName: 'Plateforme Lille Métropole',
      siteLocation: { city: 'Lesquin', region: 'Hauts-de-France', distance: 180 },
      pricing: {
        monthlyPerPallet: 13.5,
        totalPrice: 9450,
        setupFee: 350
      },
      certifications: ['ISO 9001'],
      availability: { readyDate: '2025-02-05', flexibleStart: true },
      reliabilityScore: 78,
      responseTimeHours: 8,
      aiScore: 54.1,
      aiRank: 4,
      aiRecommended: false,
      aiReasons: [
        'Prix au-dessus de la moyenne',
        'Distance modérée (180km)',
        'Réponse dans les délais'
      ]
    }
  ]

  const handleAcceptOffer = (offerId: string) => {
    setSelectedOffer(offerId)
    // TODO: Call API to accept offer and create contract
    console.log('Accepting offer:', offerId)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <Link href={`/storage/needs/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">Comparaison des Offres</h2>
          <p className="text-muted-foreground">
            {offers.length} offres reçues • Classement intelligent par IA
          </p>
        </div>
      </div>

      {/* Top 3 AI Recommendations */}
      <Card className="border-2 border-primary bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Top 3 Recommandations IA
          </CardTitle>
          <CardDescription>
            Nos algorithmes ont analysé toutes les offres selon le prix, la proximité, la fiabilité et la réactivité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {offers.slice(0, 3).map((offer, index) => (
              <Card key={offer.id} className={index === 0 ? 'border-2 border-primary' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={index === 0 ? 'default' : 'secondary'}>
                      #{index + 1} • Score: {offer.aiScore}
                    </Badge>
                    {index === 0 && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                  </div>
                  <CardTitle className="text-lg">{offer.logisticianName}</CardTitle>
                  <CardDescription>{offer.siteLocation.city}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-2xl font-bold">
                    {offer.pricing.totalPrice.toLocaleString('fr-FR')} €
                  </div>
                  <div className="space-y-1">
                    {offer.aiReasons.slice(0, 2).map((reason, idx) => (
                      <div key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                        <CheckCircle2 className="h-3 w-3 mt-0.5 text-green-600" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full"
                    variant={index === 0 ? 'default' : 'outline'}
                    onClick={() => handleAcceptOffer(offer.id)}
                  >
                    {index === 0 ? 'Accepter (recommandé)' : 'Accepter'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comparaison détaillée</CardTitle>
          <CardDescription>Toutes les offres avec détails complets</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rang IA</TableHead>
                <TableHead>Logisticien</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Prix Total</TableHead>
                <TableHead>Prix/palette</TableHead>
                <TableHead>Fiabilité</TableHead>
                <TableHead>Réactivité</TableHead>
                <TableHead>Certifications</TableHead>
                <TableHead>Score IA</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => (
                <TableRow key={offer.id} className={offer.aiRecommended ? 'bg-primary/5' : ''}>
                  <TableCell>
                    <Badge variant={offer.aiRank === 1 ? 'default' : 'outline'}>
                      #{offer.aiRank}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {offer.logisticianName}
                    {offer.aiRank === 1 && (
                      <Star className="inline h-3 w-3 ml-1 text-yellow-500 fill-yellow-500" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {offer.siteLocation.city}
                      <span className="text-xs text-muted-foreground">
                        ({offer.siteLocation.distance}km)
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">
                    {offer.pricing.totalPrice.toLocaleString('fr-FR')} €
                  </TableCell>
                  <TableCell>
                    {offer.pricing.monthlyPerPallet} €/palette
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <TrendingUp className={`h-3 w-3 ${
                        offer.reliabilityScore >= 90 ? 'text-green-600' :
                        offer.reliabilityScore >= 75 ? 'text-orange-500' :
                        'text-gray-500'
                      }`} />
                      {offer.reliabilityScore}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {offer.responseTimeHours}h
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {offer.certifications.slice(0, 2).map((cert) => (
                        <Badge key={cert} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                      {offer.certifications.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{offer.certifications.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={offer.aiRecommended ? 'default' : 'secondary'}>
                      {offer.aiScore}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {/* View details */}}
                      >
                        Détails
                      </Button>
                      <Button
                        size="sm"
                        variant={offer.aiRank === 1 ? 'default' : 'outline'}
                        onClick={() => handleAcceptOffer(offer.id)}
                        disabled={selectedOffer !== null}
                      >
                        Accepter
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* AI Analysis Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Comment fonctionne le classement IA ?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <div className="font-medium mb-2">Prix (40 points)</div>
              <p className="text-sm text-muted-foreground">
                Comparaison du coût total incluant tous les frais
              </p>
            </div>
            <div>
              <div className="font-medium mb-2">Proximité (25 points)</div>
              <p className="text-sm text-muted-foreground">
                Distance au site industriel via formule Haversine
              </p>
            </div>
            <div>
              <div className="font-medium mb-2">Fiabilité (20 points)</div>
              <p className="text-sm text-muted-foreground">
                Score basé sur l'historique et le taux de litiges
              </p>
            </div>
            <div>
              <div className="font-medium mb-2">Réactivité (15 points)</div>
              <p className="text-sm text-muted-foreground">
                Rapidité de réponse et disponibilité
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
