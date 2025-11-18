'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { storage } from '@/lib/utils/storage';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // TODO: Implement actual login API call
      // For now, simulate login
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock token and user data
      const mockToken = 'mock_jwt_token_' + Date.now();
      const mockUser = {
        id: '1',
        firstName: 'Jean',
        lastName: 'Dupont',
        email,
        type: 'EMPLOYEE',
      };

      storage.setToken(mockToken);
      storage.setUserProfile(mockUser);

      router.push('/mission/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-gradient-to-b from-rt-blue to-blue-700">
      <div className="max-w-md w-full mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-4xl font-bold text-rt-blue">RT</span>
          </div>
          <h1 className="text-driver-xl font-bold text-white mb-2">
            RT Driver
          </h1>
          <p className="text-white opacity-90">Conducteur salarié</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-driver font-medium text-rt-dark mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-touch px-4 border-2 border-gray-300 rounded-lg text-driver focus:border-rt-blue focus:outline-none"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-driver font-medium text-rt-dark mb-2"
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-touch px-4 border-2 border-gray-300 rounded-lg text-driver focus:border-rt-blue focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-touch bg-rt-blue text-white rounded-lg text-driver font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed active:bg-opacity-80"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/auth/qr-scan"
              className="text-rt-blue font-semibold text-driver"
            >
              Ou scanner un code QR mission
            </Link>
          </div>
        </div>

        <p className="text-white text-center mt-6 text-sm opacity-75">
          Version 1.0.0
        </p>
      </div>
    </div>
  );
}
