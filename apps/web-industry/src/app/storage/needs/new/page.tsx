'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ArrowLeft, Save, Send } from 'lucide-react'
import Link from 'next/link'

export default function NewStorageNeedPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    storageType: 'long_term',
    volumeType: 'palettes',
    volumeQuantity: '',
    startDate: '',
    endDate: '',
    flexible: false,
    renewable: false,
    country: 'France',
    region: '',
    department: '',
    maxRadius: '50',
    temperature: 'ambient',
    adrAuthorized: false,
    securityLevel: 'standard',
    certifications: [] as string[],
    dockCount: '',
    liftingEquipment: false,
    handlingEquipment: [] as string[],
    schedule: '',
    dailyMovements: '',
    budget: '',
    budgetPeriod: 'monthly',
    publicationType: 'GLOBAL',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // TODO: Call API to create need
    console.log('Creating need:', formData)

    // Simulate API call
    setTimeout(() => {
      router.push('/storage/needs')
    }, 1000)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <Link href="/storage/needs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Publier un Besoin de Stockage</h2>
          <p className="text-muted-foreground">
            Décrivez vos besoins pour recevoir des offres de logisticiens qualifiés
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Caractéristiques du Besoin */}
        <Card>
          <CardHeader>
            <CardTitle>Caractéristiques du besoin</CardTitle>
            <CardDescription>Informations principales sur votre besoin de stockage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storageType">Type de stockage *</Label>
                <Select
                  value={formData.storageType}
                  onValueChange={(value) => setFormData({ ...formData, storageType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="long_term">Long terme</SelectItem>
                    <SelectItem value="temporary">Temporaire</SelectItem>
                    <SelectItem value="picking">Picking</SelectItem>
                    <SelectItem value="cross_dock">Cross-dock</SelectItem>
                    <SelectItem value="customs">Douane</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="volumeType">Unité de volume *</Label>
                <Select
                  value={formData.volumeType}
                  onValueChange={(value) => setFormData({ ...formData, volumeType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="palettes">Palettes</SelectItem>
                    <SelectItem value="m2">m²</SelectItem>
                    <SelectItem value="m3">m³</SelectItem>
                    <SelectItem value="linear_meters">Mètres linéaires</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="volumeQuantity">Volume demandé *</Label>
              <Input
                id="volumeQuantity"
                type="number"
                placeholder="200"
                value={formData.volumeQuantity}
                onChange={(e) => setFormData({ ...formData, volumeQuantity: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de début *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="flexible"
                  checked={formData.flexible}
                  onCheckedChange={(checked) => setFormData({ ...formData, flexible: checked as boolean })}
                />
                <Label htmlFor="flexible" className="text-sm font-normal">Dates flexibles</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="renewable"
                  checked={formData.renewable}
                  onCheckedChange={(checked) => setFormData({ ...formData, renewable: checked as boolean })}
                />
                <Label htmlFor="renewable" className="text-sm font-normal">Reconduction possible</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Localisation */}
        <Card>
          <CardHeader>
            <CardTitle>Localisation</CardTitle>
            <CardDescription>Où doit se situer l'entrepôt ?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">Région *</Label>
                <Select
                  value={formData.region}
                  onValueChange={(value) => setFormData({ ...formData, region: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ile-de-france">Île-de-France</SelectItem>
                    <SelectItem value="auvergne-rhone-alpes">Auvergne-Rhône-Alpes</SelectItem>
                    <SelectItem value="hauts-de-france">Hauts-de-France</SelectItem>
                    <SelectItem value="paca">Provence-Alpes-Côte d'Azur</SelectItem>
                    <SelectItem value="nouvelle-aquitaine">Nouvelle-Aquitaine</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Département *</Label>
                <Input
                  id="department"
                  placeholder="75"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxRadius">Rayon max (km) *</Label>
                <Select
                  value={formData.maxRadius}
                  onValueChange={(value) => setFormData({ ...formData, maxRadius: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20 km</SelectItem>
                    <SelectItem value="50">50 km</SelectItem>
                    <SelectItem value="100">100 km</SelectItem>
                    <SelectItem value="200">200 km</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contraintes Opérationnelles */}
        <Card>
          <CardHeader>
            <CardTitle>Contraintes opérationnelles</CardTitle>
            <CardDescription>Conditions et certifications requises</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temperature">Température *</Label>
                <Select
                  value={formData.temperature}
                  onValueChange={(value) => setFormData({ ...formData, temperature: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ambient">Ambiante</SelectItem>
                    <SelectItem value="cold_2_8">Froid positif (2-8°C)</SelectItem>
                    <SelectItem value="frozen_minus_18">Surgelé (-18°C)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="securityLevel">Niveau de sécurité *</Label>
                <Select
                  value={formData.securityLevel}
                  onValueChange={(value) => setFormData({ ...formData, securityLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="high">Haute sécurité</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="adrAuthorized"
                checked={formData.adrAuthorized}
                onCheckedChange={(checked) => setFormData({ ...formData, adrAuthorized: checked as boolean })}
              />
              <Label htmlFor="adrAuthorized" className="text-sm font-normal">
                ADR autorisé (matières dangereuses)
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Certifications requises</Label>
              <div className="grid grid-cols-3 gap-2">
                {['ISO 9001', 'ISO 14001', 'IFS'].map((cert) => (
                  <div key={cert} className="flex items-center space-x-2">
                    <Checkbox
                      id={cert}
                      checked={formData.certifications.includes(cert)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({ ...formData, certifications: [...formData.certifications, cert] })
                        } else {
                          setFormData({ ...formData, certifications: formData.certifications.filter(c => c !== cert) })
                        }
                      }}
                    />
                    <Label htmlFor={cert} className="text-sm font-normal">{cert}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Infrastructure */}
        <Card>
          <CardHeader>
            <CardTitle>Infrastructure requise</CardTitle>
            <CardDescription>Équipements et installations nécessaires</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dockCount">Nombre de quais minimum</Label>
                <Input
                  id="dockCount"
                  type="number"
                  placeholder="2"
                  value={formData.dockCount}
                  onChange={(e) => setFormData({ ...formData, dockCount: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dailyMovements">Mouvements quotidiens estimés</Label>
                <Input
                  id="dailyMovements"
                  type="number"
                  placeholder="10"
                  value={formData.dailyMovements}
                  onChange={(e) => setFormData({ ...formData, dailyMovements: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="liftingEquipment"
                checked={formData.liftingEquipment}
                onCheckedChange={(checked) => setFormData({ ...formData, liftingEquipment: checked as boolean })}
              />
              <Label htmlFor="liftingEquipment" className="text-sm font-normal">
                Équipement de levage requis
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Budget et Publication */}
        <Card>
          <CardHeader>
            <CardTitle>Budget et Publication</CardTitle>
            <CardDescription>Informations commerciales et mode de publication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget indicatif (EUR)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="5000"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budgetPeriod">Période</Label>
                <Select
                  value={formData.budgetPeriod}
                  onValueChange={(value) => setFormData({ ...formData, budgetPeriod: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Par mois</SelectItem>
                    <SelectItem value="total">Total contrat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Mode de publication *</Label>
              <RadioGroup value={formData.publicationType} onValueChange={(value) => setFormData({ ...formData, publicationType: value })}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="GLOBAL" id="global" />
                  <Label htmlFor="global" className="font-normal">
                    <div className="font-medium">Bourse Globale</div>
                    <div className="text-sm text-muted-foreground">Visible par tous les logisticiens abonnés</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="REFERRED_ONLY" id="referred" />
                  <Label htmlFor="referred" className="font-normal">
                    <div className="font-medium">Logisticiens Référencés</div>
                    <div className="text-sm text-muted-foreground">Uniquement vos partenaires habituels</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MIXED" id="mixed" />
                  <Label htmlFor="mixed" className="font-normal">
                    <div className="font-medium">Publication Mixte</div>
                    <div className="text-sm text-muted-foreground">Combiner les deux approches</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes complémentaires</Label>
              <Textarea
                id="notes"
                placeholder="Informations supplémentaires sur votre besoin..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Link href="/storage/needs">
            <Button variant="outline">Annuler</Button>
          </Link>
          <Button type="submit">
            <Send className="mr-2 h-4 w-4" />
            Publier le besoin
          </Button>
        </div>
      </form>
    </div>
  )
}
