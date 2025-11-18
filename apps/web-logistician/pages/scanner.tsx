import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';

export default function Scanner() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('logistician_jwt');
    if (!token) {
      router.push('/login');
      return;
    }

    return () => {
      stopScanning();
    };
  }, [router]);

  const startScanning = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setScanning(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Impossible d\'accéder à la caméra. Utilisez la saisie manuelle.');
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode) return;

    processCode(manualCode);
  };

  const processCode = async (code: string) => {
    setScannedCode(code);
    stopScanning();

    // Try to determine what type of code this is
    if (code.startsWith('ORD-')) {
      router.push(`/receptions?orderId=${code}`);
    } else if (code.startsWith('EXP-')) {
      router.push(`/expeditions?expeditionId=${code}`);
    } else if (code.startsWith('RCP-')) {
      router.push(`/receptions?receptionId=${code}`);
    } else {
      // Unknown code format, show options
      setScannedCode(code);
    }
  };

  // Simulate barcode detection (in production, use html5-qrcode library)
  const simulateScan = () => {
    const mockCodes = ['ORD-001', 'ORD-002', 'EXP-001', 'RCP-001'];
    const randomCode = mockCodes[Math.floor(Math.random() * mockCodes.length)];
    processCode(randomCode);
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
        <h2 style={{ fontSize: '24px', fontWeight: 600 }}>Scanner un code-barres</h2>
      </div>

      {!scanning && !scannedCode && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '16px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '72px', marginBottom: '16px' }}>📷</div>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Scannez un code-barres de commande, réception ou expédition
            </p>
            <button
              onClick={startScanning}
              style={{
                padding: '14px 32px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: '52px',
                width: '100%',
                maxWidth: '300px'
              }}
            >
              Activer la caméra
            </button>
          </div>

          {error && (
            <div style={{
              padding: '12px',
              background: '#fee2e2',
              color: '#991b1b',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <div style={{
            borderTop: '1px solid #e5e7eb',
            paddingTop: '24px',
            marginTop: '24px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
              Ou saisir manuellement
            </h3>
            <form onSubmit={handleManualSubmit}>
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="ORD-XXX, EXP-XXX, RCP-XXX"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  marginBottom: '12px',
                  minHeight: '48px'
                }}
              />
              <button
                type="submit"
                style={{
                  width: '100%',
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
                Rechercher
              </button>
            </form>
          </div>
        </div>
      )}

      {scanning && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '16px'
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            height: '400px',
            background: '#000',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '16px'
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              height: '60%',
              border: '3px solid #10b981',
              borderRadius: '8px',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)'
            }} />
          </div>

          <div style={{ textAlign: 'center', color: '#6b7280', marginBottom: '16px' }}>
            Placez le code-barres dans le cadre vert
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={stopScanning}
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
              onClick={simulateScan}
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
              Simuler un scan (dev)
            </button>
          </div>
        </div>
      )}

      {scannedCode && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              Code scanné
            </h3>
            <div style={{
              padding: '12px 24px',
              background: '#eff6ff',
              color: '#2563eb',
              borderRadius: '8px',
              fontSize: '20px',
              fontWeight: 600,
              display: 'inline-block'
            }}>
              {scannedCode}
            </div>
          </div>

          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px', textAlign: 'center' }}>
            Que souhaitez-vous faire ?
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => router.push(`/receptions?search=${scannedCode}`)}
              style={{
                padding: '14px',
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: '52px'
              }}
            >
              Voir dans Réceptions
            </button>
            <button
              onClick={() => router.push(`/expeditions?search=${scannedCode}`)}
              style={{
                padding: '14px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: '52px'
              }}
            >
              Voir dans Expéditions
            </button>
            <button
              onClick={() => router.push(`/ecmr/new?orderId=${scannedCode}`)}
              style={{
                padding: '14px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: '52px'
              }}
            >
              Créer un E-CMR
            </button>
            <button
              onClick={() => {
                setScannedCode('');
                setManualCode('');
              }}
              style={{
                padding: '14px',
                background: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: '52px'
              }}
            >
              Scanner un autre code
            </button>
          </div>
        </div>
      )}

      <div style={{
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '8px',
        padding: '16px',
        marginTop: '16px',
        fontSize: '14px',
        color: '#1e40af'
      }}>
        <strong>Astuce:</strong> Vous pouvez scanner les codes-barres présents sur les bons de commande,
        les palettes ou les documents de transport pour accéder rapidement aux informations.
      </div>
    </div>
  );
}
