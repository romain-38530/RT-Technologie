'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setToken } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Truck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [carrierId, setCarrierId] = useState('CARRIER-B');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In a real app, this would call the backend auth API
      // For demo, we create a fake JWT token
      const fakePayload = {
        carrierId,
        name: carrierId === 'CARRIER-B' ? 'Transport Express' : 'Logistique Pro',
        email: `${carrierId.toLowerCase()}@example.com`,
        exp: Math.floor(Date.now() / 1000) + 86400, // 24h
      };

      // Create a fake JWT (base64 encoded payload)
      const fakeToken = `header.${btoa(JSON.stringify(fakePayload))}.signature`;

      setToken(fakeToken);
      router.push('/');
    } catch (error) {
      alert('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mb-4">
            <Truck className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl">RT Transporter</CardTitle>
          <CardDescription>
            Connectez-vous à votre espace transporteur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="carrierId" className="block text-sm font-medium text-gray-700 mb-1">
                ID Transporteur
              </label>
              <select
                id="carrierId"
                value={carrierId}
                onChange={(e) => setCarrierId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="CARRIER-B">CARRIER-B (Transport Express)</option>
                <option value="CARRIER-C">CARRIER-C (Logistique Pro)</option>
                <option value="CARRIER-A">CARRIER-A (Demo Transport)</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                defaultValue="demo"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Mode démo:</strong> Sélectionnez un transporteur et cliquez sur "Se connecter".
                Le mot de passe n'est pas vérifié en mode démo.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
