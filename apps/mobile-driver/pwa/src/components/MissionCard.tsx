'use client';

import React from 'react';
import { Mission, MissionStatus } from '@/shared/models/Mission';
import { MISSION_STATUS_LABELS, STATUS_COLORS } from '@/shared/constants';
import { formatDistance } from '@/lib/utils/geofencing';

interface MissionCardProps {
  mission: Mission;
  onClick?: () => void;
  showDetails?: boolean;
}

export const MissionCard: React.FC<MissionCardProps> = ({
  mission,
  onClick,
  showDetails = false,
}) => {
  const statusColor = STATUS_COLORS[mission.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.PENDING;
  const statusLabel = MISSION_STATUS_LABELS[mission.status as keyof typeof MISSION_STATUS_LABELS] || mission.status;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 ${
        onClick ? 'cursor-pointer active:shadow-lg' : ''
      }`}
      style={{ borderLeftColor: statusColor }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-driver-lg font-bold text-rt-dark">
            Mission {mission.code}
          </h3>
          <div
            className="inline-block px-3 py-1 rounded-full text-sm font-semibold text-white mt-1"
            style={{ backgroundColor: statusColor }}
          >
            {statusLabel}
          </div>
        </div>
      </div>

      {/* Loading Point */}
      <div className="mb-3">
        <div className="flex items-start">
          <div className="w-8 h-8 rounded-full bg-rt-blue flex items-center justify-center text-white font-bold mr-3 flex-shrink-0">
            A
          </div>
          <div className="flex-1">
            <p className="text-sm text-rt-gray">Chargement</p>
            <p className="text-driver font-semibold text-rt-dark">
              {mission.loadingPoint.name}
            </p>
            <p className="text-sm text-rt-gray">
              {mission.loadingPoint.city}
            </p>
          </div>
        </div>
      </div>

      {/* Delivery Point */}
      <div className="mb-3">
        <div className="flex items-start">
          <div className="w-8 h-8 rounded-full bg-rt-green flex items-center justify-center text-white font-bold mr-3 flex-shrink-0">
            B
          </div>
          <div className="flex-1">
            <p className="text-sm text-rt-gray">Livraison</p>
            <p className="text-driver font-semibold text-rt-dark">
              {mission.deliveryPoint.name}
            </p>
            <p className="text-sm text-rt-gray">
              {mission.deliveryPoint.city}
            </p>
          </div>
        </div>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-rt-gray">Véhicule</p>
              <p className="font-semibold text-rt-dark">
                {mission.vehicle.registration}
              </p>
            </div>
            {mission.cargo.weight && (
              <div>
                <p className="text-rt-gray">Poids</p>
                <p className="font-semibold text-rt-dark">
                  {mission.cargo.weight} kg
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ETA */}
      {mission.tracking.eta && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center text-sm">
            <svg
              className="w-5 h-5 text-rt-blue mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-rt-gray">
              ETA:{' '}
              <span className="font-semibold text-rt-dark">
                {new Date(
                  mission.status === MissionStatus.EN_ROUTE_TO_LOADING ||
                    mission.status === MissionStatus.PENDING
                    ? mission.tracking.eta.toLoading || ''
                    : mission.tracking.eta.toDelivery || ''
                ).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionCard;
