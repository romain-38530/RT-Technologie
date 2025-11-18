'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mission } from '@/shared/models/Mission';
import { missionsApi } from '@/lib/api/missions';
import { storage } from '@/lib/utils/storage';

export default function StartMissionPage() {
  const router = useRouter();
  const [mission, setMission] = useState<Mission | null>(null);
  const [driverName, setDriverName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleReg, setVehicleReg] = useState('');
  const [trailerReg, setTrailerReg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load mission from storage
    const storedMission = storage.getCurrentMission();
    if (storedMission) {
      setMission(storedMission);
      // Pre-fill if available
      if (storedMission.driver) {
        setDriverName(`${storedMission.driver.firstName} ${storedMission.driver.lastName}`);
        setPhone(storedMission.driver.phone || '');
      }
      if (storedMission.vehicle) {
        setVehicleReg(storedMission.vehicle.registration || '');
        setTrailerReg(storedMission.vehicle.trailerRegistration || '');
      }
    } else {
      router.push('/auth/qr-scan');
    }
  }, [router]);

  const handleStartMission = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!mission) throw new Error('Mission non trouvée');

      // Start mission
      const startedMission = await missionsApi.startMission(mission.code, {
        name: driverName,
        phone,
        vehicleRegistration: vehicleReg,
        trailerRegistration: trailerReg || undefined,
      });

      // Update stored mission
      storage.setCurrentMission(startedMission);

      // Navigate to tracking
      router.push('/mission/tracking');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du démarrage de la mission');
    } finally {
      setIsLoading(false);
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

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="safe-top bg-rt-blue text-white p-4 shadow-md">
        <h1 className="text-driver-xl font-bold">Démarrage mission</h1>
        <p className="text-white opacity-90 mt-1">Code: {mission.code}</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 safe-bottom">
        {/* Mission Info */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-driver-lg font-bold text-rt-dark mb-3">
            Informations mission
          </h2>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-rt-gray">Chargement</p>
              <p className="text-driver font-semibold text-rt-dark">
                {mission.loadingPoint.name}
              </p>
              <p className="text-sm text-rt-gray">
                {mission.loadingPoint.city}
              </p>
            </div>

            <div>
              <p className="text-sm text-rt-gray">Livraison</p>
              <p className="text-driver font-semibold text-rt-dark">
                {mission.deliveryPoint.name}
              </p>
              <p className="text-sm text-rt-gray">
                {mission.deliveryPoint.city}
              </p>
            </div>

            {mission.cargo.description && (
              <div>
                <p className="text-sm text-rt-gray">Marchandise</p>
                <p className="text-driver font-semibold text-rt-dark">
                  {mission.cargo.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Driver Info Form */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-driver-lg font-bold text-rt-dark mb-3">
            Vos informations
          </h2>

          <form onSubmit={handleStartMission} className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="driverName"
                className="block text-driver font-medium text-rt-dark mb-2"
              >
                Nom complet *
              </label>
              <input
                id="driverName"
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                required
                className="w-full h-touch px-4 border-2 border-gray-300 rounded-lg text-driver focus:border-rt-blue focus:outline-none"
                placeholder="Jean Dupont"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-driver font-medium text-rt-dark mb-2"
              >
                Téléphone *
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full h-touch px-4 border-2 border-gray-300 rounded-lg text-driver focus:border-rt-blue focus:outline-none"
                placeholder="+33 6 12 34 56 78"
              />
            </div>

            <div>
              <label
                htmlFor="vehicleReg"
                className="block text-driver font-medium text-rt-dark mb-2"
              >
                Immatriculation véhicule *
              </label>
              <input
                id="vehicleReg"
                type="text"
                value={vehicleReg}
                onChange={(e) => setVehicleReg(e.target.value.toUpperCase())}
                required
                className="w-full h-touch px-4 border-2 border-gray-300 rounded-lg text-driver focus:border-rt-blue focus:outline-none"
                placeholder="AB-123-CD"
                autoCapitalize="characters"
              />
            </div>

            <div>
              <label
                htmlFor="trailerReg"
                className="block text-driver font-medium text-rt-dark mb-2"
              >
                Immatriculation remorque (optionnel)
              </label>
              <input
                id="trailerReg"
                type="text"
                value={trailerReg}
                onChange={(e) => setTrailerReg(e.target.value.toUpperCase())}
                className="w-full h-touch px-4 border-2 border-gray-300 rounded-lg text-driver focus:border-rt-blue focus:outline-none"
                placeholder="EF-456-GH"
                autoCapitalize="characters"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-touch bg-rt-green text-white rounded-lg text-driver font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed active:bg-opacity-80"
              >
                {isLoading ? 'Démarrage...' : 'Démarrer la mission'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
