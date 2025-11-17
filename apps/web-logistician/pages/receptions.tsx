import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';

interface Reception {
  id: string;
  orderId: string;
  carrier: string;
  origin: string;
  expectedPallets: number;
  receivedPallets?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'anomaly';
  scheduledAt: string;
  arrivedAt?: string;
  completedAt?: string;
  photos?: string[];
  notes?: string;
}

export default function Receptions() {
  const router = useRouter();
  const [receptions, setReceptions] = useState<Reception[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('pending');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedReception, setSelectedReception] = useState<Reception | null>(null);
  const [receivedPallets, setReceivedPallets] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('logistician_jwt');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchReceptions();
  }, [router]);

  const fetchReceptions = async () => {
    try {
      // Mock data - Replace with actual API call
      setReceptions([
        {
          id: 'RCP-001',
          orderId: 'ORD-001',
          carrier: 'Transport ABC',
          origin: 'Paris',
          expectedPallets: 20,
          receivedPallets: 20,
          status: 'completed',
          scheduledAt: '2024-11-17T09:00:00Z',
          arrivedAt: '2024-11-17T09:15:00Z',
          completedAt: '2024-11-17T10:30:00Z'
        },
        {
          id: 'RCP-002',
          orderId: 'ORD-003',
          carrier: 'Express Transport',
          origin: 'Lyon',
          expectedPallets: 15,
          status: 'in_progress',
          scheduledAt: '2024-11-17T11:00:00Z',
          arrivedAt: '2024-11-17T11:10:00Z'
        },
        {
          id: 'RCP-003',
          orderId: 'ORD-004',
          carrier: 'Fast Delivery',
          origin: 'Marseille',
          expectedPallets: 25,
          status: 'pending',
          scheduledAt: '2024-11-17T14:00:00Z'
        },
        {
          id: 'RCP-004',
          orderId: 'ORD-007',
          carrier: 'Quick Transport',
          origin: 'Toulouse',
          expectedPallets: 18,
          receivedPallets: 16,
          status: 'anomaly',
          scheduledAt: '2024-11-17T13:00:00Z',
          arrivedAt: '2024-11-17T13:05:00Z',
          notes: '2 palettes manquantes'
        }
      ]);
    } catch (error) {
      console.error('Error fetching receptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const startReception = (reception: Reception) => {
    setSelectedReception(reception);
    setReceivedPallets(reception.expectedPallets.toString());
    setNotes('');
    setPhotos([]);
    setShowPhotoModal(true);
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPhotos(prev => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const completeReception = async () => {
    if (!selectedReception) return;

    try {
      // API call to complete reception
      const hasAnomaly = parseInt(receivedPallets) !== selectedReception.expectedPallets;

      console.log('Completing reception:', {
        receptionId: selectedReception.id,
        receivedPallets: parseInt(receivedPallets),
        notes,
        photos,
        hasAnomaly
      });

      // If anomaly, redirect to anomaly creation
      if (hasAnomaly) {
        const confirmed = confirm(
          `Anomalie détectée: ${selectedReception.expectedPallets - parseInt(receivedPallets)} palettes manquantes. ` +
          'Voulez-vous créer une déclaration d\'anomalie ?'
        );
        if (confirmed) {
          router.push(`/anomalies/new?receptionId=${selectedReception.id}&orderId=${selectedReception.orderId}`);
          return;
        }
      }

      setShowPhotoModal(false);
      fetchReceptions();
    } catch (error) {
      console.error('Error completing reception:', error);
      alert('Erreur lors de la validation de la réception');
    }
  };

  const filteredReceptions = receptions.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Chargement...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px' }}>Réceptions</h2>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
            Toutes ({receptions.length})
          </FilterButton>
          <FilterButton active={filter === 'pending'} onClick={() => setFilter('pending')}>
            En attente ({receptions.filter(r => r.status === 'pending').length})
          </FilterButton>
          <FilterButton active={filter === 'in_progress'} onClick={() => setFilter('in_progress')}>
            En cours ({receptions.filter(r => r.status === 'in_progress').length})
          </FilterButton>
          <FilterButton active={filter === 'completed'} onClick={() => setFilter('completed')}>
            Terminées ({receptions.filter(r => r.status === 'completed').length})
          </FilterButton>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredReceptions.length === 0 ? (
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            Aucune réception trouvée
          </div>
        ) : (
          filteredReceptions.map(reception => (
            <ReceptionCard
              key={reception.id}
              reception={reception}
              onStart={() => startReception(reception)}
            />
          ))
        )}
      </div>

      {/* Photo Modal */}
      {showPhotoModal && selectedReception && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
              Contrôle de réception
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Commande</div>
              <div style={{ fontSize: '16px', fontWeight: 600 }}>{selectedReception.orderId}</div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151'
              }}>
                Nombre de palettes reçues
              </label>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                Attendu: {selectedReception.expectedPallets} palettes
              </div>
              <input
                type="number"
                value={receivedPallets}
                onChange={(e) => setReceivedPallets(e.target.value)}
                min="0"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  minHeight: '48px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151'
              }}>
                Photos de déchargement
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handlePhotoCapture}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#eff6ff',
                  border: '2px dashed #3b82f6',
                  borderRadius: '8px',
                  color: '#2563eb',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '48px'
                }}
              >
                📷 Prendre une photo
              </button>

              {photos.length > 0 && (
                <div style={{
                  marginTop: '12px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                  gap: '8px'
                }}>
                  {photos.map((photo, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100px',
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151'
              }}>
                Notes (optionnel)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Remarques sur l'état des marchandises..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowPhotoModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '48px'
                }}
              >
                Annuler
              </button>
              <button
                onClick={completeReception}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '48px'
                }}
              >
                Valider la réception
              </button>
            </div>
          </div>
        </div>
      )}
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

function ReceptionCard({ reception, onStart }: { reception: Reception; onStart: () => void }) {
  const statusConfig = {
    pending: { color: '#f59e0b', bg: '#fef3c7', label: 'En attente' },
    in_progress: { color: '#3b82f6', bg: '#dbeafe', label: 'En cours' },
    completed: { color: '#10b981', bg: '#d1fae5', label: 'Terminée' },
    anomaly: { color: '#ef4444', bg: '#fee2e2', label: 'Anomalie' }
  };

  const status = statusConfig[reception.status];

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '16px',
      flexWrap: 'wrap'
    }}>
      <div style={{ flex: 1, minWidth: '200px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
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
          {reception.id}
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Commande: {reception.orderId}
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Transporteur: {reception.carrier}
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Origine: {reception.origin}
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Palettes: {reception.receivedPallets !== undefined ? `${reception.receivedPallets}/${reception.expectedPallets}` : reception.expectedPallets}
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Prévu: {new Date(reception.scheduledAt).toLocaleString('fr-FR')}
        </div>
        {reception.notes && (
          <div style={{ fontSize: '14px', color: '#ef4444', marginTop: '4px' }}>
            ⚠ {reception.notes}
          </div>
        )}
      </div>

      {(reception.status === 'pending' || reception.status === 'in_progress') && (
        <button
          onClick={onStart}
          style={{
            padding: '10px 20px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            minHeight: '44px',
            whiteSpace: 'nowrap'
          }}
        >
          {reception.status === 'pending' ? 'Démarrer' : 'Continuer'}
        </button>
      )}
    </div>
  );
}
