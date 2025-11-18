import { useEffect, useState } from 'react';
import Link from 'next/link';
import SEO from '../../components/SEO';
import { Button, Input, Alert, Badge } from '../../components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const ADMIN_GATEWAY = process.env.NEXT_PUBLIC_ADMIN_GATEWAY_URL || 'http://localhost:3008';

interface OrgItem {
  id: string;
  name: string;
  role: string;
  status: string;
  plan?: string;
  addons?: string[];
}

const statusVariants: Record<string, 'success' | 'warning' | 'error' | 'gray'> = {
  ACTIVE: 'success',
  VERIFIED: 'success',
  PENDING_VERIFICATION: 'warning',
  SUSPENDED: 'error',
  BLOCKED: 'error',
};

const roleLabels: Record<string, string> = {
  INDUSTRY: 'Industrie',
  TRANSPORTER: 'Transporteur',
  LOGISTICIAN: 'Logisticien',
  FORWARDER: 'Transitaire',
};

export default function OrgsList() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<OrgItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {};
      if (typeof window !== 'undefined') {
        const t = window.localStorage.getItem('admin_jwt');
        if (t) headers['authorization'] = `Bearer ${t}`;
      }
      const res = await fetch(
        `${ADMIN_GATEWAY}/admin/orgs?query=${encodeURIComponent(query)}`,
        { headers }
      );
      const json = await res.json();
      setItems(json.items || []);
    } catch (e: any) {
      setError(e.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    search();
  }, []);

  return (
    <>
      <SEO
        title="Gestion des Organisations"
        description="Gérez les organisations inscrites sur la plateforme RT Technologie. Consultez les plans, addons et statuts de vos clients."
        noIndex={true}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Organisations</h1>
            <p className="text-gray-600 mt-1">
              Gérez les comptes et abonnements de vos clients
            </p>
          </div>
          <Badge variant="primary" size="lg">
            {items.length} organisation{items.length > 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="py-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                search();
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="flex-1">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher par nom, email ou ID..."
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  }
                />
              </div>
              <Button type="submit" variant="primary" isLoading={loading}>
                Rechercher
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des organisations</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Organisation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Addons
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      <p className="text-sm">Aucune organisation trouvée</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Essayez de modifier vos critères de recherche
                      </p>
                    </td>
                  </tr>
                ) : (
                  items.map((org) => (
                    <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{org.name}</div>
                          <div className="text-xs text-gray-500">{org.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="gray">{roleLabels[org.role] || org.role}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={statusVariants[org.status] || 'gray'}>
                          {org.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {org.plan || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(org.addons || []).length > 0 ? (
                            org.addons?.map((addon) => (
                              <Badge key={addon} variant="accent" size="sm">
                                {addon}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">Aucun</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link href={`/orgs/${org.id}`}>
                          <Button variant="ghost" size="sm">
                            Gérer
                            <svg
                              className="ml-1 w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
