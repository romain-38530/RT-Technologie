'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Upload } from 'lucide-react'
import { useUploadGrid, useOrigins } from '@/lib/hooks'

export default function UploadGridPage() {
  const router = useRouter()
  const ownerOrgId = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || 'IND-1'
  const [mode, setMode] = useState<'FTL' | 'LTL'>('FTL')
  const [origin, setOrigin] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const { data: origins } = useOrigins(ownerOrgId)
  const uploadMutation = useUploadGrid()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file || !origin) {
      alert('Veuillez selectionner un origin et un fichier')
      return
    }

    try {
      const content = await file.text()
      await uploadMutation.mutateAsync({
        mode,
        origin,
        ownerOrgId,
        content,
        isCSV: true,
      })

      alert('Grille uploadee avec succes!')
      router.push('/grids')
    } catch (error) {
      console.error('Upload error:', error)
      alert('Erreur lors de l\'upload')
    }
  }

  // Mock origins if API not ready
  const mockOrigins = [
    { id: 'PARIS', label: 'Paris Hub' },
    { id: 'LYON', label: 'Lyon Hub' },
    { id: 'MARSEILLE', label: 'Marseille Hub' },
  ]

  const displayOrigins = origins && origins.length > 0 ? origins : mockOrigins

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <Link href="/grids">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Uploader une grille tarifaire
          </h2>
          <p className="text-muted-foreground">
            Importez vos tarifs FTL ou LTL depuis un fichier CSV
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              Selectionnez le mode et l'origin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Mode de transport</Label>
              <div className="flex gap-2">
                <Button
                  variant={mode === 'FTL' ? 'default' : 'outline'}
                  onClick={() => setMode('FTL')}
                >
                  FTL (Full Truck Load)
                </Button>
                <Button
                  variant={mode === 'LTL' ? 'default' : 'outline'}
                  onClick={() => setMode('LTL')}
                >
                  LTL (Less Than Load)
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="origin">Origin</Label>
              <select
                id="origin"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
              >
                <option value="">Selectionnez un origin</option>
                {displayOrigins.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Fichier CSV</Label>
              <Input
                id="file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
              />
            </div>

            <Button
              onClick={handleUpload}
              disabled={!file || !origin || uploadMutation.isPending}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploadMutation.isPending ? 'Upload en cours...' : 'Uploader'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Format CSV</CardTitle>
            <CardDescription>
              Structure attendue selon le mode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mode === 'FTL' ? (
                <div>
                  <h4 className="font-medium mb-2">Format FTL :</h4>
                  <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                    {`origin,to,price,currency
PARIS,LYON,850,EUR
PARIS,MARSEILLE,950,EUR
PARIS,TOULOUSE,1100,EUR`}
                  </pre>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                    <li>• origin : Point de depart</li>
                    <li>• to : Destination</li>
                    <li>• price : Prix total</li>
                    <li>• currency : Devise (EUR, USD...)</li>
                  </ul>
                </div>
              ) : (
                <div>
                  <h4 className="font-medium mb-2">Format LTL :</h4>
                  <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                    {`origin,to,minpallets,maxpallets,priceperpallet,currency
PARIS,LYON,1,10,45,EUR
PARIS,LYON,11,20,42,EUR
PARIS,MARSEILLE,1,10,50,EUR`}
                  </pre>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                    <li>• origin : Point de depart</li>
                    <li>• to : Destination</li>
                    <li>• minpallets : Nb min de palettes</li>
                    <li>• maxpallets : Nb max de palettes</li>
                    <li>• priceperpallet : Prix par palette</li>
                    <li>• currency : Devise</li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
