'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { MissionCard } from '@/components/MissionCard';
import { getPendingMissions, acceptMission, refuseMission, Mission } from '@/services/api';
import { getCurrentCarrier } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function PendingMissionsPage() {
  const router = useRouter();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const carrier = getCurrentCarrier();

  useEffect(() => {
    if (!carrier) {
      router.push('/login');
      return;
    }
    loadMissions();
    // Refresh every 30 seconds
    const interval = setInterval(loadMissions, 30000);
    return () => clearInterval(interval);
  }, [carrier, router]);

  const loadMissions = async () => {
    if (!carrier) return;
    try {
      setError(null);
      const data = await getPendingMissions(carrier.carrierId);
      setMissions(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (orderId: string) => {
    if (!carrier) return;
    try {
      await acceptMission(orderId, carrier.carrierId);
      // Refresh missions
      await loadMissions();
      // Show success
      alert('Mission acceptée avec succès !');
    } catch (err) {
      alert('Erreur lors de l\'acceptation: ' + (err instanceof Error ? err.message : 'Erreur'));
    }
  };

  const handleRefuse = async (orderId: string) => {
    if (!carrier) return;
    if (!confirm('Êtes-vous sûr de vouloir refuser cette mission ?')) return;
    try {
      await refuseMission(orderId, carrier.carrierId);
      // Remove from list
      setMissions(missions.filter(m => m.id !== orderId));
      alert('Mission refusée');
    } catch (err) {
      alert('Erreur lors du refus: ' + (err instanceof Error ? err.message : 'Erreur'));
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Missions en attente</h1>
          <p className="mt-1 text-sm text-gray-500">
            Acceptez ou refusez les missions qui vous sont proposées avant expiration du SLA
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
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Aucune mission en attente</h3>
            <p className="text-gray-500 mt-1">Vous n'avez pas de missions à accepter pour le moment</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {missions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              showActions={true}
              onAccept={handleAccept}
              onRefuse={handleRefuse}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}
