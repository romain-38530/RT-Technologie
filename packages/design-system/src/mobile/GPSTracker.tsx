import * as React from 'react';
import { cn } from '../lib/utils';

export interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface GPSTrackerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  currentPosition?: GPSPosition;
  destinationPosition?: GPSPosition;
  eta?: string;
  distance?: string;
  isDeviated?: boolean;
  onRefreshPosition?: () => void;
  mapHeight?: number;
}

const GPSTracker = React.forwardRef<HTMLDivElement, GPSTrackerProps>(
  (
    {
      className,
      currentPosition,
      destinationPosition,
      eta,
      distance,
      isDeviated = false,
      onRefreshPosition,
      mapHeight = 300,
      ...props
    },
    ref
  ) => {
    const [isLoading, setIsLoading] = React.useState(false);

    const handleRefresh = async () => {
      setIsLoading(true);
      await onRefreshPosition?.();
      setTimeout(() => setIsLoading(false), 500);
    };

    return (
      <div ref={ref} className={cn('space-y-4', className)} {...props}>
        {/* Carte (placeholder - intégrer Google Maps ou Mapbox) */}
        <div
          className="relative bg-gray-200 rounded-lg overflow-hidden"
          style={{ height: mapHeight }}
        >
          {/* Placeholder pour la carte */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-2">
              <svg
                className="w-16 h-16 mx-auto text-gray-400"
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
              <p className="text-sm text-gray-500">
                Intégrer Google Maps / Mapbox ici
              </p>
            </div>
          </div>

          {/* Marqueur position actuelle (simulé) */}
          {currentPosition && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg" />
                <div className="absolute inset-0 w-4 h-4 bg-blue-400 rounded-full animate-ping opacity-75" />
              </div>
            </div>
          )}

          {/* Alerte déviation */}
          {isDeviated && (
            <div className="absolute top-4 left-4 right-4">
              <div className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-semibold">
                  Alerte : Déviation détectée
                </span>
              </div>
            </div>
          )}

          {/* Bouton refresh position */}
          {onRefreshPosition && (
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 transition-all"
            >
              <svg
                className={cn(
                  'w-6 h-6 text-blue-600',
                  isLoading && 'animate-spin'
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Informations de navigation */}
        <div className="grid grid-cols-2 gap-4">
          {/* ETA */}
          {eta && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className="w-5 h-5 text-blue-600"
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
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                  Arrivée
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{eta}</p>
            </div>
          )}

          {/* Distance */}
          {distance && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className="w-5 h-5 text-green-600"
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
                <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                  Distance
                </span>
              </div>
              <p className="text-2xl font-bold text-green-900">{distance}</p>
            </div>
          )}
        </div>

        {/* Précision GPS */}
        {currentPosition?.accuracy && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              Précision GPS : ±{currentPosition.accuracy.toFixed(0)}m
            </span>
          </div>
        )}
      </div>
    );
  }
);

GPSTracker.displayName = 'GPSTracker';

export { GPSTracker };
export type { GPSPosition };
