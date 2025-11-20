'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { getCurrentCarrier } from '@/lib/auth';
import { Clock, CheckCircle, Calendar, FileText, TrendingUp, AlertCircle } from 'lucide-react';
// TEMPORAIRE: Désactivé pour déploiement Vercel (dépendance workspace non disponible)
// import { TrainingButton } from '@rt/design-system';

export default function HomePage() {
  const router = useRouter();
  const carrier = getCurrentCarrier();

  useEffect(() => {
    if (!carrier) {
      router.push('/login');
    }
  }, [carrier, router]);

  if (!carrier) return null;

  const quickStats = [
    {
      label: 'Missions en attente',
      value: '3',
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      href: '/missions/pending',
    },
    {
      label: 'Missions acceptées',
      value: '8',
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      href: '/missions/accepted',
    },
    {
      label: 'RDV planifiés',
      value: '12',
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      href: '/planning',
    },
    {
      label: 'Documents à signer',
      value: '2',
      icon: FileText,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      href: '/documents',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* TEMPORAIRE: TrainingButton désactivé pour déploiement Vercel */}
        {/* <TrainingButton toolName="Transporteur" /> */}
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Bienvenue, {carrier.name || carrier.carrierId} !
          </h1>
          <p className="text-primary-100">
            Gérez vos missions, planning et documents en un seul endroit
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(stat.href)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Urgent Missions Alert */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-900">
              <AlertCircle className="w-5 h-5 mr-2" />
              Missions urgentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-800 mb-4">
              Vous avez <strong>3 missions en attente</strong> qui nécessitent une réponse rapide.
              Le SLA expire dans moins de 2 heures pour certaines missions.
            </p>
            <Button
              variant="default"
              onClick={() => router.push('/missions/pending')}
            >
              Voir les missions urgentes
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/missions/pending')}
              >
                <Clock className="w-4 h-4 mr-2" />
                Accepter des missions
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/planning')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Consulter le planning
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/documents')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Uploader des documents
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/profile')}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Voir mes statistiques
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3 text-sm">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Mission ORD-123 acceptée</p>
                  <p className="text-gray-500">Il y a 2 heures</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 text-sm">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">CMR uploadé pour ORD-119</p>
                  <p className="text-gray-500">Il y a 5 heures</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 text-sm">
                <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">RDV confirmé pour demain 14h</p>
                  <p className="text-gray-500">Hier</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
