import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const missionCardVariants = cva(
  'rounded-lg border-l-4 bg-white shadow-md transition-all touch-manipulation',
  {
    variants: {
      status: {
        pending: 'border-l-orange-500',
        inProgress: 'border-l-blue-500',
        completed: 'border-l-green-500',
        cancelled: 'border-l-red-500',
        delayed: 'border-l-red-600',
      },
      size: {
        compact: 'p-4',
        default: 'p-6',
        large: 'p-8',
      },
    },
    defaultVariants: {
      status: 'pending',
      size: 'default',
    },
  }
);

export interface MissionCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof missionCardVariants> {
  missionNumber?: string;
  destination?: string;
  eta?: string;
  distance?: string;
  urgent?: boolean;
  onAction?: () => void;
  actionLabel?: string;
  statusLabel?: string;
}

const MissionCard = React.forwardRef<HTMLDivElement, MissionCardProps>(
  (
    {
      className,
      status,
      size,
      missionNumber,
      destination,
      eta,
      distance,
      urgent = false,
      onAction,
      actionLabel,
      statusLabel,
      children,
      ...props
    },
    ref
  ) => {
    const getStatusColor = () => {
      switch (status) {
        case 'pending':
          return 'bg-orange-100 text-orange-800';
        case 'inProgress':
          return 'bg-blue-100 text-blue-800';
        case 'completed':
          return 'bg-green-100 text-green-800';
        case 'cancelled':
          return 'bg-gray-100 text-gray-800';
        case 'delayed':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    const getActionButtonColor = () => {
      switch (status) {
        case 'pending':
          return 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700';
        case 'inProgress':
          return 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700';
        case 'completed':
          return 'bg-green-500 hover:bg-green-600 active:bg-green-700';
        default:
          return 'bg-gray-500 hover:bg-gray-600 active:bg-gray-700';
      }
    };

    return (
      <div
        ref={ref}
        className={cn(missionCardVariants({ status, size, className }))}
        {...props}
      >
        {/* Header avec statut et badge urgence */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {statusLabel && (
              <span
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide',
                  getStatusColor()
                )}
              >
                {statusLabel}
              </span>
            )}
            {urgent && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-600 text-white uppercase tracking-wide animate-pulse">
                Urgent
              </span>
            )}
          </div>
          {missionNumber && (
            <span className="text-sm font-mono text-gray-500">
              #{missionNumber}
            </span>
          )}
        </div>

        {/* Destination */}
        {destination && (
          <div className="mb-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5"
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
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 truncate">
                  {destination}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ETA et Distance */}
        {(eta || distance) && (
          <div className="flex items-center gap-4 mb-6">
            {eta && (
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm text-gray-700 font-medium">{eta}</span>
              </div>
            )}
            {distance && (
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
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                <span className="text-sm text-gray-700 font-medium">
                  {distance}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Contenu custom */}
        {children}

        {/* Bouton d'action principal */}
        {onAction && actionLabel && (
          <button
            onClick={onAction}
            className={cn(
              'w-full min-h-[48px] py-3 px-6 rounded-lg text-white font-semibold text-base transition-colors focus:outline-none focus:ring-4 focus:ring-offset-2',
              getActionButtonColor()
            )}
          >
            {actionLabel}
          </button>
        )}
      </div>
    );
  }
);

MissionCard.displayName = 'MissionCard';

export { MissionCard, missionCardVariants };
