'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQRScanner } from '@/lib/hooks/useQRScanner';
import { missionsApi } from '@/lib/api/missions';
import { storage } from '@/lib/utils/storage';

export default function QRScanPage() {
  const router = useRouter();
  const { isScanning, scannedCode, error: scanError, startScanning, stopScanning } = useQRScanner();
  const [manualCode, setManualCode] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (scannedCode) {
      handleCodeSubmit(scannedCode);
    }
  }, [scannedCode]);

  const handleStartScan = async () => {
    setError('');
    await startScanning('qr-reader');
  };

  const handleCodeSubmit = async (code: string) => {
    setError('');
    setIsLoading(true);

    try {
      // Get mission by code
      const mission = await missionsApi.getMissionByCode(code);

      // Create temporary token for subcontractor
      const tempToken = `temp_${code}_${Date.now()}`;
      storage.setToken(tempToken);
      storage.setCurrentMission(mission);

      // Navigate to mission details
      router.push('/mission/start');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Code mission invalide');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleCodeSubmit(manualCode.trim());
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-rt-blue to-blue-700">
      {/* Header */}
      <div className="safe-top bg-rt-blue text-white p-4">
        <Link href="/auth/login" className="inline-block mb-2">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <h1 className="text-driver-xl font-bold">Scanner QR Code</h1>
        <p className="text-white opacity-90 mt-1">
          Conducteur sous-traitant
        </p>
      </div>

      <div className="flex-1 flex flex-col p-6">
        {!isManualMode ? (
          <>
            {/* QR Scanner */}
            <div className="bg-white rounded-lg shadow-xl overflow-hidden mb-4">
              <div id="qr-reader" className="w-full aspect-square"></div>
            </div>

            {scanError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {scanError}
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {!isScanning ? (
              <button
                onClick={handleStartScan}
                className="w-full h-touch bg-white text-rt-blue rounded-lg text-driver font-semibold mb-4 active:bg-gray-100"
              >
                Démarrer le scan
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="w-full h-touch bg-white text-rt-blue rounded-lg text-driver font-semibold mb-4 active:bg-gray-100"
              >
                Arrêter le scan
              </button>
            )}

            <button
              onClick={() => setIsManualMode(true)}
              className="w-full h-touch bg-white bg-opacity-20 text-white border-2 border-white rounded-lg text-driver font-semibold active:bg-opacity-30"
            >
              Saisir le code manuellement
            </button>
          </>
        ) : (
          <>
            {/* Manual Code Entry */}
            <div className="bg-white rounded-lg shadow-xl p-6">
              <h2 className="text-driver-lg font-bold text-rt-dark mb-4">
                Code mission
              </h2>

              <form onSubmit={handleManualSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="code"
                    className="block text-driver font-medium text-rt-dark mb-2"
                  >
                    Entrez le code mission
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    required
                    className="w-full h-touch px-4 border-2 border-gray-300 rounded-lg text-driver text-center font-bold focus:border-rt-blue focus:outline-none"
                    placeholder="ABC-123-XYZ"
                    autoCapitalize="characters"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !manualCode.trim()}
                  className="w-full h-touch bg-rt-blue text-white rounded-lg text-driver font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed active:bg-opacity-80"
                >
                  {isLoading ? 'Vérification...' : 'Valider'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsManualMode(false)}
                  className="w-full h-touch bg-white border-2 border-rt-gray text-rt-gray rounded-lg text-driver font-semibold active:bg-gray-100"
                >
                  Retour au scan
                </button>
              </form>
            </div>
          </>
        )}

        <div className="mt-auto text-center text-white text-sm opacity-75">
          <p>Scannez le QR code fourni par votre transporteur</p>
          <p className="mt-1">ou entrez le code manuellement</p>
        </div>
      </div>
    </div>
  );
}
