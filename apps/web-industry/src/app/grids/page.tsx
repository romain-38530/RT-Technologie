'use client'

import { useState } from 'react'
import Link from 'next/link'
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
import { Plus, Upload } from 'lucide-react'
import { useOrigins, useGrids } from '@/lib/hooks'

export default function GridsPage() {
  const ownerOrgId = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || 'IND-1'
  const { data: origins, isLoading: originsLoading } = useOrigins(ownerOrgId)
  const { data: grids, isLoading: gridsLoading } = useGrids({ ownerOrgId })

  // Mock data for demonstration
  const mockOrigins = [
    { id: 'PARIS', label: 'Paris Hub', city: 'Paris', country: 'FR' },
    { id: 'LYON', label: 'Lyon Hub', city: 'Lyon', country: 'FR' },
  ]

  const mockGrids = [
    { origin: 'PARIS', mode: 'FTL', lines: 15 },
    { origin: 'PARIS', mode: 'LTL', lines: 25 },
    { origin: 'LYON', mode: 'FTL', lines: 12 },
  ]

  const displayOrigins = origins && origins.length > 0 ? origins : mockOrigins
  const displayGrids = grids && grids.length > 0
    ? grids.map(g => ({ origin: g.origin, mode: g.mode, lines: g.lines.length }))
    : mockGrids

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Grilles tarifaires</h2>
          <p className="text-muted-foreground">
            Gerez vos origins et grilles tarifaires FTL/LTL
          </p>
        </div>
        <Link href="/grids/upload">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Uploader une grille
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Origins</CardTitle>
                <CardDescription>
                  Points de depart de vos expeditions
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {originsLoading ? (
              <p className="text-sm text-muted-foreground">Chargement...</p>
            ) : (
              <div className="space-y-2">
                {displayOrigins.map((origin) => (
                  <div
                    key={origin.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{origin.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {origin.city}, {origin.country}
                      </p>
                    </div>
                    <Badge variant="outline">{origin.id}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grilles actives</CardTitle>
            <CardDescription>
              Grilles tarifaires configurees
            </CardDescription>
          </CardHeader>
          <CardContent>
            {gridsLoading ? (
              <p className="text-sm text-muted-foreground">Chargement...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Origin</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Lignes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayGrids.map((grid, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{grid.origin}</TableCell>
                      <TableCell>
                        <Badge variant={grid.mode === 'FTL' ? 'default' : 'secondary'}>
                          {grid.mode}
                        </Badge>
                      </TableCell>
                      <TableCell>{grid.lines}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
