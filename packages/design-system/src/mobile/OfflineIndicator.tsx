import * as React from 'react';
import { cn } from '../lib/utils';

export interface OfflineIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  isOnline?: boolean;
  pendingCount?: number;
  onRetry?: () => void;
  position?: 'top' | 'bottom';
  showDetails?: boolean;
}

const OfflineIndicator = React.forwardRef<
  HTMLDivElement,
  OfflineIndicatorProps
>(
  (
    {
      className,
      isOnline = true,
      pendingCount = 0,
      onRetry,
      position = 'top',
      showDetails = false,
      ...props
    },
    ref
  ) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    // Ne rien afficher si en ligne et pas de données en attente
    if (isOnline && pendingCount === 0) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          'fixed left-0 right-0 z-50 shadow-lg transition-all',
          position === 'top' ? 'top-0' : 'bottom-0',
          className
        )}
        {...props}
      >
        {/* Banner principal */}
        <div
          className={cn(
            'px-4 py-3 flex items-center justify-between',
            !isOnline
              ? 'bg-orange-500 text-white'
              : 'bg-blue-500 text-white'
          )}
        >
          <div className="flex items-center gap-3 flex-1">
            {/* Icône */}
            <div className="flex-shrink-0">
              {!isOnline ? (
                <svg
                  className="w-5 h-5 animate-pulse"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                    clipRule="evenodd"
                  />
                  <line
                    x1="2"
                    y1="2"
                    x2="18"
                    y2="18"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              )}
            </div>

            {/* Texte */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">
                {!isOnline ? 'Mode hors-ligne' : 'Synchronisation en attente'}
              </p>
              {!isOnline && (
                <p className="text-xs opacity-90">
                  Les modifications seront synchronisées automatiquement
                </p>
              )}
            </div>

            {/* Badge compteur */}
            {pendingCount > 0 && (
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 bg-white bg-opacity-30 rounded-full text-xs font-bold">
                  {pendingCount}
                </span>
              </div>
            )}

            {/* Bouton toggle détails */}
            {showDetails && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex-shrink-0 p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              >
                <svg
                  className={cn(
                    'w-5 h-5 transition-transform',
                    isExpanded && 'rotate-180'
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Bouton retry */}
          {onRetry && isOnline && pendingCount > 0 && (
            <button
              onClick={onRetry}
              className="ml-3 px-4 py-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 active:bg-opacity-40 rounded-lg text-sm font-semibold transition-colors"
            >
              Synchroniser
            </button>
          )}
        </div>

        {/* Détails étendus */}
        {isExpanded && showDetails && (
          <div className="bg-white border-t border-gray-200 px-4 py-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Statut de connexion :</span>
                <span
                  className={cn(
                    'font-semibold',
                    isOnline ? 'text-green-600' : 'text-orange-600'
                  )}
                >
                  {isOnline ? 'Connecté' : 'Hors-ligne'}
                </span>
              </div>
              {pendingCount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Données en attente de synchronisation :
                  </span>
                  <span className="font-semibold text-blue-600">
                    {pendingCount}
                  </span>
                </div>
              )}
              {!isOnline && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-xs text-orange-800">
                    Vos modifications sont enregistrées localement et seront
                    automatiquement synchronisées dès que la connexion sera
                    rétablie.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

OfflineIndicator.displayName = 'OfflineIndicator';

export { OfflineIndicator };
