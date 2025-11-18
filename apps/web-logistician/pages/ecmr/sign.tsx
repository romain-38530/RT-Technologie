import { useRouter } from 'next/router';
import { useState, useRef, useEffect } from 'react';

export default function SignECMR() {
  const router = useRouter();
  const { orderId } = router.query;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('logistician_jwt');
    if (!token) {
      router.push('/login');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Set drawing style
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [router]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.closePath();
    setSignatureData(canvas.toDataURL());
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  const handleSubmit = async () => {
    if (!signatureData) {
      alert('Veuillez signer avant de continuer');
      return;
    }

    setLoading(true);

    try {
      // API call to save signature
      const response = await fetch(`${process.env.NEXT_PUBLIC_ECMR_API}/ecmr/sign-at-dock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('logistician_jwt')}`
        },
        body: JSON.stringify({
          orderId,
          signature: signatureData,
          signedAt: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Signature failed');

      router.push('/ecmr');
    } catch (error) {
      console.error('Error saving signature:', error);
      alert('Erreur lors de l\'enregistrement de la signature');
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
        <h2 style={{ fontSize: '24px', fontWeight: 600 }}>Signature E-CMR</h2>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '16px'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Commande</div>
          <div style={{ fontSize: '20px', fontWeight: 600 }}>{orderId}</div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
            Signature du logisticien
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
            Signez dans la zone ci-dessous avec votre doigt ou votre stylet
          </div>

          <div style={{
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            overflow: 'hidden',
            background: '#f9fafb',
            position: 'relative'
          }}>
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={(e) => {
                e.preventDefault();
                startDrawing(e);
              }}
              onTouchMove={(e) => {
                e.preventDefault();
                draw(e);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                stopDrawing();
              }}
              style={{
                width: '100%',
                height: '300px',
                cursor: 'crosshair',
                touchAction: 'none'
              }}
            />
            {!signatureData && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#9ca3af',
                fontSize: '16px',
                pointerEvents: 'none',
                textAlign: 'center'
              }}>
                Signez ici
              </div>
            )}
          </div>
        </div>

        <button
          onClick={clearSignature}
          style={{
            width: '100%',
            padding: '12px',
            background: 'white',
            color: '#ef4444',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '12px',
            minHeight: '48px'
          }}
        >
          Effacer la signature
        </button>

        <button
          onClick={handleSubmit}
          disabled={!signatureData || loading}
          style={{
            width: '100%',
            padding: '14px',
            background: !signatureData || loading ? '#9ca3af' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: !signatureData || loading ? 'not-allowed' : 'pointer',
            minHeight: '52px'
          }}
        >
          {loading ? 'Enregistrement...' : 'Valider et signer'}
        </button>
      </div>

      <div style={{
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '8px',
        padding: '16px',
        fontSize: '14px',
        color: '#1e40af'
      }}>
        <strong>Information:</strong> Cette signature confirme la réception ou l'expédition de la marchandise au quai.
        Le transporteur devra également signer à la livraison finale.
      </div>
    </div>
  );
}
