import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';

interface Expedition {
  id: string;
  orderId: string;
  carrier: string;
  destination: string;
  expectedPallets: number;
  loadedPallets?: number;
  status: 'pending' | 'preparing' | 'loading' | 'completed' | 'departed';
  scheduledAt: string;
  preparedAt?: string;
  departedAt?: string;
  photos?: string[];
  notes?: string;
}

export default function Expeditions() {
  const router = useRouter();
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'loading' | 'completed'>('pending');
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [selectedExpedition, setSelectedExpedition] = useState<Expedition | null>(null);
  const [loadedPallets, setLoadedPallets] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('logistician_jwt');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchExpeditions();
  }, [router]);

  const fetchExpeditions = async () => {
    try {
      // Mock data - Replace with actual API call
      setExpeditions([
        {
          id: 'EXP-001',
          orderId: 'ORD-002',
          carrier: 'Logistics XYZ',
          destination: 'Marseille',
          expectedPallets: 18,
          loadedPallets: 18,
          status: 'departed',
          scheduledAt: '2024-11-17T10:00:00Z',
          preparedAt: '2024-11-17T09:45:00Z',
          departedAt: '2024-11-17T10:30:00Z'
        },
        {
          id: 'EXP-002',
          orderId: 'ORD-005',
          carrier: 'Global Transport',
          destination: 'Nice',
          expectedPallets: 22,
          status: 'loading',
          scheduledAt: '2024-11-17T15:30:00Z',
          preparedAt: '2024-11-17T14:00:00Z'
        },
        {
          id: 'EXP-003',
          orderId: 'ORD-008',
          carrier: 'Express Delivery',
          destination: 'Bordeaux',
          expectedPallets: 15,
          status: 'preparing',
          scheduledAt: '2024-11-17T16:00:00Z',
          preparedAt: '2024-11-17T15:00:00Z'
        },
        {
          id: 'EXP-004',
          orderId: 'ORD-009',
          carrier: 'Fast Transport',
          destination: 'Toulouse',
          expectedPallets: 20,
          status: 'pending',
          scheduledAt: '2024-11-17T17:00:00Z'
        }
      ]);
    } catch (error) {
      console.error('Error fetching expeditions:', error);
    } finally {
      setLoading(false);
    }
  };

  const startLoading = (expedition: Expedition) => {
    setSelectedExpedition(expedition);
    setLoadedPallets(expedition.expectedPallets.toString());
    setNotes('');
    setPhotos([]);
    setShowLoadingModal(true);
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

  const completeLoading = async () => {
    if (!selectedExpedition) return;

    if (photos.length === 0) {
      const confirmed = confirm('Aucune photo prise. Voulez-vous continuer quand même ?');
      if (!confirmed) return;
    }

    try {
      // API call to complete loading
      const hasAnomaly = parseInt(loadedPallets) !== selectedExpedition.expectedPallets;

      console.log('Completing loading:', {
        expeditionId: selectedExpedition.id,
        loadedPallets: parseInt(loadedPallets),
        notes,
        photos,
        hasAnomaly
      });

      // If anomaly, redirect to anomaly creation
      if (hasAnomaly) {
        const confirmed = confirm(
          `Anomalie détectée: ${Math.abs(selectedExpedition.expectedPallets - parseInt(loadedPallets))} palettes de différence. ` +
          'Voulez-vous créer une déclaration d\'anomalie ?'
        );
        if (confirmed) {
          router.push(`/anomalies/new?expeditionId=${selectedExpedition.id}&orderId=${selectedExpedition.orderId}`);
          return;
        }
      }

      setShowLoadingModal(false);
      fetchExpeditions();
    } catch (error) {
      console.error('Error completing loading:', error);
      alert('Erreur lors de la validation du chargement');
    }
  };

  const markDeparted = async (expeditionId: string) => {
    const confirmed = confirm('Confirmer le départ du camion ?');
    if (!confirmed) return;

    try {
      // API call to mark as departed
      console.log('Marking departed:', expeditionId);
      fetchExpeditions();
    } catch (error) {
      console.error('Error marking departed:', error);
      alert('Erreur lors de la confirmation du départ');
    }
  };

  const filteredExpeditions = expeditions.filter(e => {
    if (filter === 'all') return true;
    return e.status === filter;
  });

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Chargement...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px' }}>Expéditions</h2>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
            Toutes ({expeditions.length})
          </FilterButton>
          <FilterButton active={filter === 'pending'} onClick={() => setFilter('pending')}>
            En attente ({expeditions.filter(e => e.status === 'pending').length})
          </FilterButton>
          <FilterButton active={filter === 'preparing'} onClick={() => setFilter('preparing')}>
            Préparation ({expeditions.filter(e => e.status === 'preparing').length})
          </FilterButton>
          <FilterButton active={filter === 'loading'} onClick={() => setFilter('loading')}>
            Chargement ({expeditions.filter(e => e.status === 'loading').length})
          </FilterButton>
          <FilterButton active={filter === 'completed'} onClick={() => setFilter('completed')}>
            Terminées ({expeditions.filter(e => e.status === 'completed' || e.status === 'departed').length})
          </FilterButton>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredExpeditions.length === 0 ? (
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            Aucune expédition trouvée
          </div>
        ) : (
          filteredExpeditions.map(expedition => (
            <ExpeditionCard
              key={expedition.id}
              expedition={expedition}
              onStartLoading={() => startLoading(expedition)}
              onMarkDeparted={() => markDeparted(expedition.id)}
            />
          ))
        )}
      </div>

      {/* Loading Modal */}
      {showLoadingModal && selectedExpedition && (
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
              Contrôle de chargement
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Commande</div>
              <div style={{ fontSize: '16px', fontWeight: 600 }}>{selectedExpedition.orderId}</div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Destination</div>
              <div style={{ fontSize: '16px', fontWeight: 600 }}>{selectedExpedition.destination}</div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151'
              }}>
                Nombre de palettes chargées
              </label>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                Prévu: {selectedExpedition.expectedPallets} palettes
              </div>
              <input
                type="number"
                value={loadedPallets}
                onChange={(e) => setLoadedPallets(e.target.value)}
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
                Photos avant départ
              </label>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                Prenez des photos du chargement pour preuve
              </div>
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
                placeholder="Remarques sur le chargement..."
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
                onClick={() => setShowLoadingModal(false)}
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
                onClick={completeLoading}
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
                Valider le chargement
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

