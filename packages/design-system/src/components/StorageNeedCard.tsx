import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const storageNeedCardVariants = cva(
  'rounded-lg border bg-white shadow-sm transition-all hover:shadow-md',
  {
    variants: {
      status: {
        open: 'border-blue-200 bg-blue-50/30',
        closed: 'border-gray-300 bg-gray-50',
        assigned: 'border-green-200 bg-green-50/30',
        expired: 'border-red-200 bg-red-50/30',
      },
      size: {
        compact: 'p-4',
        default: 'p-6',
      },
    },
    defaultVariants: {
      status: 'open',
      size: 'default',
    },
  }
);

export interface StorageNeedCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof storageNeedCardVariants> {
  title?: string;
  type?: string;
  volume?: string | number;
  location?: string;
  duration?: string;
  startDate?: Date;
  endDate?: Date;
  offersCount?: number;
  temperature?: string;
  adr?: boolean;
  onViewDetails?: () => void;
  onViewOffers?: () => void;
}

const StorageNeedCard = React.forwardRef<HTMLDivElement, StorageNeedCardProps>(
  (
    {
      className,
      status,
      size,
      title,
      type,
      volume,
      location,
      duration,
      startDate,
      endDate,
      offersCount = 0,
      temperature,
      adr = false,
      onViewDetails,
      onViewOffers,
      children,
      ...props
    },
    ref
  ) => {
    const getStatusBadge = () => {
      const badges = {
        open: { label: 'Ouvert', color: 'bg-blue-100 text-blue-800' },
        closed: { label: 'Fermé', color: 'bg-gray-100 text-gray-800' },
        assigned: { label: 'Attribué', color: 'bg-green-100 text-green-800' },
        expired: { label: 'Expiré', color: 'bg-red-100 text-red-800' },
      };
      return badges[status || 'open'];
    };

    const badge = getStatusBadge();

    return (
      <div
        ref={ref}
        className={cn(storageNeedCardVariants({ status, size, className }))}
        {...props}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                {title}
              </h3>
            )}
            {type && (
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                {type}
              </p>
            )}
          </div>
          <span
            className={cn(
              'px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide flex-shrink-0',
              badge.color
            )}
          >
            {badge.label}
          </span>
        </div>

        {/* Détails principaux */}
        <div className="space-y-3 mb-4">
          {/* Volume */}
          {volume && (
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
              <span className="text-sm text-gray-700">
                <span className="font-semibold">{volume}</span>{' '}
                {typeof volume === 'number' ? 'palettes' : ''}
              </span>
            </div>
          )}

          {/* Localisation */}
          {location && (
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
              <span className="text-sm text-gray-700">{location}</span>
            </div>
          )}

          {/* Durée */}
          {(duration || (startDate && endDate)) && (
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm text-gray-700">
                {duration ||
                  `${startDate?.toLocaleDateString()} - ${endDate?.toLocaleDateString()}`}
              </span>
            </div>
          )}
        </div>

        {/* Badges spéciaux */}
        {(temperature || adr) && (
          <div className="flex gap-2 mb-4">
            {temperature && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                {temperature}
              </span>
            )}
            {adr && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                ADR
              </span>
            )}
          </div>
        )}

        {/* Contenu custom */}
        {children}

        {/* Footer avec nombre d'offres et actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-400"
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
            <span className="text-sm font-medium text-gray-700">
              {offersCount} {offersCount > 1 ? 'offres reçues' : 'offre reçue'}
            </span>
          </div>

          <div className="flex gap-2">
            {onViewDetails && (
              <button
                onClick={onViewDetails}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                Détails
              </button>
            )}
            {onViewOffers && offersCount > 0 && (
              <button
                onClick={onViewOffers}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
              >
                Voir les offres
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

StorageNeedCard.displayName = 'StorageNeedCard';

export { StorageNeedCard, storageNeedCardVariants };
