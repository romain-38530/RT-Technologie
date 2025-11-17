import { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import { Alert, Badge } from '../components/ui';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';

const ADMIN_GATEWAY = process.env.NEXT_PUBLIC_ADMIN_GATEWAY_URL || 'http://localhost:3008';

interface ServiceStatus {
  ok: boolean;
  [key: string]: any;
}

export default function Health() {
  const [basic, setBasic] = useState<any>(null);
  const [full, setFull] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const headers: Record<string, string> = {};
        if (typeof window !== 'undefined') {
          const t = window.localStorage.getItem('admin_jwt');
          if (t) headers['authorization'] = `Bearer ${t}`;
        }
        const [b, f] = await Promise.all([
          fetch(`${ADMIN_GATEWAY}/admin/health`, { headers }).then((r) => r.json()),
          fetch(`${ADMIN_GATEWAY}/admin/health/full`, { headers }).then((r) => r.json()),
        ]);
        setBasic(b);
        setFull(f);
      } catch (e: any) {
        setError(e.message || 'Erreur réseau');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getOverallStatus = () => {
    if (!full?.services) return 'unknown';
    const services = Object.values(full.services) as ServiceStatus[];
    const allOk = services.every((s) => s.ok);
    const someOk = services.some((s) => s.ok);
    if (allOk) return 'operational';
    if (someOk) return 'degraded';
    return 'outage';
  };

  const statusConfig = {
    operational: {
      label: 'Tous les systèmes opérationnels',
      variant: 'success' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    degraded: {
      label: 'Performances dégradées',
      variant: 'warning' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
    outage: {
      label: 'Incident majeur',
      variant: 'error' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
    unknown: {
      label: 'État inconnu',
      variant: 'gray' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  };

  if (loading) {
    return (
      <>
        <SEO
          title="État des Services"
          description="Consultez l'état de santé des services RT Technologie en temps réel. Monitoring MongoDB, AWS et microservices."
        />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <svg
              className="animate-spin h-10 w-10 text-primary-600 mx-auto mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-gray-600">Vérification de l'état des services...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEO
          title="État des Services"
          description="Consultez l'état de santé des services RT Technologie en temps réel."
        />
        <Alert variant="error">{error}</Alert>
      </>
    );
  }

  const overallStatus = getOverallStatus();
  const config = statusConfig[overallStatus];

  return (
    <>
      <SEO
        title="État des Services"
        description="Consultez l'état de santé des services RT Technologie en temps réel. Monitoring MongoDB, AWS et microservices."
        canonical="/health"
      />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">État des Services</h1>
          <p className="text-gray-600 mt-1">
            Surveillance en temps réel de l'infrastructure RT Technologie
          </p>
        </div>

        {/* Overall Status */}
        <Card
          className={`border-2 ${
            config.variant === 'success'
              ? 'border-success-200 bg-success-50'
              : config.variant === 'warning'
              ? 'border-warning-200 bg-warning-50'
              : config.variant === 'error'
              ? 'border-error-200 bg-error-50'
              : 'border-gray-200 bg-gray-50'
          }`}
        >
          <CardContent className="py-6">
            <div className="flex items-center justify-center space-x-4">
              <div
                className={`p-3 rounded-full ${
                  config.variant === 'success'
                    ? 'bg-success-100 text-success-600'
                    : config.variant === 'warning'
                    ? 'bg-warning-100 text-warning-600'
                    : config.variant === 'error'
                    ? 'bg-error-100 text-error-600'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {config.icon}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{config.label}</h2>
                <p className="text-sm text-gray-600">
                  Dernière mise à jour : {new Date().toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Infrastructure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle as="h3">MongoDB</CardTitle>
              <CardDescription>Base de données principale</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Connexion</span>
                <Badge variant={basic?.mongo ? 'success' : 'error'}>
                  {basic?.mongo ? 'Connecté' : 'Déconnecté'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle as="h3">AWS</CardTitle>
              <CardDescription>Services cloud (S3, SES)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Statut</span>
                <Badge variant={basic?.aws ? 'success' : 'error'}>
                  {basic?.aws ? 'Opérationnel' : 'Indisponible'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle>Services Backend</CardTitle>
            <CardDescription>État détaillé de chaque microservice</CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Détails
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries<ServiceStatus>(full?.services || {}).map(([name, status]) => (
                  <tr key={name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`w-2.5 h-2.5 rounded-full mr-3 ${
                            status.ok ? 'bg-success-500' : 'bg-error-500'
                          }`}
                        />
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {name.replace(/-/g, ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={status.ok ? 'success' : 'error'}>
                        {status.ok ? 'Opérationnel' : 'Hors service'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <pre className="text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-x-auto max-w-md">
                        {JSON.stringify(status, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
