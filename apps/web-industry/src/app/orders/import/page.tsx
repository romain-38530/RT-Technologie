'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, FileText, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useImportOrders } from '@/lib/hooks'

export default function ImportOrdersPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const importMutation = useImportOrders()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleImport = async () => {
    if (!file) return

    // In real app, would parse CSV/Excel file
    // For now, just show success
    try {
      // Mock import
      const mockOrders = [
        {
          id: 'ORD-NEW-001',
          ref: 'REF-IMPORT-001',
          ownerOrgId: process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || 'IND-1',
          ship_from: {
            address: '123 Test',
            city: 'Paris',
            postalCode: '75001',
            country: 'FR',
          },
          ship_to: {
            address: '456 Test',
            city: 'Lyon',
            postalCode: '69001',
            country: 'FR',
          },
          pallets: 10,
          weight: 2000,
        },
      ]

      await importMutation.mutateAsync({
        orders: mockOrders,
        traceId: `import-${Date.now()}`,
      })

      alert('Commandes importees avec succes!')
      router.push('/orders')
    } catch (error) {
      console.error('Import error:', error)
      alert('Erreur lors de l\'import')
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <Link href="/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Importer des commandes
          </h2>
          <p className="text-muted-foreground">
            Importez vos commandes depuis un fichier CSV ou Excel
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Uploader un fichier</CardTitle>
            <CardDescription>
              Selectionnez un fichier CSV ou Excel contenant vos commandes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Fichier</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                />
              </div>
              {file && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{file.name}</span>
                </div>
              )}
            </div>
            <Button
              onClick={handleImport}
              disabled={!file || importMutation.isPending}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              {importMutation.isPending ? 'Import en cours...' : 'Importer'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Format attendu</CardTitle>
            <CardDescription>
              Structure du fichier CSV/Excel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Colonnes requises :</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• id : Identifiant unique</li>
                  <li>• ref : Reference</li>
                  <li>• ship_from_city : Ville de depart</li>
                  <li>• ship_to_city : Ville d'arrivee</li>
                  <li>• pallets : Nombre de palettes</li>
                  <li>• weight : Poids en kg</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Exemple :</h4>
                <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                  {`id,ref,ship_from_city,ship_to_city,pallets,weight
ORD-001,REF-001,Paris,Lyon,20,5000
ORD-002,REF-002,Marseille,Toulouse,15,3500`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