function ExpeditionCard({ expedition, onStartLoading, onMarkDeparted }: {
  expedition: Expedition;
  onStartLoading: () => void;
  onMarkDeparted: () => void;
}) {
  const statusConfig = {
    pending: { color: '#f59e0b', bg: '#fef3c7', label: 'En attente' },
    preparing: { color: '#8b5cf6', bg: '#ede9fe', label: 'Préparation' },
    loading: { color: '#3b82f6', bg: '#dbeafe', label: 'Chargement' },
    completed: { color: '#10b981', bg: '#d1fae5', label: 'Chargé' },
    departed: { color: '#6b7280', bg: '#f3f4f6', label: 'Parti' }
  };

  const status = statusConfig[expedition.status];

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
          {expedition.id}
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Commande: {expedition.orderId}
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Transporteur: {expedition.carrier}
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Destination: {expedition.destination}
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Palettes: {expedition.loadedPallets !== undefined ? `${expedition.loadedPallets}/${expedition.expectedPallets}` : expedition.expectedPallets}
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Prévu: {new Date(expedition.scheduledAt).toLocaleString('fr-FR')}
        </div>
        {expedition.notes && (
          <div style={{ fontSize: '14px', color: '#ef4444', marginTop: '4px' }}>
            ⚠ {expedition.notes}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
        {(expedition.status === 'preparing' || expedition.status === 'loading' || expedition.status === 'pending') && (
          <button
            onClick={onStartLoading}
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
            {expedition.status === 'pending' ? 'Démarrer' : 'Contrôler'}
          </button>
        )}
        {expedition.status === 'completed' && (
          <button
            onClick={onMarkDeparted}
            style={{
              padding: '10px 20px',
              background: '#2563eb',
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
            Confirmer départ
          </button>
        )}
      </div>
    </div>
  );
}
