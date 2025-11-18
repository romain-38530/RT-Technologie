'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mission } from '@/shared/models/Mission';
import { documentsApi } from '@/lib/api/documents';
import { storage } from '@/lib/utils/storage';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import SignaturePad from '@/components/SignaturePad';
import QRCodeDisplay from '@/components/QRCodeDisplay';

function SignaturePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signatureType = searchParams.get('type') || 'loading';
  const [mission, setMission] = useState<Mission | null>(null);
  const [signerName, setSignerName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const { position, getCurrentPosition } = useGeolocation();

  useEffect(() => {
    const storedMission = storage.getCurrentMission();
    if (storedMission) {
      setMission(storedMission);
      // Get current position
      getCurrentPosition();
    } else {
      router.push('/mission/dashboard');
    }
  }, [router, getCurrentPosition]);

  const handleSaveSignature = async (signatureData: string) => {
    if (!mission || !position) return;

    setIsSaving(true);
    try {
      const metadata = {
        latitude: position.latitude,
        longitude: position.longitude,
        timestamp: new Date().toISOString(),
        remarks: remarks || undefined,
      };

      if (signatureType === 'loading') {
        await documentsApi.saveLoadingSignature(
          mission.id,
          signatureData,
          signerName,
          metadata
        );
      } else {
        await documentsApi.saveDeliverySignature(
          mission.id,
          signatureData,
          signerName,
          metadata
        );
      }

      alert('Signature enregistrée avec succès');
      router.push('/mission/tracking');
    } catch (error) {
      console.error('Error saving signature:', error);
      alert('Erreur lors de l\'enregistrement de la signature');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShowQR = async () => {
    if (!mission) return;

    try {
      const { url } = await documentsApi.getRecipientQRCode(mission.id);
      setQrCodeUrl(url);
      setShowQR(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Erreur lors de la génération du QR code');
    }
  };

  if (!mission) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rt-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-driver text-rt-gray">Chargement...</p>
        </div>
      </div>
    );
  }

  if (showQR && signatureType === 'delivery') {
    return (
      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="safe-top bg-rt-blue text-white p-4 shadow-md">
          <button onClick={() => setShowQR(false)} className="mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-driver-xl font-bold">Signature destinataire</h1>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <QRCodeDisplay
            value={qrCodeUrl}
            title="QR Code Signature"
            subtitle="Présentez ce code au destinataire"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <div className="safe-top bg-rt-blue text-white p-4 shadow-md">
        <button onClick={() => router.back()} className="mb-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-driver-xl font-bold">
          Signature {signatureType === 'loading' ? 'chargement' : 'livraison'}
        </h1>
      </div>

      <div className="flex-1 p-4 overflow-y-auto safe-bottom">
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <label htmlFor="signerName" className="block text-driver font-medium text-rt-dark mb-2">
            Nom du signataire *
          </label>
          <input
            id="signerName"
            type="text"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            required
            className="w-full h-touch px-4 border-2 border-gray-300 rounded-lg text-driver focus:border-rt-blue focus:outline-none mb-4"
            placeholder="Jean Dupont"
          />

          <label htmlFor="remarks" className="block text-driver font-medium text-rt-dark mb-2">
            Remarques (optionnel)
          </label>
          <textarea
            id="remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-driver focus:border-rt-blue focus:outline-none"
            placeholder="Remarques éventuelles..."
          />
        </div>

        {signatureType === 'delivery' && (
          <button
            onClick={handleShowQR}
            className="w-full h-touch bg-rt-orange text-white rounded-lg text-driver font-semibold mb-4 active:bg-opacity-80"
          >
            Signature par QR Code
          </button>
        )}

        <div className="bg-white rounded-lg shadow-md p-4" style={{ height: '400px' }}>
          <SignaturePad
            onSave={handleSaveSignature}
            onCancel={() => router.back()}
            title="Signature"
          />
        </div>
      </div>
    </div>
  );
}

export default function SignaturePage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <SignaturePageContent />
    </Suspense>
  );
}
