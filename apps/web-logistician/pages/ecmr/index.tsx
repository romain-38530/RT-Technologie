import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface ECMRDocument {
  id: string;
  orderId: string;
  carrier: string;
  type: 'reception' | 'expedition';
  status: 'draft' | 'signed_dock' | 'signed_delivery' | 'completed';
  createdAt: string;
  signedDockAt?: string;
  signedDeliveryAt?: string;
}

export default function ECMRList() {
  const router = useRouter();
  const [documents, setDocuments] = useState<ECMRDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'pending' | 'completed'>('all');

  useEffect(() => {
    const token = localStorage.getItem('logistician_jwt');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchDocuments();
  }, [router]);

  const fetchDocuments = async () => {
    try {
      // Mock data - Replace with actual API call to eCMR service
      setDocuments([
        {
          id: 'ECMR-001',
          orderId: 'ORD-001',
          carrier: 'Transport ABC',
          type: 'reception',
          status: 'signed_dock',
          createdAt: '2024-11-17T09:30:00Z',
          signedDockAt: '2024-11-17T09:45:00Z'
        },
        {
          id: 'ECMR-002',
          orderId: 'ORD-002',
          carrier: 'Logistics XYZ',
          type: 'expedition',
          status: 'completed',
          createdAt: '2024-11-17T10:00:00Z',
          signedDockAt: '2024-11-17T10:15:00Z',
          signedDeliveryAt: '2024-11-17T14:30:00Z'
        },
        {
          id: 'ECMR-003',
          orderId: 'ORD-003',
          carrier: 'Express Transport',
          type: 'reception',
          status: 'draft',
          createdAt: '2024-11-17T11:00:00Z'
        }
      ]);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (filter === 'all') return true;
    if (filter === 'draft') return doc.status === 'draft';
    if (filter === 'pending') return doc.status === 'signed_dock';
    if (filter === 'completed') return doc.status === 'completed';
    return true;
  });

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Chargement...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600 }}>E-CMR</h2>
        <button
          onClick={() => router.push('/ecmr/new')}
          style={{
            padding: '12px 24px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            minHeight: '48px'
          }}
        >
          + Nouveau CMR
        </button>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
          Tous ({documents.length})
        </FilterButton>
        <FilterButton active={filter === 'draft'} onClick={() => setFilter('draft')}>
          Brouillons ({documents.filter(d => d.status === 'draft').length})
        </FilterButton>
        <FilterButton active={filter === 'pending'} onClick={() => setFilter('pending')}>
          En attente ({documents.filter(d => d.status === 'signed_dock').length})
        </FilterButton>
        <FilterButton active={filter === 'completed'} onClick={() => setFilter('completed')}>
          Terminés ({documents.filter(d => d.status === 'completed').length})
        </FilterButton>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredDocuments.length === 0 ? (
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            Aucun document trouvé
          </div>
        ) : (
          filteredDocuments.map(doc => (
            <ECMRCard key={doc.id} document={doc} onClick={() => router.push(`/ecmr/${doc.id}`)} />
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

function ECMRCard({ document, onClick }: { document: ECMRDocument; onClick: () => void }) {
  const statusConfig = {
    draft: { color: '#6b7280', bg: '#f3f4f6', label: 'Brouillon' },
    signed_dock: { color: '#f59e0b', bg: '#fef3c7', label: 'Signé au quai' },
    signed_delivery: { color: '#3b82f6', bg: '#dbeafe', label: 'Signé livraison' },
    completed: { color: '#10b981', bg: '#d1fae5', label: 'Terminé' }
  };

  const typeConfig = {
    reception: { label: 'Réception', color: '#8b5cf6' },
    expedition: { label: 'Expédition', color: '#10b981' }
  };

  const status = statusConfig[document.status];
  const type = typeConfig[document.type];

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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ flex: 1, minWidth: '200px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <span style={{
            padding: '4px 12px',
            background: type.color + '20',
            color: type.color,
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 600
          }}>
            {type.label}
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
        <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>
          {document.id}
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Commande: {document.orderId}
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Transporteur: {document.carrier}
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Créé le {new Date(document.createdAt).toLocaleDateString('fr-FR')} à {new Date(document.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div style={{ fontSize: '24px' }}>
        →
      </div>
    </div>
  );
}
