'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Star, MapPin, TrendingUp, Clock, CheckCircle2, Sparkles, Loader2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getRankedOffers, selectOffer, type StorageOffer } from '@/lib/api/storage'
import { useToast } from '@/hooks/use-toast'

export default function OffersComparisonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null)
  const [offers, setOffers] = useState<StorageOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch ranked offers from API
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true)
        const response = await getRankedOffers(id)
        setOffers(response.items)
      } catch (err) {
        console.error('Error fetching offers:', err)
        setError(err instanceof Error ? err.message : 'Failed to load offers')
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les offres',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOffers()
  }, [id, toast])

  const handleAcceptOffer = async (offerId: string) => {
    try {
      setSelectedOffer(offerId)
      const contract = await selectOffer(id, offerId)

      toast({
        title: 'Offre acceptée',
        description: `Contrat ${contract.id} créé avec succès`,
      })

      // Redirect to contract page after 1.5s
      setTimeout(() => {
        window.location.href = `/storage/contracts/${contract.id}`
      }, 1500)
    } catch (err) {
      console.error('Error accepting offer:', err)
      toast({
        title: 'Erreur',
        description: 'Impossible d\'accepter l\'offre',
        variant: 'destructive',
      })
      setSelectedOffer(null)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Chargement des offres...</p>
        </div>
      </div>
    )
  }

  if (error || offers.length === 0) {
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
          </div>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {error || 'Aucune offre reçue pour le moment'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
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
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">
                    {(offer.pricing.totalPrice || 0).toLocaleString('fr-FR')} {offer.pricing.currency}
                  </TableCell>
                  <TableCell>
                    {offer.pricing.monthlyRate ? `${offer.pricing.monthlyRate} €/mois` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <TrendingUp className={`h-3 w-3 ${
                        (offer.reliabilityScore || 0) >= 90 ? 'text-green-600' :
                        (offer.reliabilityScore || 0) >= 75 ? 'text-orange-500' :
                        'text-gray-500'
                      }`} />
                      {offer.reliabilityScore || 0}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {offer.responseTimeHours || 0}h
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
