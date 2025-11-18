import * as React from 'react';
import { cn } from '../lib/utils';

export interface AIRankingBadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  rank: number;
  score?: number;
  showTooltip?: boolean;
  reason?: string;
}

const AIRankingBadge = React.forwardRef<HTMLDivElement, AIRankingBadgeProps>(
  (
    { className, rank, score, showTooltip = true, reason, ...props },
    ref
  ) => {
    const [showDetails, setShowDetails] = React.useState(false);

    const getRankStyle = () => {
      switch (rank) {
        case 1:
          return {
            badge: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 shadow-yellow-200',
            icon: '🥇',
            label: 'Meilleure offre',
          };
        case 2:
          return {
            badge: 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 shadow-gray-200',
            icon: '🥈',
            label: 'Deuxième choix',
          };
        case 3:
          return {
            badge: 'bg-gradient-to-r from-orange-300 to-orange-400 text-orange-900 shadow-orange-200',
            icon: '🥉',
            label: 'Troisième choix',
          };
        default:
          return {
            badge: 'bg-blue-100 text-blue-800 shadow-blue-200',
            icon: '',
            label: `Classement ${rank}`,
          };
      }
    };

    const style = getRankStyle();

    return (
      <div ref={ref} className={cn('relative inline-block', className)} {...props}>
        <div
          className={cn(
            'px-3 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-md',
            style.badge
          )}
          onMouseEnter={() => showTooltip && setShowDetails(true)}
          onMouseLeave={() => setShowDetails(false)}
        >
          {/* Icône IA */}
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>

          <span className="uppercase tracking-wide">
            Top {rank} IA
          </span>

          {score !== undefined && (
            <span className="ml-1 opacity-75">({score}%)</span>
          )}
        </div>

        {/* Tooltip */}
        {showTooltip && showDetails && (
          <div className="absolute z-10 top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-4 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-900" />
            <p className="font-semibold mb-2">{style.label}</p>
            {score !== undefined && (
              <p className="mb-2">Score de confiance : {score}%</p>
            )}
            <p className="text-gray-300">
              {reason ||
                'Cette offre a été classée par notre IA en fonction du prix, de la distance, de la fiabilité du logisticien et de la correspondance avec vos besoins.'}
            </p>
          </div>
        )}
      </div>
    );
  }
);

AIRankingBadge.displayName = 'AIRankingBadge';

export { AIRankingBadge };
