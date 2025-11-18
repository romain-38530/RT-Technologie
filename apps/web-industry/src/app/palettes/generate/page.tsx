'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { palettesApi, type GenerateChequeRequest, type GenerateChequeResponse } from '@/lib/api/palettes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2, MapPin, Package, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function GenerateChequePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenerateChequeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    orderId: '',
    quantity: 33,
    transporterPlate: '',
    deliveryLat: 48.8566,
    deliveryLng: 2.3522,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const request: GenerateChequeRequest = {
        fromCompanyId: 'IND-1', // For demo purposes
        orderId: formData.orderId,
        quantity: formData.quantity,
        transporterPlate: formData.transporterPlate,
        deliveryLocation: {
          lat: formData.deliveryLat,
          lng: formData.deliveryLng,
        },
      }

      const response = await palettesApi.generateCheque(request)
      setResult(response)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la génération du chèque')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (result) {
    return (
      <div className="container p-6 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/palettes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
        </div>

        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <CardTitle className="text-green-900">Chèque palette généré avec succès</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cheque Info */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold mb-3">Informations du chèque</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">ID Chèque</p>
                  <p className="font-mono font-bold">{result.cheque.chequeId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Quantité</p>
                  <p className="font-bold">{result.cheque.quantity} palettes</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Commande</p>
                  <p className="font-medium">{result.cheque.orderId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Immatriculation</p>
                  <p className="font-medium">{result.cheque.transporterPlate}</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-100 rounded text-center">
                <p className="text-xs text-muted-foreground mb-1">QR Code</p>
                <p className="font-mono text-lg font-bold">{result.cheque.qrCode}</p>
              </div>
            </div>

            {/* Matched Site */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Site de retour assigné</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="font-medium text-lg">{result.matchedSite.name}</p>
                  <p className="text-sm text-muted-foreground">{result.matchedSite.address}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {result.matchedSite.distance.toFixed(1)} km
                  </span>
                  <span className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    {result.matchedSite.quotaDailyMax - result.matchedSite.quotaConsumed} places dispo
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Horaires: {result.matchedSite.openingHours.start} - {result.matchedSite.openingHours.end}
                </div>
              </div>
            </div>

            {/* AI Recommendation */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold mb-2 text-blue-900">Recommandation IA</h3>
              <p className="text-sm text-blue-800">{result.aiRecommendation}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={() => router.push('/palettes')} className="flex-1">
                Voir le tableau de bord
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null)
                  setFormData({
                    orderId: '',
                    quantity: 33,
                    transporterPlate: '',
                    deliveryLat: 48.8566,
                    deliveryLng: 2.3522,
                  })
                }}
                className="flex-1"
              >
                Générer un autre chèque
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/palettes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Générer un chèque palette</CardTitle>
          <CardDescription>
            Créez un chèque palette avec matching IA du meilleur site de retour
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="orderId">ID Commande *</Label>
                <Input
                  id="orderId"
                  type="text"
                  required
                  placeholder="ORD-123456"
                  value={formData.orderId}
                  onChange={(e) => handleChange('orderId', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="quantity">Quantité de palettes *</Label>
                <Input
                  id="quantity"
                  type="number"
                  required
                  min="1"
                  max="33"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum: 33 palettes (1 camion complet)
                </p>
              </div>

              <div>
                <Label htmlFor="transporterPlate">Immatriculation transporteur *</Label>
                <Input
                  id="transporterPlate"
                  type="text"
                  required
                  placeholder="AB-123-CD"
                  value={formData.transporterPlate}
                  onChange={(e) => handleChange('transporterPlate', e.target.value.toUpperCase())}
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Lieu de livraison (GPS)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deliveryLat">Latitude</Label>
                    <Input
                      id="deliveryLat"
                      type="number"
                      step="0.0001"
                      required
                      value={formData.deliveryLat}
                      onChange={(e) => handleChange('deliveryLat', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="deliveryLng">Longitude</Label>
                    <Input
                      id="deliveryLng"
                      type="number"
                      step="0.0001"
                      required
                      value={formData.deliveryLng}
                      onChange={(e) => handleChange('deliveryLng', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  L'IA sélectionnera automatiquement le meilleur site de retour dans un rayon de 30km
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Génération en cours...' : 'Générer le chèque'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/palettes')}
              >
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
