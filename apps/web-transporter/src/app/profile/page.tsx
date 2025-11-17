'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getCurrentCarrier } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { User, Mail, Building2, Shield, TrendingUp, Award, Clock } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const carrier = getCurrentCarrier();

  useEffect(() => {
    if (!carrier) {
      router.push('/login');
    }
  }, [carrier, router]);

  if (!carrier) return null;

  // Demo data - in real app, fetch from API
  const stats = {
    totalMissions: 156,
    acceptedMissions: 142,
    acceptanceRate: 91,
    averageDelay: 12, // minutes
    scoring: 4.7,
    vigilanceStatus: 'OK',
  };

  const getVigilanceBadge = (status: string) => {
    switch (status) {
      case 'OK':
        return <Badge variant="success">OK</Badge>;
      case 'WARNING':
        return <Badge variant="warning">Attention</Badge>;
      case 'BLOCKED':
        return <Badge variant="danger">Bloqué</Badge>;
      default:
        return <Badge variant="default">Inconnu</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
          <p className="mt-1 text-sm text-gray-500">
            Informations transporteur et statistiques de performance
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Informations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500">Nom</div>
                <div className="mt-1 text-base text-gray-900">
                  {carrier.name || 'Non défini'}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Email</div>
                <div className="mt-1 text-base text-gray-900 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  {carrier.email || 'Non défini'}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">ID Transporteur</div>
                <div className="mt-1 text-base text-gray-900 flex items-center">
                  <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                  {carrier.carrierId}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vigilance Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Statut Vigilance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-2">État actuel</div>
                {getVigilanceBadge(stats.vigilanceStatus)}
              </div>
              <div className="text-sm text-gray-600">
                <p>Votre statut vigilance est vérifié avant chaque attribution de mission.</p>
                <p className="mt-2">
                  Un statut <strong>OK</strong> signifie que tous vos documents sont à jour.
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-sm font-medium text-green-900">Documents à jour</div>
                <ul className="mt-2 text-xs text-green-700 space-y-1">
                  <li>• Assurance RC</li>
                  <li>• Licence de transport</li>
                  <li>• Attestation TVA</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Performance Stats */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Statistiques de performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">
                    {stats.totalMissions}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Missions totales</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {stats.acceptanceRate}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Taux d'acceptation</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 flex items-center justify-center">
                    <Award className="w-8 h-8 mr-1" />
                    {stats.scoring}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Scoring moyen</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 flex items-center justify-center">
                    <Clock className="w-8 h-8 mr-1" />
                    {stats.averageDelay}m
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Délai moyen</div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Historique récent
                </h4>
                <div className="space-y-2">
                  {[
                    { id: 'ORD-001', date: '2025-11-15', status: 'Livré', score: 5 },
                    { id: 'ORD-002', date: '2025-11-14', status: 'Livré', score: 4.8 },
                    { id: 'ORD-003', date: '2025-11-13', status: 'Livré', score: 4.9 },
                  ].map((mission) => (
                    <div
                      key={mission.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="font-medium text-sm">{mission.id}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(mission.date).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="success">{mission.status}</Badge>
                        <div className="text-sm font-medium text-gray-900">
                          ⭐ {mission.score}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
