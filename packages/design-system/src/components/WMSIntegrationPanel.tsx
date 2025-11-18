import * as React from 'react';
import { cn } from '../lib/utils';

export interface WMSMovement {
  id: string;
  type: 'in' | 'out';
  quantity: number;
  product: string;
  timestamp: Date;
}

export interface WMSIntegrationPanelProps
  extends React.HTMLAttributes<HTMLDivElement> {
  isConnected?: boolean;
  systemName?: string;
  lastSync?: Date;
  currentStock?: number;
  recentMovements?: WMSMovement[];
  alerts?: string[];
  onConnect?: () => void;
  onDisconnect?: () => void;
  onSync?: () => void;
}

const WMSIntegrationPanel = React.forwardRef<
  HTMLDivElement,
  WMSIntegrationPanelProps
>(
  (
    {
      className,
      isConnected = false,
      systemName = 'WMS',
      lastSync,
      currentStock,
      recentMovements = [],
      alerts = [],
      onConnect,
      onDisconnect,
      onSync,
      ...props
    },
    ref
  ) => {
    const [isSyncing, setIsSyncing] = React.useState(false);

    const handleSync = async () => {
      setIsSyncing(true);
      await onSync?.();
      setTimeout(() => setIsSyncing(false), 1000);
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border-2 bg-white shadow-sm',
          isConnected ? 'border-green-300' : 'border-gray-300',
          className
        )}
        {...props}
      >
        {/* Header */}
        <div
          className={cn(
            'px-6 py-4 border-b flex items-center justify-between',
            isConnected ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-3 h-3 rounded-full',
                isConnected
                  ? 'bg-green-500 animate-pulse'
                  : 'bg-gray-400'
              )}
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Intégration {systemName}
              </h3>
              <p className="text-sm text-gray-600">
                {isConnected ? 'Connecté' : 'Non connecté'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {isConnected ? (
              <>
                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 active:bg-blue-100 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <svg
                    className={cn(
                      'w-4 h-4',
                      isSyncing && 'animate-spin'
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
                  Synchroniser
                </button>
                {onDisconnect && (
                  <button
                    onClick={onDisconnect}
                    className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 active:bg-red-100 transition-colors"
                  >
                    Déconnecter
                  </button>
                )}
              </>
            ) : (
              onConnect && (
                <button
                  onClick={onConnect}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
                >
                  Connecter
                </button>
              )
            )}
          </div>
        </div>

        {/* Contenu */}
        {isConnected ? (
          <div className="p-6 space-y-6">
            {/* Dernière synchronisation */}
            {lastSync && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Dernière synchronisation :</span>
                <span className="font-medium text-gray-900">
                  {lastSync.toLocaleString('fr-FR')}
                </span>
              </div>
            )}

            {/* Stock actuel */}
            {currentStock !== undefined && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-700">
                    Stock actuel
                  </span>
                  <span className="text-2xl font-bold text-blue-900">
                    {currentStock.toLocaleString()} palettes
                  </span>
                </div>
              </div>
            )}

            {/* Alertes */}
            {alerts.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Alertes ({alerts.length})
                </h4>
                <div className="space-y-2">
                  {alerts.map((alert, index) => (
                    <div
                      key={index}
                      className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2"
                    >
                      <svg
                        className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-sm text-orange-800">{alert}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mouvements récents */}
            {recentMovements.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Mouvements récents
                </h4>
                <div className="space-y-2">
                  {recentMovements.map((movement) => (
                    <div
                      key={movement.id}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center',
                            movement.type === 'in'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          )}
                        >
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
                              d={
                                movement.type === 'in'
                                  ? 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4'
                                  : 'M17 8l4 4m0 0l-4 4m4-4H3'
                              }
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {movement.product}
                          </p>
                          <p className="text-xs text-gray-500">
                            {movement.timestamp.toLocaleString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          'text-sm font-semibold',
                          movement.type === 'in'
                            ? 'text-green-700'
                            : 'text-red-700'
                        )}
                      >
                        {movement.type === 'in' ? '+' : '-'}
                        {movement.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              WMS non connecté
            </h4>
            <p className="text-sm text-gray-600 mb-6">
              Connectez votre système WMS pour synchroniser automatiquement
              votre inventaire et vos mouvements de stock.
            </p>
            {onConnect && (
              <button
                onClick={onConnect}
                className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
              >
                Configurer la connexion
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);

WMSIntegrationPanel.displayName = 'WMSIntegrationPanel';

export { WMSIntegrationPanel };
export type { WMSMovement };
