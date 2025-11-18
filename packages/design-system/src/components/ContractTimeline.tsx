import * as React from 'react';
import { cn } from '../lib/utils';

export interface ContractPhase {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'pending';
  date?: Date;
  description?: string;
}

export interface ContractTimelineProps
  extends React.HTMLAttributes<HTMLDivElement> {
  startDate?: Date;
  endDate?: Date;
  phases: ContractPhase[];
  currentPhase?: string;
  progress?: number;
  compact?: boolean;
}

const ContractTimeline = React.forwardRef<
  HTMLDivElement,
  ContractTimelineProps
>(
  (
    {
      className,
      startDate,
      endDate,
      phases,
      currentPhase,
      progress,
      compact = false,
      ...props
    },
    ref
  ) => {
    const calculateProgress = () => {
      if (progress !== undefined) return progress;

      const completedPhases = phases.filter((p) => p.status === 'completed').length;
      return (completedPhases / phases.length) * 100;
    };

    const progressPercentage = calculateProgress();

    const getPhaseColor = (status: ContractPhase['status']) => {
      switch (status) {
        case 'completed':
          return 'text-green-600 bg-green-100 border-green-500';
        case 'current':
          return 'text-blue-600 bg-blue-100 border-blue-500';
        case 'pending':
          return 'text-gray-400 bg-gray-100 border-gray-300';
        default:
          return 'text-gray-400 bg-gray-100 border-gray-300';
      }
    };

    return (
      <div ref={ref} className={cn('space-y-6', className)} {...props}>
        {/* Dates du contrat */}
        {(startDate || endDate) && (
          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
            {startDate && (
              <div>
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
                  Début
                </p>
                <p className="text-base font-bold text-blue-900">
                  {startDate.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}
            <div className="flex-1 mx-4">
              <svg
                className="w-full h-2 text-blue-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 100 2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M0 1 L100 1"
                  strokeDasharray="4 4"
                />
              </svg>
            </div>
            {endDate && (
              <div className="text-right">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
                  Fin
                </p>
                <p className="text-base font-bold text-blue-900">
                  {endDate.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Barre de progression globale */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Progression du contrat
            </span>
            <span className="text-sm font-bold text-blue-600">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Timeline des phases */}
        <div className="relative">
          {phases.map((phase, index) => {
            const isLast = index === phases.length - 1;
            const colors = getPhaseColor(phase.status);

            return (
              <div key={phase.id} className="relative flex gap-4 pb-8 last:pb-0">
                {/* Ligne verticale */}
                {!isLast && (
                  <div className="absolute left-5 top-11 bottom-0 w-1 -translate-x-1/2">
                    <div
                      className={cn(
                        'w-full h-full',
                        phase.status === 'completed'
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      )}
                    />
                  </div>
                )}

                {/* Icône de phase */}
                <div className="relative z-10">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full border-4 flex items-center justify-center flex-shrink-0 transition-all',
                      colors,
                      phase.status === 'current' && 'ring-4 ring-blue-200 animate-pulse'
                    )}
                  >
                    {phase.status === 'completed' ? (
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : phase.status === 'current' ? (
                      <div className="w-3 h-3 bg-blue-600 rounded-full" />
                    ) : (
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    )}
                  </div>
                </div>

                {/* Contenu de la phase */}
                <div className="flex-1 pt-1">
                  <div className="flex items-baseline justify-between mb-1">
                    <h4
                      className={cn(
                        'text-base font-semibold',
                        phase.status === 'completed' && 'text-green-600',
                        phase.status === 'current' && 'text-blue-600',
                        phase.status === 'pending' && 'text-gray-500'
                      )}
                    >
                      {phase.label}
                    </h4>
                    {phase.date && (
                      <span className="text-sm text-gray-500 ml-2">
                        {phase.date.toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                  {!compact && phase.description && (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {phase.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

ContractTimeline.displayName = 'ContractTimeline';

export { ContractTimeline };
export type { ContractPhase };
