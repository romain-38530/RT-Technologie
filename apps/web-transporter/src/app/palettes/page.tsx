'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { palettesApi, type PalletCheque } from '@/lib/api/palettes';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Package, QrCode, Camera, AlertCircle, CheckCircle } from 'lucide-react';
// TEMPORAIRE: Désactivé pour déploiement Vercel (dépendance workspace non disponible)
// import { TrainingButton } from '@rt/design-system';

export default function PalettesPage() {
  const router = useRouter();
  const [scannedCheque, setScannedCheque] = useState<PalletCheque | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [depositSuccess, setDepositSuccess] = useState(false);

  // Mock GPS for demo
  const [currentGps] = useState({ lat: 48.9023, lng: 2.3789 });

  const handleScanQR = async (qrCode: string) => {
    setLoading(true);
    setError(null);
    setDepositSuccess(false);

    try {
      // Extract cheque ID from QR code (format: RT-PALETTE://CHQ-xxxxx)
      const chequeId = qrCode.replace('RT-PALETTE://', '');
      const cheque = await palettesApi.getCheque(chequeId);
      setScannedCheque(cheque);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du scan du QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!scannedCheque) return;

    setLoading(true);
    setError(null);

    try {
      const result = await palettesApi.depositCheque({
        chequeId: scannedCheque.chequeId,
        gps: currentGps,
      });

      if (result.success) {
        setDepositSuccess(true);
        // Reload cheque to get updated status
        const updatedCheque = await palettesApi.getCheque(scannedCheque.chequeId);
        setScannedCheque(updatedCheque);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du dépôt');
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
      GENERATED: 'warning',
      DEPOSITED: 'success',
      RECEIVED: 'default',
      DISPUTED: 'error',
    };
    return (
      <Badge variant={variants[status] || 'default'}>
        {status === 'GENERATED' && 'Généré'}
        {status === 'DEPOSITED' && 'Déposé'}
        {status === 'RECEIVED' && 'Reçu'}
        {status === 'DISPUTED' && 'Litige'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* TEMPORAIRE: TrainingButton désactivé pour déploiement Vercel */}
      {/* <TrainingButton toolName="Palettes" /> */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion des palettes</h1>
        <p className="text-gray-600 mt-1">
          Scannez et déposez vos chèques palettes
        </p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <div className="p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-red-900">Erreur</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {depositSuccess && (
        <Card className="border-green-200 bg-green-50">
          <div className="p-4 flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-green-900">Dépôt effectué</p>
              <p className="text-sm text-green-700">
                Les palettes ont été déposées avec succès sur le site
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Scan Section */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <QrCode className="w-6 h-6 mr-2" />
            Scanner un chèque palette
          </h2>

          <div className="space-y-4">
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <QrCode className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">
                Scannez le QR code du chèque palette
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => {
                    // Demo: simulate scanning a cheque
                    handleScanQR('RT-PALETTE://CHQ-1234567890-ABCD');
                  }}
                  disabled={loading}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {loading ? 'Scan en cours...' : 'Scanner (Demo)'}
                </Button>
                <Button onClick={handleManualEntry} variant="outline" disabled={loading}>
                  Saisie manuelle
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Cheque Details */}
      {scannedCheque && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Détails du chèque</h2>
              {getStatusBadge(scannedCheque.status)}
            </div>

            <div className="space-y-4">
              {/* Cheque Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">ID Chèque</p>
                  <p className="font-mono font-semibold">{scannedCheque.chequeId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quantité</p>
                  <p className="font-semibold flex items-center">
                    <Package className="w-4 h-4 mr-1" />
                    {scannedCheque.quantity} palettes
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Commande</p>
                  <p className="font-medium">{scannedCheque.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Immatriculation</p>
                  <p className="font-medium">{scannedCheque.transporterPlate}</p>
                </div>
              </div>

              {/* Site Info */}
              <div className="p-4 border-2 border-blue-200 bg-blue-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-900">Site de retour</h3>
                    </div>
                    <p className="text-sm text-blue-800">ID: {scannedCheque.toSiteId}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Consultez la carte pour les détails du site
                    </p>
                  </div>
                </div>
              </div>

              {/* GPS */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Votre position GPS</p>
                <p className="font-mono text-sm">
                  {currentGps.lat.toFixed(4)}, {currentGps.lng.toFixed(4)}
                </p>
              </div>

              {/* Action Button */}
              {scannedCheque.status === 'GENERATED' && (
                <div className="pt-4">
                  <Button
                    onClick={handleDeposit}
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? 'Dépôt en cours...' : 'Déposer les palettes'}
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Vérifiez que vous êtes bien sur le site de retour
                  </p>
                </div>
              )}

              {scannedCheque.status === 'DEPOSITED' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="font-medium text-green-900">Palettes déposées</p>
                  <p className="text-sm text-green-700">
                    Déposé le {new Date(scannedCheque.depositedAt!).toLocaleString('fr-FR')}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t flex gap-3">
              <Button
                onClick={() => setScannedCheque(null)}
                variant="outline"
                className="flex-1"
              >
                Scanner un autre chèque
              </Button>
              <Button
                onClick={() => router.push('/palettes/sites')}
                variant="outline"
                className="flex-1"
              >
                Voir les sites
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Help Card */}
      {!scannedCheque && (
        <Card>
          <div className="p-6">
            <h3 className="font-semibold mb-3">Comment ça marche ?</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Scannez le QR code du chèque palette reçu par l'industriel</li>
              <li>Vérifiez les informations (quantité, site de retour)</li>
              <li>Rendez-vous sur le site de retour indiqué</li>
              <li>Déposez les palettes et validez le dépôt dans l'app</li>
              <li>Le logisticien réceptionnera et validera la réception</li>
            </ol>
          </div>
        </Card>
      )}
    </div>
  );
}
