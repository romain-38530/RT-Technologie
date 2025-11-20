'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, MapPin, Truck, Package, FileText } from 'lucide-react'
import { pickupsApi } from '@/lib/api/pickups'
import { Navigation } from '@/components/layout/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/utils'

export default function PickupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const pickupId = params.id as string

  const { data: pickup, isLoading } = useQuery({
    queryKey: ['pickup', pickupId],
    queryFn: () => pickupsApi.getById(pickupId),
    enabled: !!pickupId,
  })

  const { data: documents } = useQuery({
    queryKey: ['pickup-documents', pickupId],
    queryFn: () => pickupsApi.getDocuments(pickupId),
    enabled: !!pickupId,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
        </div>
      </div>
    )
  }

  if (!pickup) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-slate-600">Enlevement introuvable</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <div className="space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">
                    Enlevement #{pickup.orderId}
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <Badge variant="default">{pickup.status}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 mb-3">Informations</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span>
                        {pickup.confirmedDate
                          ? formatDateTime(pickup.confirmedDate)
                          : formatDateTime(pickup.scheduledDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-slate-500" />
                      <div>
                        <div>{pickup.carrier.name}</div>
                        {pickup.carrier.contact && (
                          <div className="text-slate-500">{pickup.carrier.contact}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-slate-900 mb-3">Adresse d&apos;enlevement</h4>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-slate-500 mt-0.5" />
                    <div>
                      <div className="font-medium">{pickup.origin.name}</div>
                      <div className="text-slate-600">{pickup.origin.address}</div>
                      <div className="text-slate-600">
                        {pickup.origin.zipCode} {pickup.origin.city}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Articles a enlever
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pickup.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-3 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{item.description}</div>
                      <div className="text-sm text-slate-500">SKU: {item.sku}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{item.quantity} unites</div>
                      {item.pallets && (
                        <div className="text-sm text-slate-500">{item.pallets} palettes</div>
                      )}
                      {item.weight && (
                        <div className="text-sm text-slate-500">{item.weight} kg</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {documents && documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-slate-500" />
                        <div>
                          <div className="font-medium">{doc.name}</div>
                          <div className="text-sm text-slate-500">
                            {doc.type} - {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          Telecharger
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">
                  Aucun document disponible
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
