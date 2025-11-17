import AIBadge from './AIBadge';

interface Price {
  label: string;
  value: number;
  currency: string;
  isAI?: boolean;
  description?: string;
}

interface PriceComparatorProps {
  prices: Price[];
  onSelect?: (index: number) => void;
  selectedIndex?: number;
}

export default function PriceComparator({ prices, onSelect, selectedIndex }: PriceComparatorProps) {
  const minPrice = Math.min(...prices.map(p => p.value));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${prices.length}, 1fr)`, gap: 16 }}>
      {prices.map((price, idx) => {
        const isMin = price.value === minPrice;
        const isSelected = selectedIndex === idx;

        return (
          <div
            key={idx}
            onClick={() => onSelect?.(idx)}
            style={{
              background: isSelected ? '#f0f9ff' : '#fff',
              border: isSelected ? '2px solid #667eea' : isMin ? '2px solid #10b981' : '1px solid #e5e7eb',
              borderRadius: 12,
              padding: 20,
              cursor: onSelect ? 'pointer' : 'default',
              transition: 'all 0.2s',
              position: 'relative'
            }}
          >
            {isMin && !isSelected && (
              <div style={{
                position: 'absolute',
                top: -10,
                right: 12,
                background: '#10b981',
                color: '#fff',
                fontSize: 10,
                padding: '4px 8px',
                borderRadius: 4,
                fontWeight: 700
              }}>
                MEILLEUR PRIX
              </div>
            )}

            <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: '#666', margin: 0 }}>{price.label}</h4>
              {price.isAI && <AIBadge size="sm" />}
            </div>

            <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937', marginBottom: 4 }}>
              {price.value.toFixed(2)} {price.currency}
            </div>

            {price.description && (
              <p style={{ fontSize: 12, color: '#666', margin: 0 }}>{price.description}</p>
            )}

            {isSelected && onSelect && (
              <div style={{
                marginTop: 12,
                padding: '6px 12px',
                background: '#667eea',
                color: '#fff',
                borderRadius: 6,
                fontSize: 12,
                textAlign: 'center',
                fontWeight: 600
              }}>
                Selectionne
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
