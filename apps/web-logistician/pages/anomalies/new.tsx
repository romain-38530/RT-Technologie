import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';

export default function NewAnomaly() {
  const router = useRouter();
  const { receptionId, expeditionId, orderId } = router.query;
  const [formData, setFormData] = useState({
    orderId: (orderId as string) || '',
    type: 'missing_pallets' as 'missing_pallets' | 'damaged_goods' | 'wrong_delivery' | 'quality_issue' | 'other',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    description: '',
    impactedParties: [] as ('industry' | 'transporter' | 'recipient')[]
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('logistician_jwt');
    if (!token) {
      router.push('/login');
      return;
    }
  }, [router]);

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

  const toggleImpactedParty = (party: 'industry' | 'transporter' | 'recipient') => {
    setFormData(prev => ({
      ...prev,
      impactedParties: prev.impactedParties.includes(party)
        ? prev.impactedParties.filter(p => p !== party)
        : [...prev.impactedParties, party]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.orderId || !formData.description || formData.impactedParties.length === 0) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);

    try {
      // API call to create anomaly
      console.log('Creating anomaly:', {
        ...formData,
        photos,
        receptionId,
        expeditionId,
        reportedAt: new Date().toISOString()
      });

      // Redirect back to anomalies list
      router.push('/anomalies');
    } catch (error) {
      console.error('Error creating anomaly:', error);
      alert('Erreur lors de la création de l\'anomalie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => router.back()}
          style={{
            padding: '8px 16px',
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '16px',
            minHeight: '44px'
          }}
        >
          ← Retour
        </button>
        <h2 style={{ fontSize: '24px', fontWeight: 600 }}>Déclarer une anomalie</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '16px'
        }}>
          {/* Order ID */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151'
            }}>
              N° de commande *
            </label>
            <input
              type="text"
              value={formData.orderId}
              onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
              placeholder="ORD-XXX"
              required
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

          {/* Type */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151'
            }}>
              Type d'anomalie *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                minHeight: '48px',
                background: 'white'
              }}
            >
              <option value="missing_pallets">Palettes manquantes</option>
              <option value="damaged_goods">Marchandise endommagée</option>
              <option value="wrong_delivery">Mauvaise livraison</option>
              <option value="quality_issue">Problème qualité</option>
              <option value="other">Autre</option>
            </select>
          </div>

          {/* Severity */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151'
            }}>
              Gravité *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
              {[
                { value: 'low', label: 'Faible', color: '#10b981' },
                { value: 'medium', label: 'Moyenne', color: '#f59e0b' },
                { value: 'high', label: 'Élevée', color: '#f97316' },
                { value: 'critical', label: 'Critique', color: '#ef4444' }
              ].map(severity => (
                <button
                  key={severity.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, severity: severity.value as any })}
                  style={{
                    padding: '12px',
                    background: formData.severity === severity.value ? severity.color : 'white',
                    color: formData.severity === severity.value ? 'white' : '#6b7280',
                    border: `2px solid ${severity.color}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    minHeight: '48px'
                  }}
                >
                  {severity.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151'
            }}>
              Description détaillée *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez précisément l'anomalie constatée..."
              rows={4}
              required
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

          {/* Impacted Parties */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151'
            }}>
              Parties impactées * (au moins une)
            </label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { value: 'industry', label: 'Industriel', icon: '🏭' },
                { value: 'transporter', label: 'Transporteur', icon: '🚚' },
                { value: 'recipient', label: 'Destinataire', icon: '📍' }
              ].map(party => (
                <button
                  key={party.value}
                  type="button"
                  onClick={() => toggleImpactedParty(party.value as any)}
                  style={{
                    padding: '12px 20px',
                    background: formData.impactedParties.includes(party.value as any) ? '#2563eb' : 'white',
                    color: formData.impactedParties.includes(party.value as any) ? 'white' : '#6b7280',
                    border: formData.impactedParties.includes(party.value as any) ? 'none' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    minHeight: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>{party.icon}</span>
                  {party.label}
                </button>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151'
            }}>
              Photos de l'anomalie
            </label>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
              Prenez des photos pour documenter l'anomalie
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
              type="button"
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
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '12px'
              }}>
                {photos.map((photo, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
          fontSize: '14px',
          color: '#856404'
        }}>
          <strong>Information:</strong> Les parties impactées sélectionnées recevront une notification automatique de cette anomalie.
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: loading ? '#9ca3af' : '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            minHeight: '52px'
          }}
        >
          {loading ? 'Enregistrement...' : 'Déclarer l\'anomalie'}
        </button>
      </form>
    </div>
  );
}
