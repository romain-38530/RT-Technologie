import { Carrier } from '../lib/api';

interface CarrierCardProps {
  carrier: Carrier;
  onClick?: () => void;
  selected?: boolean;
}

export default function CarrierCard({ carrier, onClick, selected }: CarrierCardProps) {
  const scoringColor = carrier.scoring >= 85 ? '#10b981' : carrier.scoring >= 70 ? '#f59e0b' : '#ef4444';

  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        border: selected ? '2px solid #667eea' : '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 16,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        boxShadow: selected ? '0 4px 12px rgba(102,126,234,0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
            {carrier.name}
            {carrier.premium && (
              <span style={{
                marginLeft: 8,
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                color: '#fff',
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 4,
                fontWeight: 700
              }}>
                PREMIUM
              </span>
            )}
          </h3>
          <p style={{ fontSize: 12, color: '#666', margin: 0 }}>{carrier.email}</p>
        </div>
        <div style={{
          background: scoringColor,
          color: '#fff',
          padding: '4px 8px',
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 700
        }}>
          {carrier.scoring}
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#666' }}>
        <div style={{ marginBottom: 4 }}>
          <strong>VAT:</strong> {carrier.vat}
        </div>
        <div>
          <strong>Status:</strong>{' '}
          <span style={{ color: carrier.blocked ? '#ef4444' : '#10b981', fontWeight: 600 }}>
            {carrier.blocked ? 'Bloque' : 'Actif'}
          </span>
        </div>
      </div>
    </div>
  );
}
