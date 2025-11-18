import * as React from 'react';
import { cn } from '../lib/utils';

export interface CapacityGaugeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  current: number;
  total: number;
  unit?: string;
  label?: string;
  showPercentage?: boolean;
  warningThreshold?: number;
  criticalThreshold?: number;
}

const CapacityGauge = React.forwardRef<HTMLDivElement, CapacityGaugeProps>(
  (
    {
      className,
      current,
      total,
      unit = 'palettes',
      label,
      showPercentage = true,
      warningThreshold = 80,
      criticalThreshold = 95,
      ...props
    },
    ref
  ) => {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    const available = total - current;

    const getColorScheme = () => {
      if (percentage >= criticalThreshold) {
        return {
          bg: 'bg-red-100',
          bar: 'bg-red-500',
          text: 'text-red-700',
          badge: 'bg-red-500 text-white',
        };
      }
      if (percentage >= warningThreshold) {
        return {
          bg: 'bg-orange-100',
          bar: 'bg-orange-500',
          text: 'text-orange-700',
          badge: 'bg-orange-500 text-white',
        };
      }
      return {
        bg: 'bg-green-100',
        bar: 'bg-green-500',
        text: 'text-green-700',
        badge: 'bg-green-500 text-white',
      };
    };

    const colors = getColorScheme();

    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {label && (
              <span className="text-sm font-semibold text-gray-700">
                {label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('text-sm font-medium', colors.text)}>
              {current.toLocaleString()} / {total.toLocaleString()} {unit}
            </span>
            {showPercentage && (
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-bold',
                  colors.badge
                )}
              >
                {percentage}%
              </span>
            )}
          </div>
        </div>

        {/* Barre de progression */}
        <div className="relative">
          <div className={cn('h-4 rounded-full overflow-hidden', colors.bg)}>
            <div
              className={cn(
                'h-full transition-all duration-500 ease-out rounded-full',
                colors.bar
              )}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>

          {/* Seuils visuels */}
          {warningThreshold < 100 && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-gray-400"
              style={{ left: `${warningThreshold}%` }}
              title={`Seuil d'alerte : ${warningThreshold}%`}
            />
          )}
        </div>

        {/* Info disponibilité */}
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Disponible : {available.toLocaleString()} {unit}</span>
          {percentage >= criticalThreshold && (
            <span className="flex items-center gap-1 text-red-600 font-semibold">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Capacité critique
            </span>
          )}
          {percentage >= warningThreshold &&
            percentage < criticalThreshold && (
              <span className="flex items-center gap-1 text-orange-600 font-semibold">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Attention
              </span>
            )}
        </div>
      </div>
    );
  }
);

CapacityGauge.displayName = 'CapacityGauge';

export { CapacityGauge };
