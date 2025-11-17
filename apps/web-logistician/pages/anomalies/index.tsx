import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface Anomaly {
  id: string;
  orderId: string;
  type: 'missing_pallets' | 'damaged_goods' | 'wrong_delivery' | 'quality_issue' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  description: string;
  reportedBy: string;
  reportedAt: string;
  resolvedAt?: string;
  photos?: string[];
  impactedParties: ('industry' | 'transporter' | 'recipient')[];
}

export default function Anomalies() {
  const router = useRouter();
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'investigating' | 'resolved'>('open');

  useEffect(() => {
    const token = localStorage.getItem('logistician_jwt');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchAnomalies();
  }, [router]);

  const fetchAnomalies = async () => {
    try {
      // Mock data - Replace with actual API call
      setAnomalies([
        {
          id: 'ANO-001',
          orderId: 'ORD-007',
          type: 'missing_pallets',
          severity: 'high',
          status: 'investigating',
          description: '2 palettes manquantes lors de la réception',
          reportedBy: 'Logisticien',
          reportedAt: '2024-11-17T13:15:00Z',
          impactedParties: ['industry', 'transporter']
        },
        {
          id: 'ANO-002',
          orderId: 'ORD-006',
          type: 'damaged_goods',
          severity: 'medium',
          status: 'open',
          description: 'Palette endommagée, cartons déchirés',
          reportedBy: 'Logisticien',
          reportedAt: '2024-11-17T11:30:00Z',
          impactedParties: ['transporter', 'recipient']
        },
        {
          id: 'ANO-003',
          orderId: 'ORD-004',
          type: 'quality_issue',
          severity: 'low',
          status: 'resolved',
          description: 'Emballage non conforme aux spécifications',
          reportedBy: 'Logisticien',
          reportedAt: '2024-11-16T14:20:00Z',
          resolvedAt: '2024-11-17T09:00:00Z',
          impactedParties: ['industry']
        },
        {
          id: 'ANO-004',
          orderId: 'ORD-010',
          type: 'wrong_delivery',
          severity: 'critical',
          status: 'open',
          description: 'Marchandise destinée à un autre site',
          reportedBy: 'Logisticien',
          reportedAt: '2024-11-17T15:45:00Z',
          impactedParties: ['industry', 'transporter', 'recipient']
        }
      ]);
    } catch (error) {
      console.error('Error fetching anomalies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnomalies = anomalies.filter(a => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Chargement...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600 }}>Anomalies</h2>
        <button
          onClick={() => router.push('/anomalies/new')}
          style={{
            padding: '12px 24px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            minHeight: '48px'
          }}
        >
          + Déclarer une anomalie
        </button>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
          Toutes ({anomalies.length})
        </FilterButton>
        <FilterButton active={filter === 'open'} onClick={() => setFilter('open')}>
          Ouvertes ({anomalies.filter(a => a.status === 'open').length})
        </FilterButton>
        <FilterButton active={filter === 'investigating'} onClick={() => setFilter('investigating')}>
          En cours ({anomalies.filter(a => a.status === 'investigating').length})
        </FilterButton>
        <FilterButton active={filter === 'resolved'} onClick={() => setFilter('resolved')}>
          Résolues ({anomalies.filter(a => a.status === 'resolved' || a.status === 'closed').length})
        </FilterButton>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredAnomalies.length === 0 ? (
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            Aucune anomalie trouvée
          </div>
        ) : (
          filteredAnomalies.map(anomaly => (
            <AnomalyCard
              key={anomaly.id}
              anomaly={anomaly}
              onClick={() => router.push(`/anomalies/${anomaly.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 20px',
        background: active ? '#2563eb' : 'white',
        color: active ? 'white' : '#6b7280',
        border: active ? 'none' : '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: active ? 600 : 500,
        cursor: 'pointer',
        minHeight: '44px'
      }}
    >
      {children}
    </button>
  );
}

function AnomalyCard({ anomaly, onClick }: { anomaly: Anomaly; onClick: () => void }) {
  const typeConfig = {
    missing_pallets: { icon: '📦', label: 'Palettes manquantes', color: '#ef4444' },
    damaged_goods: { icon: '💥', label: 'Marchandise endommagée', color: '#f59e0b' },
    wrong_delivery: { icon: '🚫', label: 'Mauvaise livraison', color: '#dc2626' },
    quality_issue: { icon: '⚠', label: 'Problème qualité', color: '#f59e0b' },
    other: { icon: '❓', label: 'Autre', color: '#6b7280' }
  };

  const severityConfig = {
    low: { color: '#10b981', bg: '#d1fae5', label: 'Faible' },
    medium: { color: '#f59e0b', bg: '#fef3c7', label: 'Moyenne' },
    high: { color: '#f97316', bg: '#ffedd5', label: 'Élevée' },
    critical: { color: '#ef4444', bg: '#fee2e2', label: 'Critique' }
  };

  const statusConfig = {
    open: { color: '#ef4444', bg: '#fee2e2', label: 'Ouverte' },
    investigating: { color: '#f59e0b', bg: '#fef3c7', label: 'Enquête en cours' },
    resolved: { color: '#10b981', bg: '#d1fae5', label: 'Résolue' },
    closed: { color: '#6b7280', bg: '#f3f4f6', label: 'Fermée' }
  };

  const type = typeConfig[anomaly.type];
  const severity = severityConfig[anomaly.severity];
  const status = statusConfig[anomaly.status];

  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        borderLeft: `4px solid ${severity.color}`
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span style={{
              padding: '4px 12px',
              background: severity.bg,
              color: severity.color,
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600
            }}>
              {severity.label}
            </span>
            <span style={{
              padding: '4px 12px',
              background: status.bg,
              color: status.color,
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600
            }}>
              {status.label}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '32px' }}>{type.icon}</span>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 600 }}>{anomaly.id}</div>
              <div style={{ fontSize: '14px', color: type.color, fontWeight: 500 }}>{type.label}</div>
            </div>
          </div>

          <div style={{ fontSize: '14px', color: '#1f2937', marginBottom: '8px', lineHeight: '1.5' }}>
            {anomaly.description}
          </div>

          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Commande: {anomaly.orderId}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Déclaré le {new Date(anomaly.reportedAt).toLocaleDateString('fr-FR')} à {new Date(anomaly.reportedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
            {anomaly.impactedParties.map(party => (
              <span
                key={party}
                style={{
                  padding: '2px 8px',
                  background: '#f3f4f6',
                  color: '#6b7280',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              >
                {party === 'industry' ? 'Industriel' : party === 'transporter' ? 'Transporteur' : 'Destinataire'}
              </span>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '24px' }}>
          →
        </div>
      </div>
    </div>
  );
}
