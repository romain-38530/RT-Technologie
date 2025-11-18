import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const offerCardVariants = cva(
  'rounded-lg border bg-white shadow-sm transition-all',
  {
    variants: {
      highlighted: {
        true: 'border-2 border-yellow-400 bg-yellow-50/30 shadow-lg',
        false: 'border-gray-200 hover:shadow-md',
      },
      selected: {
        true: 'ring-2 ring-blue-500',
        false: '',
      },
    },
    defaultVariants: {
      highlighted: false,
      selected: false,
    },
  }
);

export interface OfferCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof offerCardVariants> {
  providerName?: string;
  providerLogo?: string;
  price?: number;
  currency?: string;
  aiScore?: number;
  aiRank?: number;
  distance?: string;
  services?: string[];
  siteName?: string;
  onAccept?: () => void;
  onNegotiate?: () => void;
  onReject?: () => void;
  onViewDetails?: () => void;
}

const OfferCard = React.forwardRef<HTMLDivElement, OfferCardProps>(
  (
    {
      className,
      highlighted,
      selected,
      providerName,
      providerLogo,
      price,
      currency = '€',
      aiScore,
      aiRank,
      distance,
      services = [],
      siteName,
      onAccept,
      onNegotiate,
      onReject,
      onViewDetails,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(offerCardVariants({ highlighted, selected, className }))}
        {...props}
      >
        <div className="p-6">
          {/* Header avec logo et ranking IA */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Logo */}
              {providerLogo ? (
                <img
                  src={providerLogo}
                  alt={providerName}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">
                    {providerName?.charAt(0) || 'L'}
                  </span>
                </div>
              )}

              {/* Nom */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {providerName || 'Logisticien'}
                </h3>
                {siteName && (
                  <p className="text-sm text-gray-600 truncate">{siteName}</p>
                )}
              </div>
            </div>

            {/* Badge IA Ranking */}
            {aiRank && aiRank <= 3 && (
              <div
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 flex-shrink-0',
                  aiRank === 1 &&
                    'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900',
                  aiRank === 2 &&
                    'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800',
                  aiRank === 3 &&
                    'bg-gradient-to-r from-orange-300 to-orange-400 text-orange-900'
                )}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Top {aiRank} IA
              </div>
            )}
          </div>

          {/* Prix mis en avant */}
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium mb-1">
                  Prix total
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {price?.toLocaleString('fr-FR')}{currency}
                </p>
              </div>
              {aiScore && (
                <div className="text-right">
                  <p className="text-xs text-blue-600 font-medium mb-1">
                    Score IA
                  </p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={cn(
                          'w-5 h-5',
                          i < Math.round((aiScore / 100) * 5)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        )}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-1 text-sm font-bold text-blue-900">
                      {aiScore}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Distance */}
          {distance && (
            <div className="flex items-center gap-2 mb-4">
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
              <span className="text-sm text-gray-700 font-medium">
                {distance}
              </span>
            </div>
          )}

          {/* Services inclus */}
          {services.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Services inclus
              </p>
              <div className="flex flex-wrap gap-2">
                {services.map((service, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-green-50 border border-green-200 text-green-700 text-xs font-medium rounded flex items-center gap-1"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contenu custom */}
          {children}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-2">
          {onReject && (
            <button
              onClick={onReject}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 active:bg-red-100 transition-colors"
            >
              Refuser
            </button>
          )}
          {onNegotiate && (
            <button
              onClick={onNegotiate}
              className="px-4 py-2 text-sm font-medium text-orange-700 bg-white border border-orange-300 rounded-lg hover:bg-orange-50 active:bg-orange-100 transition-colors"
            >
              Négocier
            </button>
          )}
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              Détails
            </button>
          )}
          {onAccept && (
            <button
              onClick={onAccept}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
            >
              Accepter
            </button>
          )}
        </div>
      </div>
    );
  }
);

OfferCard.displayName = 'OfferCard';

export { OfferCard, offerCardVariants };
