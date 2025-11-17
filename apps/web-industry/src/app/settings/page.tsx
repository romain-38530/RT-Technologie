'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building2, CreditCard, Zap } from 'lucide-react'

export default function SettingsPage() {
  const currentPlan = 'PRO'
  const hasAffretIA = false

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Parametres</h2>
        <p className="text-muted-foreground">
          Gerez votre organisation et votre abonnement
        </p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <CardTitle>Profil de l'organisation</CardTitle>
            </div>
            <CardDescription>
              Informations de votre entreprise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="org-name">Nom de l'entreprise</Label>
                <Input
                  id="org-name"
                  defaultValue="Mon Entreprise Industrielle"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-id">ID Organisation</Label>
                <Input
                  id="org-id"
                  defaultValue="IND-1"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-email">Email</Label>
                <Input
                  id="org-email"
                  type="email"
                  defaultValue="contact@mon-entreprise.fr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-phone">Telephone</Label>
                <Input
                  id="org-phone"
                  defaultValue="+33 1 23 45 67 89"
                />
              </div>
            </div>
            <Button>Enregistrer les modifications</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <CardTitle>Plan et facturation</CardTitle>
            </div>
            <CardDescription>
              Gestion de votre abonnement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Plan actuel</p>
                <p className="text-sm text-muted-foreground">
                  Acces a toutes les fonctionnalites de base
                </p>
              </div>
              <Badge variant="default">{currentPlan}</Badge>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Fonctionnalites incluses :</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Import illimite de commandes</li>
                <li>✓ Gestion des grilles tarifaires</li>
                <li>✓ Dispatch automatique</li>
                <li>✓ Suivi en temps reel</li>
                <li>✓ Invitation de transporteurs</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button variant="outline">Changer de plan</Button>
              <Button variant="outline">Historique de facturation</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <CardTitle>Addons</CardTitle>
            </div>
            <CardDescription>
              Fonctionnalites supplementaires
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">AFFRET IA</p>
                  {hasAffretIA ? (
                    <Badge variant="default">Active</Badge>
                  ) : (
                    <Badge variant="outline">Non active</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Intelligence artificielle pour l'affretement automatique
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Escalade automatique vers un reseau etendu de transporteurs
                </p>
              </div>
              <div>
                {!hasAffretIA && (
                  <Button>Activer - 99€/mois</Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs</CardTitle>
            <CardDescription>
              Membres de votre organisation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">admin@mon-entreprise.fr</p>
                  <p className="text-sm text-muted-foreground">Administrateur</p>
                </div>
                <Badge>ADMIN</Badge>
              </div>
            </div>
            <Button variant="outline" className="mt-4">
              Inviter un utilisateur
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
