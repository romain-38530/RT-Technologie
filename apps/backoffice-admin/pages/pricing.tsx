import { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import { Alert, Badge, Button } from '../components/ui';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import Link from 'next/link';

const ADMIN_GATEWAY = process.env.NEXT_PUBLIC_ADMIN_GATEWAY_URL || 'http://localhost:3008';

interface PlanData {
  monthly: number;
  label: string;
}

interface PricingData {
  plans: Record<string, PlanData>;
  addons: Record<string, PlanData>;
  notes?: string;
}

export default function Pricing() {
  const [data, setData] = useState<PricingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${ADMIN_GATEWAY}/admin/pricing`);
        setData(await res.json());
      } catch (e: any) {
        setError(e.message || 'Erreur réseau');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <>
        <SEO
          title="Tarification"
          description="Découvrez les plans tarifaires RT Technologie pour la gestion logistique. Plans Industrie et Transporteur avec modules additionnels."
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
            <p className="text-gray-600">Chargement des tarifs...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEO
          title="Tarification"
          description="Découvrez les plans tarifaires RT Technologie."
        />
        <Alert variant="error">{error}</Alert>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Tarification"
        description="Découvrez les plans tarifaires RT Technologie pour la gestion logistique et le transport. Solutions adaptées aux industriels et transporteurs avec modules additionnels Affret.IA et Marketplace."
        keywords="tarif logistique, prix TMS, abonnement transport, SaaS logistique pricing, e-CMR prix"
        canonical="/pricing"
      />

      <div className="space-y-12">
        {/* Header */}
        <div className="text-center">
          <Badge variant="primary" size="lg" className="mb-4">
            Tarification transparente
          </Badge>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Des plans adaptés à votre activité
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choisissez le plan qui correspond à vos besoins. Tous nos plans incluent un support
            technique, des mises à jour régulières et une garantie de disponibilité de 99.9%.
          </p>
        </div>

        {/* Plans */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Plans de base</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {Object.entries(data?.plans || {}).map(([key, plan]) => {
              const isPopular = key.includes('INDUSTRY');
              return (
                <Card
                  key={key}
                  hover
                  className={`relative ${isPopular ? 'border-2 border-primary-500 shadow-lg' : ''}`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge variant="primary">Le plus populaire</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle as="h3">{plan.label}</CardTitle>
                    <CardDescription>{key.replace(/_/g, ' ')}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-900">{plan.monthly}</span>
                      <span className="text-gray-600 ml-1">€ / mois</span>
                    </div>
                    <ul className="space-y-3 text-left">
                      <li className="flex items-center text-sm text-gray-600">
                        <svg
                          className="w-5 h-5 text-success-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Gestion des commandes
                      </li>
                      <li className="flex items-center text-sm text-gray-600">
                        <svg
                          className="w-5 h-5 text-success-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Planification RDV
                      </li>
                      <li className="flex items-center text-sm text-gray-600">
                        <svg
                          className="w-5 h-5 text-success-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Signature e-CMR
                      </li>
                      <li className="flex items-center text-sm text-gray-600">
                        <svg
                          className="w-5 h-5 text-success-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Notifications email
                      </li>
                      <li className="flex items-center text-sm text-gray-600">
                        <svg
                          className="w-5 h-5 text-success-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Support technique
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="text-center">
                    <Link href="/login" className="w-full">
                      <Button
                        variant={isPopular ? 'primary' : 'secondary'}
                        className="w-full"
                      >
                        Commencer
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Addons */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Modules additionnels
          </h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Enrichissez votre plan de base avec des fonctionnalités avancées
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {Object.entries(data?.addons || {}).map(([key, addon]) => (
              <Card key={key} hover>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle as="h3">{addon.label}</CardTitle>
                    <Badge variant="accent">{key.replace(/_/g, ' ')}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-bold text-gray-900">+{addon.monthly}</span>
                      <span className="text-gray-600 ml-1">€ / mois</span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-600">
                    {key === 'AFFRET_IA' && (
                      <>
                        Cotations automatiques par intelligence artificielle, suggestions de
                        transporteurs optimales et analyse prédictive des prix du marché.
                      </>
                    )}
                    {key === 'PREMIUM_MARKETPLACE' && (
                      <>
                        Accès à la bourse de fret collaborative, mise en relation directe avec
                        transporteurs certifiés et négociation en temps réel.
                      </>
                    )}
                    {!['AFFRET_IA', 'PREMIUM_MARKETPLACE'].includes(key) && (
                      <>Fonctionnalités avancées pour optimiser vos opérations logistiques.</>
                    )}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Notes */}
        {data?.notes && (
          <div className="bg-gray-50 rounded-lg p-6 text-center max-w-2xl mx-auto">
            <p className="text-sm text-gray-600">{data.notes}</p>
          </div>
        )}

        {/* CTA */}
        <section className="text-center">
          <Card
            className="bg-gradient-to-r from-primary-600 to-accent-600 text-white inline-block"
            padding="lg"
          >
            <div className="max-w-xl">
              <h3 className="text-2xl font-bold mb-4">Besoin d'un plan personnalisé ?</h3>
              <p className="opacity-90 mb-6">
                Contactez notre équipe commerciale pour discuter de vos besoins spécifiques et
                obtenir un devis sur mesure.
              </p>
              <Button
                size="lg"
                className="bg-white text-primary-600 hover:bg-gray-100"
                onClick={() =>
                  window.open(
                    process.env.NEXT_PUBLIC_SUPPORT_URL || 'https://www.rt-technologie.com',
                    '_blank'
                  )
                }
              >
                Contacter l'équipe commerciale
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </>
  );
}
