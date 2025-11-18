'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mission } from '@/shared/models/Mission';
import { missionsApi } from '@/lib/api/missions';
import { storage } from '@/lib/utils/storage';
import MissionCard from '@/components/MissionCard';
import { TrainingButton } from '@rt/design-system';

export default function DashboardPage() {
  const router = useRouter();
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);
  const [pastMissions, setPastMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Get user profile
      const profile = storage.getUserProfile();
      setUserProfile(profile);

      // Get current mission
      const current = await missionsApi.getCurrentMission();
      setCurrentMission(current);

      // Get past missions if employee
      if (profile?.type === 'EMPLOYEE' && profile?.id) {
        const history = await missionsApi.getMissionsHistory(profile.id);
        setPastMissions(history.slice(0, 5)); // Last 5 missions
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    storage.clearToken();
    storage.clearCurrentMission();
    router.push('/auth/login');
  };

  const handleMissionClick = (mission: Mission) => {
    storage.setCurrentMission(mission);
    router.push('/mission/tracking');
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rt-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-driver text-rt-gray">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <TrainingButton toolName="Application Conducteur" size="small" />
      {/* Header */}
      <div className="safe-top bg-rt-blue text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-driver-xl font-bold">
              Bonjour {userProfile?.firstName || 'Conducteur'}
            </h1>
            <p className="text-white opacity-90 mt-1">
              {userProfile?.type === 'EMPLOYEE' ? 'Salarié' : 'Sous-traitant'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center active:bg-opacity-30"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 safe-bottom">
        {/* Current Mission */}
        {currentMission ? (
          <div className="mb-6">
            <h2 className="text-driver-lg font-bold text-rt-dark mb-3">
              Mission en cours
            </h2>
            <MissionCard
              mission={currentMission}
              onClick={() => handleMissionClick(currentMission)}
              showDetails={true}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-center">
            <svg
              className="w-16 h-16 text-rt-gray mx-auto mb-3 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-driver text-rt-gray mb-4">
              Aucune mission en cours
            </p>
            <Link
              href="/auth/qr-scan"
              className="inline-block h-touch px-6 bg-rt-blue text-white rounded-lg text-driver font-semibold active:bg-opacity-80"
            >
              Scanner une mission
            </Link>
          </div>
        )}

        {/* Past Missions (Employees only) */}
        {userProfile?.type === 'EMPLOYEE' && pastMissions.length > 0 && (
          <div>
            <h2 className="text-driver-lg font-bold text-rt-dark mb-3">
              Missions récentes
            </h2>
            {pastMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onClick={() => handleMissionClick(mission)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 safe-bottom">
        <div className="flex justify-around py-2">
          <Link
            href="/mission/dashboard"
            className="flex flex-col items-center py-2 px-4 text-rt-blue"
          >
            <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
            </svg>
            <span className="text-xs font-semibold">Tableau de bord</span>
          </Link>

          {currentMission && (
            <Link
              href="/mission/tracking"
              className="flex flex-col items-center py-2 px-4 text-rt-gray"
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-xs font-semibold">Suivi</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
