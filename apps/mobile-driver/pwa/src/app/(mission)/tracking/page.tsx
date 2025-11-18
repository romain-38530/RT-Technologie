'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mission, MissionStatus } from '@/shared/models/Mission';
import { missionsApi } from '@/lib/api/missions';
import { trackingApi } from '@/lib/api/tracking';
import { storage } from '@/lib/utils/storage';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import { useOfflineSync } from '@/lib/hooks/useOfflineSync';
import { checkGeofenceStatus, formatDistance, formatDuration } from '@/lib/utils/geofencing';
import { MISSION_STATUS_LABELS, STATUS_COLORS } from '@/shared/constants';

const STATUS_PROGRESSION = {
  [MissionStatus.PENDING]: 0,
  [MissionStatus.EN_ROUTE_TO_LOADING]: 1,
  [MissionStatus.ARRIVED_LOADING]: 2,
  [MissionStatus.LOADED]: 3,
  [MissionStatus.EN_ROUTE_TO_DELIVERY]: 4,
  [MissionStatus.ARRIVED_DELIVERY]: 5,
  [MissionStatus.DELIVERED]: 6,
};

export default function TrackingPage() {
  const router = useRouter();
  const [mission, setMission] = useState<Mission | null>(null);
  const [eta, setEta] = useState<any>(null);
  const [currentDistance, setCurrentDistance] = useState<number | null>(null);
  const { isOnline, addPendingUpdate } = useOfflineSync();
  const [lastGeofenceCheck, setLastGeofenceCheck] = useState<any>(null);

  const handlePositionUpdate = useCallback(
    async (position: any) => {
      if (!mission) return;

      const gpsData = {
        missionId: mission.id,
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
        timestamp: new Date(position.timestamp).toISOString(),
        speed: position.speed,
        heading: position.heading,
      };

      try {
        if (isOnline) {
          await trackingApi.sendGPSPosition(gpsData);

          // Check geofence
          const geofenceStatus = checkGeofenceStatus(
            { latitude: position.latitude, longitude: position.longitude },
            mission.loadingPoint.coordinates,
            mission.deliveryPoint.coordinates
          );

          setLastGeofenceCheck(geofenceStatus);
          setCurrentDistance(
            mission.status === MissionStatus.EN_ROUTE_TO_LOADING ||
              mission.status === MissionStatus.ARRIVED_LOADING
              ? geofenceStatus.distanceToLoading
              : geofenceStatus.distanceToDelivery
          );

          // Auto-update status based on geofence
          if (
            mission.status === MissionStatus.EN_ROUTE_TO_LOADING &&
            geofenceStatus.inLoadingZone
          ) {
            await updateMissionStatus(MissionStatus.ARRIVED_LOADING);
          } else if (
            mission.status === MissionStatus.EN_ROUTE_TO_DELIVERY &&
            geofenceStatus.inDeliveryZone
          ) {
            await updateMissionStatus(MissionStatus.ARRIVED_DELIVERY);
          }

          // Calculate ETA
          const destination =
            mission.status === MissionStatus.EN_ROUTE_TO_LOADING ||
            mission.status === MissionStatus.ARRIVED_LOADING
              ? mission.loadingPoint.coordinates
              : mission.deliveryPoint.coordinates;

          const etaData = await trackingApi.calculateETA(
            mission.id,
            { latitude: position.latitude, longitude: position.longitude },
            destination
          );
          setEta(etaData);
        } else {
          // Store for offline sync
          addPendingUpdate('GPS', gpsData);
        }
      } catch (error) {
        console.error('Error sending GPS position:', error);
        addPendingUpdate('GPS', gpsData);
      }
    },
    [mission, isOnline, addPendingUpdate]
  );

  const { position, isTracking, startTracking, stopTracking } = useGeolocation({
    onPositionUpdate: handlePositionUpdate,
  });

  useEffect(() => {
    // Load mission
    const storedMission = storage.getCurrentMission();
    if (storedMission) {
      setMission(storedMission);
      // Start GPS tracking automatically
      startTracking();
    } else {
      router.push('/mission/dashboard');
    }

    return () => {
      stopTracking();
    };
  }, [router, startTracking, stopTracking]);

  const updateMissionStatus = async (newStatus: MissionStatus) => {
    if (!mission || !position) return;

    try {
      await missionsApi.updateMissionStatus(mission.id, newStatus, {
        latitude: position.latitude,
        longitude: position.longitude,
        timestamp: new Date().toISOString(),
      });

      const updatedMission = { ...mission, status: newStatus };
      setMission(updatedMission);
      storage.setCurrentMission(updatedMission);
    } catch (error) {
      console.error('Error updating mission status:', error);
      if (!isOnline) {
        addPendingUpdate('STATUS', {
          missionId: mission.id,
          status: newStatus,
          latitude: position.latitude,
          longitude: position.longitude,
          timestamp: new Date().toISOString(),
        });
      }
    }
  };

  const getNextStatus = (): MissionStatus | null => {
    if (!mission) return null;

    const currentProgression = STATUS_PROGRESSION[mission.status];
    const statusEntries = Object.entries(STATUS_PROGRESSION);
    const nextEntry = statusEntries.find(([_, prog]) => prog === currentProgression + 1);

    return nextEntry ? (nextEntry[0] as MissionStatus) : null;
  };

  const handleNextStep = async () => {
    const nextStatus = getNextStatus();
    if (nextStatus) {
      await updateMissionStatus(nextStatus);
    }
  };

  const openNavigation = (lat: number, lng: number, name: string) => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination=${encodeURIComponent(name)}`;
    const wazeUrl = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;

    // Show choice dialog
    if (confirm('Ouvrir dans Google Maps? (Annuler pour Waze)')) {
      window.open(googleMapsUrl, '_blank');
    } else {
      window.open(wazeUrl, '_blank');
    }
  };

  if (!mission) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rt-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-driver text-rt-gray">Chargement...</p>
        </div>
      </div>
    );
  }

  const statusColor = STATUS_COLORS[mission.status as keyof typeof STATUS_COLORS];
  const statusLabel = MISSION_STATUS_LABELS[mission.status as keyof typeof MISSION_STATUS_LABELS];
  const destination =
    mission.status === MissionStatus.EN_ROUTE_TO_LOADING ||
    mission.status === MissionStatus.ARRIVED_LOADING ||
    mission.status === MissionStatus.PENDING
      ? mission.loadingPoint
      : mission.deliveryPoint;

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="safe-top bg-rt-blue text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-driver-lg font-bold">Mission {mission.code}</h1>
            <div
              className="inline-block px-3 py-1 rounded-full text-sm font-semibold text-white mt-1"
              style={{ backgroundColor: statusColor }}
            >
              {statusLabel}
            </div>
          </div>
          {!isOnline && (
            <div className="bg-rt-orange px-3 py-1 rounded-full">
              <span className="text-sm font-semibold">Hors ligne</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto safe-bottom">
        {/* GPS Status */}
        {isTracking && position && (
          <div className="bg-rt-green text-white p-3 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
            <span className="text-sm font-semibold">
              GPS actif - Précision: {Math.round(position.accuracy)}m
            </span>
          </div>
        )}

        {/* Destination Card */}
        <div className="p-4">
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex items-start mb-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-3 flex-shrink-0"
                style={{ backgroundColor: statusColor }}
              >
                {destination === mission.loadingPoint ? 'A' : 'B'}
              </div>
              <div className="flex-1">
                <p className="text-sm text-rt-gray">
                  {destination === mission.loadingPoint
                    ? 'Chargement'
                    : 'Livraison'}
                </p>
                <p className="text-driver-lg font-bold text-rt-dark">
                  {destination.name}
                </p>
                <p className="text-driver text-rt-gray">{destination.address}</p>
                <p className="text-driver text-rt-gray">
                  {destination.postalCode} {destination.city}
                </p>
              </div>
            </div>

            {/* ETA & Distance */}
            {eta && currentDistance && (
              <div className="flex items-center justify-around py-3 border-t border-gray-200 mt-3">
                <div className="text-center">
                  <p className="text-sm text-rt-gray">Distance</p>
                  <p className="text-driver-lg font-bold text-rt-dark">
                    {formatDistance(currentDistance)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-rt-gray">Durée estimée</p>
                  <p className="text-driver-lg font-bold text-rt-dark">
                    {formatDuration(eta.duration)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-rt-gray">Arrivée prévue</p>
                  <p className="text-driver-lg font-bold text-rt-dark">
                    {new Date(eta.eta).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Button */}
            <button
              onClick={() =>
                openNavigation(
                  destination.coordinates.latitude,
                  destination.coordinates.longitude,
                  destination.name
                )
              }
              className="w-full h-touch bg-rt-blue text-white rounded-lg text-driver font-semibold mt-3 active:bg-opacity-80 flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              Ouvrir navigation
            </button>

            {/* Contact Info */}
            {destination.contacts && destination.contacts.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-rt-gray mb-2">Contact</p>
                {destination.contacts.map((contact, idx) => (
                  <div key={idx} className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-rt-dark">{contact.name}</p>
                      <p className="text-sm text-rt-gray">{contact.role}</p>
                    </div>
                    <a
                      href={`tel:${contact.phone}`}
                      className="w-10 h-10 bg-rt-green rounded-full flex items-center justify-center text-white active:bg-opacity-80"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* Instructions */}
            {destination.instructions && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-rt-gray mb-2">Instructions</p>
                <p className="text-driver text-rt-dark">{destination.instructions}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {getNextStatus() && (
              <button
                onClick={handleNextStep}
                className="w-full h-touch bg-rt-green text-white rounded-lg text-driver font-semibold active:bg-opacity-80"
              >
                {mission.status === MissionStatus.ARRIVED_LOADING
                  ? 'Marquer comme chargé'
                  : mission.status === MissionStatus.LOADED
                  ? 'Départ vers livraison'
                  : mission.status === MissionStatus.ARRIVED_DELIVERY
                  ? 'Marquer comme livré'
                  : 'Étape suivante'}
              </button>
            )}

            {(mission.status === MissionStatus.ARRIVED_LOADING ||
              mission.status === MissionStatus.LOADED) && (
              <Link
                href="/mission/signature?type=loading"
                className="block w-full h-touch bg-rt-orange text-white rounded-lg text-driver font-semibold active:bg-opacity-80 flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                Signature chargement
              </Link>
            )}

            {mission.status === MissionStatus.ARRIVED_DELIVERY && (
              <Link
                href="/mission/signature?type=delivery"
                className="block w-full h-touch bg-rt-orange text-white rounded-lg text-driver font-semibold active:bg-opacity-80 flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                Signature livraison
              </Link>
            )}

            <Link
              href="/mission/documents"
              className="block w-full h-touch bg-white border-2 border-rt-blue text-rt-blue rounded-lg text-driver font-semibold active:bg-gray-100 flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Documents
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
