'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { MissionCard } from '@/components/MissionCard';
import { getAcceptedMissions, Mission, proposeRDV } from '@/services/api';
import { getCurrentCarrier } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AcceptedMissionsPage() {
  const router = useRouter();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMission, setSelectedMission] = useState<string | null>(null);
  const carrier = getCurrentCarrier();

  useEffect(() => {
    if (!carrier) {
      router.push('/login');
      return;
    }
    loadMissions();
  }, [carrier, router]);

  const loadMissions = async () => {
    if (!carrier) return;
    try {
      setError(null);
      const data = await getAcceptedMissions(carrier.carrierId);
      setMissions(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleProposeRDV = async (orderId: string) => {
    // In a real app, this would open a modal with time slots
    const date = prompt('Date (YYYY-MM-DD):');
    const time = prompt('Heure (HH:MM):');

    if (!date || !time) return;

    try {
      await proposeRDV(orderId, date, time);
      alert('Créneau RDV proposé avec succès !');
      router.push('/planning');
    } catch (err) {
      alert('Erreur: ' + (err instanceof Error ? err.message : 'Erreur'));
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Missions acceptées</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez vos missions acceptées et proposez des créneaux RDV
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900">Erreur</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && missions.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-gray-400 mb-2">
              <Calendar className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Aucune mission acceptée</h3>
            <p className="text-gray-500 mt-1">
              Consultez les missions en attente pour accepter de nouvelles missions
            </p>
            <Button className="mt-4" onClick={() => router.push('/missions/pending')}>
              Voir les missions en attente
            </Button>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {missions.map((mission) => (
            <div key={mission.id} className="space-y-2">
              <MissionCard mission={mission} />
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleProposeRDV(mission.id)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Proposer RDV
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push(`/documents?orderId=${mission.id}`)}
                >
                  Voir documents
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
