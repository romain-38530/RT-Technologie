import * as React from 'react';
import { cn } from '../lib/utils';

export interface TimelineStep {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'pending';
  timestamp?: Date;
  description?: string;
}

export interface StatusTimelineProps
  extends React.HTMLAttributes<HTMLDivElement> {
  steps: TimelineStep[];
  orientation?: 'vertical' | 'horizontal';
  compact?: boolean;
}

const StatusTimeline = React.forwardRef<HTMLDivElement, StatusTimelineProps>(
  (
    {
      className,
      steps,
      orientation = 'vertical',
      compact = false,
      ...props
    },
    ref
  ) => {
    const getStepColor = (status: TimelineStep['status']) => {
      switch (status) {
        case 'completed':
          return 'bg-green-500 border-green-500 text-green-500';
        case 'current':
          return 'bg-blue-500 border-blue-500 text-blue-500';
        case 'pending':
          return 'bg-gray-200 border-gray-300 text-gray-400';
        default:
          return 'bg-gray-200 border-gray-300 text-gray-400';
      }
    };

    const getLineColor = (
      currentStatus: TimelineStep['status'],
      nextStatus?: TimelineStep['status']
    ) => {
      if (currentStatus === 'completed') {
        return 'bg-green-500';
      }
      return 'bg-gray-300';
    };

    if (orientation === 'horizontal') {
      return (
        <div
          ref={ref}
          className={cn('w-full overflow-x-auto', className)}
          {...props}
        >
          <div className="flex items-center min-w-max px-4 py-6">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                {/* Étape */}
                <div className="flex flex-col items-center min-w-[100px]">
                  {/* Point/Icône */}
                  <div className="relative">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all',
                        getStepColor(step.status),
                        step.status === 'current' && 'ring-4 ring-blue-200',
                        step.status === 'completed' && 'bg-green-500'
                      )}
                    >
                      {step.status === 'completed' ? (
                        <svg
                          className="w-5 h-5 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : step.status === 'current' ? (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      ) : (
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      )}
                    </div>
                  </div>

                  {/* Label */}
                  <div className="mt-3 text-center">
                    <p
                      className={cn(
                        'text-xs font-semibold uppercase tracking-wide',
                        step.status === 'current' && 'text-blue-600',
                        step.status === 'completed' && 'text-green-600',
                        step.status === 'pending' && 'text-gray-500'
                      )}
                    >
                      {step.label}
                    </p>
                    {!compact && step.timestamp && (
                      <p className="text-xs text-gray-500 mt-1">
                        {step.timestamp.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Ligne de connexion */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'h-1 flex-1 mx-2 transition-all',
                      getLineColor(step.status, steps[index + 1]?.status)
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      );
    }

    // Orientation verticale
    return (
      <div ref={ref} className={cn('space-y-0', className)} {...props}>
        {steps.map((step, index) => (
          <div key={step.id} className="relative flex items-start gap-4 pb-8 last:pb-0">
            {/* Ligne verticale */}
            {index < steps.length - 1 && (
              <div className="absolute left-5 top-10 bottom-0 w-1 -translate-x-1/2">
                <div
                  className={cn(
                    'w-full h-full transition-all',
                    getLineColor(step.status, steps[index + 1]?.status)
                  )}
                />
              </div>
            )}

            {/* Point/Icône */}
            <div className="relative z-10">
              <div
                className={cn(
                  'w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all flex-shrink-0',
                  getStepColor(step.status),
                  step.status === 'current' && 'ring-4 ring-blue-200',
                  step.status === 'completed' && 'bg-green-500'
                )}
              >
                {step.status === 'completed' ? (
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : step.status === 'current' ? (
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                ) : (
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                )}
              </div>
            </div>

            {/* Contenu */}
            <div className="flex-1 pt-1">
              <div className="flex items-baseline justify-between">
                <p
                  className={cn(
                    'text-base font-semibold',
                    step.status === 'current' && 'text-blue-600',
                    step.status === 'completed' && 'text-green-600',
                    step.status === 'pending' && 'text-gray-500'
                  )}
                >
                  {step.label}
                </p>
                {step.timestamp && (
                  <p className="text-sm text-gray-500 ml-2">
                    {step.timestamp.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
              {!compact && step.description && (
                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }
);

StatusTimeline.displayName = 'StatusTimeline';

export { StatusTimeline };
export type { TimelineStep };
