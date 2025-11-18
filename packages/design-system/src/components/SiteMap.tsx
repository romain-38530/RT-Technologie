import * as React from 'react';
import { cn } from '../lib/utils';

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  label?: string;
  type?: 'current' | 'destination' | 'warehouse' | 'need';
  onClick?: () => void;
}

export interface SiteMapProps extends React.HTMLAttributes<HTMLDivElement> {
  markers?: MapMarker[];
  center?: { latitude: number; longitude: number };
  zoom?: number;
  height?: number;
  searchRadius?: number;
  onMarkerClick?: (marker: MapMarker) => void;
}

const SiteMap = React.forwardRef<HTMLDivElement, SiteMapProps>(
  (
    {
      className,
      markers = [],
      center,
      zoom = 10,
      height = 400,
      searchRadius,
      onMarkerClick,
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        {/* Carte (placeholder - intégrer Google Maps ou Mapbox) */}
        <div
          className="relative bg-gray-200 rounded-lg overflow-hidden border border-gray-300"
          style={{ height }}
        >
          {/* Placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-3">
              <svg
                className="w-20 h-20 mx-auto text-gray-400"
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
              <p className="text-sm font-medium text-gray-600">
                Intégrer Google Maps / Mapbox
              </p>
              <p className="text-xs text-gray-500">
                Affichage des {markers.length} site(s)
              </p>
            </div>
          </div>

          {/* Simulation de marqueurs */}
          {markers.slice(0, 5).map((marker, index) => (
            <div
              key={marker.id}
              className="absolute"
              style={{
                left: `${20 + index * 15}%`,
                top: `${30 + (index % 3) * 20}%`,
              }}
            >
              <button
                onClick={() => onMarkerClick?.(marker)}
                className={cn(
                  'w-8 h-8 rounded-full shadow-lg border-2 border-white hover:scale-110 transition-transform',
                  marker.type === 'warehouse' && 'bg-blue-600',
                  marker.type === 'need' && 'bg-orange-500',
                  marker.type === 'current' && 'bg-green-500',
                  marker.type === 'destination' && 'bg-red-500',
                  !marker.type && 'bg-gray-600'
                )}
                title={marker.label}
              />
            </div>
          ))}

          {/* Rayon de recherche */}
          {searchRadius && (
            <div className="absolute top-4 right-4 px-3 py-2 bg-white rounded-lg shadow-md text-sm font-medium text-gray-700">
              Rayon : {searchRadius} km
            </div>
          )}

          {/* Contrôles de zoom */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <button className="w-10 h-10 bg-white rounded-lg shadow-md hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center">
              <span className="text-xl font-semibold text-gray-700">+</span>
            </button>
            <button className="w-10 h-10 bg-white rounded-lg shadow-md hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center">
              <span className="text-xl font-semibold text-gray-700">−</span>
            </button>
          </div>
        </div>

        {/* Légende */}
        {markers.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-4">
            {[...new Set(markers.map((m) => m.type))].map((type) => {
              const labels = {
                warehouse: { label: 'Entrepôts', color: 'bg-blue-600' },
                need: { label: 'Besoins', color: 'bg-orange-500' },
                current: { label: 'Position actuelle', color: 'bg-green-500' },
                destination: { label: 'Destination', color: 'bg-red-500' },
              };
              const info = labels[type as keyof typeof labels];
              if (!info) return null;

              return (
                <div key={type} className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-3 h-3 rounded-full border-2 border-white shadow',
                      info.color
                    )}
                  />
                  <span className="text-xs text-gray-600">{info.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

SiteMap.displayName = 'SiteMap';

export { SiteMap };
export type { MapMarker };
