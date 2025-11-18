import * as React from 'react';
import { cn } from '../lib/utils';

export interface ComparableOffer {
  id: string;
  providerName: string;
  price: number;
  distance: string;
  aiScore?: number;
  aiRank?: number;
  services: string[];
  deliveryTime?: string;
  [key: string]: any;
}

export interface OfferComparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  offers: ComparableOffer[];
  onSelect?: (offerId: string) => void;
  selectedOfferId?: string;
  maxOffers?: number;
}

const OfferComparator = React.forwardRef<
  HTMLDivElement,
  OfferComparatorProps
>(
  (
    {
      className,
      offers,
      onSelect,
      selectedOfferId,
      maxOffers = 4,
      ...props
    },
    ref
  ) => {
    const displayedOffers = offers.slice(0, maxOffers);

    const getCellHighlight = (
      offerId: string,
      value: number,
      allValues: number[]
    ) => {
      const min = Math.min(...allValues);
      const max = Math.max(...allValues);

      if (value === min && value === max) return '';
      if (value === min) return 'bg-green-50 font-semibold text-green-700';
      if (value === max) return 'bg-red-50 text-red-700';
      return '';
    };

    return (
      <div
        ref={ref}
        className={cn('overflow-x-auto', className)}
        {...props}
      >
        <table className="min-w-full border-collapse bg-white rounded-lg overflow-hidden shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                Critères
              </th>
              {displayedOffers.map((offer) => (
                <th
                  key={offer.id}
                  className={cn(
                    'px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider border-r border-gray-300 last:border-r-0 min-w-[150px]',
                    offer.aiRank && offer.aiRank <= 3
                      ? 'bg-gradient-to-b from-yellow-100 to-yellow-50'
                      : 'bg-gray-100',
                    selectedOfferId === offer.id &&
                      'ring-2 ring-inset ring-blue-500'
                  )}
                >
                  <div className="space-y-2">
                    <div className="font-bold text-gray-900 text-sm">
                      {offer.providerName}
                    </div>
                    {offer.aiRank && offer.aiRank <= 3 && (
                      <div
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold',
                          offer.aiRank === 1 && 'bg-yellow-400 text-yellow-900',
                          offer.aiRank === 2 && 'bg-gray-400 text-gray-900',
                          offer.aiRank === 3 && 'bg-orange-400 text-orange-900'
                        )}
                      >
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Top {offer.aiRank}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {/* Prix */}
            <tr>
              <td className="px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-50 border-r border-gray-300">
                Prix total
              </td>
              {displayedOffers.map((offer) => {
                const allPrices = displayedOffers.map((o) => o.price);
                return (
                  <td
                    key={offer.id}
                    className={cn(
                      'px-4 py-3 text-center text-sm border-r border-gray-300 last:border-r-0',
                      getCellHighlight(offer.id, offer.price, allPrices),
                      selectedOfferId === offer.id && 'bg-blue-50/50'
                    )}
                  >
                    <span className="text-lg font-bold">
                      {offer.price.toLocaleString('fr-FR')} €
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* Distance */}
            <tr>
              <td className="px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-50 border-r border-gray-300">
                Distance
              </td>
              {displayedOffers.map((offer) => (
                <td
                  key={offer.id}
                  className={cn(
                    'px-4 py-3 text-center text-sm border-r border-gray-300 last:border-r-0',
                    selectedOfferId === offer.id && 'bg-blue-50/50'
                  )}
                >
                  {offer.distance}
                </td>
              ))}
            </tr>

            {/* Score IA */}
            {displayedOffers.some((o) => o.aiScore) && (
              <tr>
                <td className="px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-50 border-r border-gray-300">
                  Score IA
                </td>
                {displayedOffers.map((offer) => (
                  <td
                    key={offer.id}
                    className={cn(
                      'px-4 py-3 text-center text-sm border-r border-gray-300 last:border-r-0',
                      selectedOfferId === offer.id && 'bg-blue-50/50'
                    )}
                  >
                    {offer.aiScore ? (
                      <div className="flex items-center justify-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={cn(
                              'w-4 h-4',
                              i < Math.round((offer.aiScore! / 100) * 5)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            )}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="ml-1 text-xs font-medium">
                          {offer.aiScore}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                ))}
              </tr>
            )}

            {/* Services */}
            <tr>
              <td className="px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-50 border-r border-gray-300">
                Services
              </td>
              {displayedOffers.map((offer) => (
                <td
                  key={offer.id}
                  className={cn(
                    'px-4 py-3 text-center text-sm border-r border-gray-300 last:border-r-0',
                    selectedOfferId === offer.id && 'bg-blue-50/50'
                  )}
                >
                  <div className="space-y-1">
                    {offer.services.slice(0, 3).map((service, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-green-700 flex items-center justify-center gap-1"
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
                      </div>
                    ))}
                    {offer.services.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{offer.services.length - 3} autres
                      </div>
                    )}
                  </div>
                </td>
              ))}
            </tr>

            {/* Action */}
            <tr className="bg-gray-50">
              <td className="px-4 py-3 border-r border-gray-300"></td>
              {displayedOffers.map((offer) => (
                <td
                  key={offer.id}
                  className={cn(
                    'px-4 py-3 text-center border-r border-gray-300 last:border-r-0',
                    selectedOfferId === offer.id && 'bg-blue-50'
                  )}
                >
                  <button
                    onClick={() => onSelect?.(offer.id)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full',
                      selectedOfferId === offer.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600'
                    )}
                  >
                    {selectedOfferId === offer.id ? 'Sélectionné' : 'Sélectionner'}
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
);

OfferComparator.displayName = 'OfferComparator';

export { OfferComparator };
export type { ComparableOffer };
