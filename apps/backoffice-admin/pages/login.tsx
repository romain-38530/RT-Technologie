import { useState } from 'react';
import { useRouter } from 'next/router';
import SEO from '../components/SEO';
import { Button, Input, Alert } from '../components/ui';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';

const AUTHZ_URL = process.env.NEXT_PUBLIC_AUTHZ_URL || 'http://localhost:3007';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@example.com');
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${AUTHZ_URL}/auth/admin/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, adminKey }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Échec de la connexion');
      localStorage.setItem('admin_jwt', json.token);
      router.push('/orgs');
    } catch (e: any) {
      setError(e.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Connexion Admin"
        description="Connectez-vous à votre espace d'administration RT Technologie pour gérer vos organisations, tarifs et services."
        noIndex={true}
      />

      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Espace Administration</h1>
            <p className="text-gray-600 mt-2">
              Connectez-vous pour accéder au backoffice
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Connexion</CardTitle>
              <CardDescription>
                Entrez vos identifiants administrateur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={login} className="space-y-4">
                {error && (
                  <Alert variant="error" onClose={() => setError(null)}>
                    {error}
                  </Alert>
                )}

                <Input
                  label="Adresse email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  }
                />

                <Input
                  label="Clé d'administration"
                  type="password"
                  placeholder="Entrez votre clé admin"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  required
                  helperText="Clé fournie par l'administrateur système"
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                      />
                    </svg>
                  }
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  className="w-full"
                >
                  Se connecter
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Besoin d'aide ?{' '}
              <a
                href={process.env.NEXT_PUBLIC_SUPPORT_URL || 'https://www.rt-technologie.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Contactez le support
              </a>
            </p>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Identifiants de démo
            </h3>
            <div className="space-y-1 text-xs text-gray-600">
              <p>
                <strong>Email :</strong> admin@example.com
              </p>
              <p>
                <strong>Clé admin :</strong> Valeur de AUTHZ_ADMIN_API_KEY dans .env
              </p>
              <p className="text-gray-500 mt-2">
                Par défaut : <code className="bg-gray-200 px-1 rounded">change-me-admin-key</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
