import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { palettesApi, type PalletCheque, type PalletSite } from '../lib/api/palettes';
// TEMPORAIRE: Désactivé pour déploiement Vercel (dépendance workspace non disponible)
// import { TrainingButton } from '@rt/design-system';

export default function PalettesPage() {
  const router = useRouter();
  const [scannedCheque, setScannedCheque] = useState<PalletCheque | null>(null);
  const [sites, setSites] = useState<PalletSite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiveSuccess, setReceiveSuccess] = useState(false);
  const [currentGps] = useState({ lat: 48.8566, lng: 2.3522 }); // Mock GPS

  useEffect(() => {
    const token = localStorage.getItem('logistician_jwt');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchSites();
  }, [router]);

  const fetchSites = async () => {
    try {
      const data = await palettesApi.getSites();
      setSites(data);
    } catch (err) {
      console.error('Error fetching sites:', err);
    }
  };

  const handleScanQR = async (qrCode: string) => {
    setLoading(true);
    setError(null);
    setReceiveSuccess(false);

    try {
      const chequeId = qrCode.replace('RT-PALETTE://', '');
      const cheque = await palettesApi.getCheque(chequeId);
      setScannedCheque(cheque);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du scan');
    } finally {
      setLoading(false);
    }
  };

  const handleReceive = async () => {
    if (!scannedCheque) return;

    setLoading(true);
    setError(null);

    try {
      const result = await palettesApi.receiveCheque({
        chequeId: scannedCheque.id,
        geolocation: currentGps,
        receiverSignature: 'digital',
      });

      // result returns { cheque: PalletCheque }
      setReceiveSuccess(true);
      setScannedCheque(result.cheque);
      fetchSites(); // Refresh sites to update quotas
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la réception');
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntry = () => {
    const qrCode = prompt('Entrez le code du chèque (CHQ-xxxxx):');
    if (qrCode) {
      handleScanQR(`RT-PALETTE://${qrCode}`);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      GENERATED: '#f59e0b',
      DEPOSITED: '#3b82f6',
      RECEIVED: '#10b981',
      DISPUTED: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      GENERATED: 'Généré',
      DEPOSITED: 'Déposé',
      RECEIVED: 'Reçu',
      DISPUTED: 'Litige',
    };
    return labels[status] || status;
  };

  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>
        Gestion des palettes
      </h2>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>
        Réception des chèques palettes et gestion des sites
      </p>

      {error && (
        <div style={{
          background: '#fee2e2',
          borderLeft: '4px solid #ef4444',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <p style={{ color: '#dc2626', fontWeight: 600 }}>❌ Erreur</p>
          <p style={{ color: '#991b1b', fontSize: '14px' }}>{error}</p>
        </div>
      )}

      {receiveSuccess && (
        <div style={{
          background: '#d1fae5',
          borderLeft: '4px solid #10b981',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <p style={{ color: '#047857', fontWeight: 600 }}>✓ Réception confirmée</p>
          <p style={{ color: '#065f46', fontSize: '14px' }}>
            Les palettes ont été réceptionnées avec succès
          </p>
        </div>
      )}

      {/* Scan Section */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
          📷 Scanner un chèque palette
        </h3>

        <div style={{
          background: '#f3f4f6',
          borderRadius: '8px',
          padding: '32px',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>
            Scannez le QR code du chèque palette déposé
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push('/scanner')}
              disabled={loading}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Scan en cours...' : '📷 Scanner avec caméra'}
            </button>
            <button
              onClick={handleManualEntry}
              disabled={loading}
              style={{
                background: 'white',
                color: '#374151',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              Saisie manuelle
            </button>
            <button
              onClick={() => handleScanQR('RT-PALETTE://CHQ-DEMO-123456')}
              disabled={loading}
              style={{
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              🎮 Demo
            </button>
          </div>
        </div>
      </div>

      {/* Cheque Details */}
      {scannedCheque && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Détails du chèque</h3>
            <span style={{
              background: getStatusColor(scannedCheque.status),
              color: 'white',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: 600
            }}>
              {getStatusLabel(scannedCheque.status)}
            </span>
          </div>

          <div style={{
            background: '#f9fafb',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>ID Chèque</p>
                <p style={{ fontFamily: 'monospace', fontWeight: 600 }}>{scannedCheque.id}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Quantité</p>
                <p style={{ fontWeight: 600 }}>📦 {scannedCheque.quantity} palettes</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Commande</p>
                <p style={{ fontWeight: 500 }}>{scannedCheque.orderId}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Transporteur</p>
                <p style={{ fontWeight: 500 }}>{scannedCheque.transporterPlate}</p>
              </div>
            </div>
          </div>

          {scannedCheque.status === 'DEPOSITED' && (
            <>
              <div style={{
                background: '#dbeafe',
                borderLeft: '4px solid #3b82f6',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <p style={{ fontSize: '12px', color: '#1e40af', marginBottom: '4px', fontWeight: 600 }}>
                  📍 Site de retour
                </p>
                <p style={{ color: '#1e3a8a' }}>ID: {scannedCheque.toSiteId}</p>
                {scannedCheque.depositedAt && (
                  <p style={{ fontSize: '12px', color: '#1e40af', marginTop: '8px' }}>
                    Déposé le {new Date(scannedCheque.depositedAt).toLocaleString('fr-FR')}
                  </p>
                )}
              </div>

              <button
                onClick={handleReceive}
                disabled={loading}
                style={{
                  width: '100%',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  marginBottom: '8px'
                }}
              >
                {loading ? 'Traitement...' : '✓ Confirmer la réception'}
              </button>
              <p style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
                Vérifiez la conformité avant de valider
              </p>
            </>
          )}

          {scannedCheque.status === 'RECEIVED' && (
            <div style={{
              background: '#d1fae5',
              border: '2px solid #10b981',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>✓</div>
              <p style={{ fontWeight: 600, color: '#047857' }}>Palettes réceptionnées</p>
              <p style={{ fontSize: '14px', color: '#065f46' }}>
                Réceptionné le {new Date(scannedCheque.receivedAt!).toLocaleString('fr-FR')}
              </p>
            </div>
          )}

          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
            <button
              onClick={() => setScannedCheque(null)}
              style={{
                width: '100%',
                background: 'white',
                color: '#374151',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Scanner un autre chèque
            </button>
          </div>
        </div>
      )}

      {/* Sites Section */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
          📍 Mes sites de retour
        </h3>

        {sites.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>
            Aucun site configuré
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {sites.map((site) => {
              const quotaPercent = (site.quotaConsumed / site.quotaDailyMax) * 100;
              const isNearCapacity = quotaPercent > 80;
              const quotaAvailable = site.quotaDailyMax - site.quotaConsumed;

              return (
                <div
                  key={site.id}
                  style={{
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px'
                  }}
                >
                  <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                    {site.name}
                  </h4>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                    📍 {site.address}
                  </p>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>Capacité journalière</span>
                      <span style={{
                        fontWeight: 600,
                        color: isNearCapacity ? '#f59e0b' : '#10b981'
                      }}>
                        {quotaAvailable} / {site.quotaDailyMax}
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: '#e5e7eb',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${Math.min(quotaPercent, 100)}%`,
                        height: '100%',
                        background: isNearCapacity ? '#f59e0b' : '#10b981',
                        transition: 'width 0.3s'
                      }} />
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Horaires: {site.openingHours.start} - {site.openingHours.end}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
