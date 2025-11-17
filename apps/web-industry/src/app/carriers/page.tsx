'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Mail, Shield, AlertTriangle, CheckCircle } from 'lucide-react'
import { getVigilanceColor } from '@/lib/utils'
import type { Carrier } from '@/types'

// Mock carriers data
const mockCarriers: Carrier[] = [
  {
    id: 'CAR-001',
    name: 'Transport Express SA',
    email: 'contact@transport-express.fr',
    phone: '+33 1 23 45 67 89',
    vigilanceStatus: 'OK',
    score: 95,
  },
  {
    id: 'CAR-002',
    name: 'Logistique Rapide SARL',
    email: 'info@logistique-rapide.fr',
    phone: '+33 1 98 76 54 32',
    vigilanceStatus: 'WARNING',
    score: 75,
  },
  {
    id: 'CAR-003',
    name: 'Fret Solutions',
    email: 'admin@fret-solutions.fr',
    phone: '+33 1 11 22 33 44',
    vigilanceStatus: 'OK',
    score: 88,
  },
]

export default function CarriersPage() {
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')

  const handleInvite = () => {
    if (!inviteEmail || !inviteName) {
      alert('Veuillez remplir tous les champs')
      return
    }

    alert(`Invitation envoyee a ${inviteEmail}`)
    setInviteEmail('')
    setInviteName('')
    setShowInviteForm(false)
  }

  const getVigilanceIcon = (status: string) => {
    switch (status) {
      case 'OK':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'BLOCKED':
        return <Shield className="h-4 w-4 text-red-600" />
      default:
        return <Shield className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transporteurs</h2>
          <p className="text-muted-foreground">
            Gerez votre reseau de transporteurs
          </p>
        </div>
        <Button onClick={() => setShowInviteForm(!showInviteForm)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Inviter un transporteur
        </Button>
      </div>

      {showInviteForm && (
        <Card>
          <CardHeader>
            <CardTitle>Inviter un transporteur</CardTitle>
            <CardDescription>
              Envoyez une invitation par email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'entreprise</Label>
                <Input
                  id="name"
                  placeholder="Transport Express SA"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@transport.fr"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleInvite}>
                <Mail className="mr-2 h-4 w-4" />
                Envoyer l'invitation
              </Button>
              <Button variant="outline" onClick={() => setShowInviteForm(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Liste des transporteurs</CardTitle>
          <CardDescription>
            {mockCarriers.length} transporteur(s) dans votre reseau
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telephone</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Vigilance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCarriers.map((carrier) => (
                <TableRow key={carrier.id}>
                  <TableCell className="font-medium">{carrier.name}</TableCell>
                  <TableCell>{carrier.email}</TableCell>
                  <TableCell>{carrier.phone}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${carrier.score}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{carrier.score}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getVigilanceIcon(carrier.vigilanceStatus || 'UNKNOWN')}
                      <span className={getVigilanceColor(carrier.vigilanceStatus || 'UNKNOWN')}>
                        {carrier.vigilanceStatus}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Voir profil
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
