import Link from 'next/link';
import SEO from '../components/SEO';
import { Button } from '../components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { TrainingButton } from '@rt/design-system';

const features = [
  {
    title: 'Industrie',
    description: 'Pilotez vos opérations logistiques avec une vision 360° sur vos flux de transport.',
    items: [
      'Vigilance documentaire et blocage automatique',
      'Affectation intelligente avec SLA et escalade',
      'Planification automatisée des rendez-vous',
      'Gestion des grilles transporteurs',
      'Tableaux de bord temps réel',
    ],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    title: 'Transporteur',
    description: 'Optimisez votre activité de transport avec des outils conçus pour votre métier.',
    items: [
      'Acceptation mission avec SLA garanti',
      'Prise de rendez-vous en 1 clic',
      'Gestion documentaire centralisée',
      'Accès marketplace (Premium)',
      'Cotations IA avec Affret.IA',
    ],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    title: 'Logisticien',
    description: 'Gérez vos entrepôts et quais avec précision et efficacité.',
    items: [
      'Planning quais en temps réel',
      'Borne d\'accueil chauffeurs',
      'Signature e-CMR au quai (S3 + PDF/A)',
      'Intégration WMS via webhooks',
      'Traçabilité complète des opérations',
    ],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    title: 'Transitaire',
    description: 'Coordonnez vos opérations import/export avec une vision multimodale.',
    items: [
      'Gestion des tenders import/export',
      'Organisation pré et post-routier',
      'Suivi multimodal intégré',
      'Conformité douanière',
      'Reporting automatisé',
    ],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const modules = [
  { name: 'Vigilance', description: 'Conformité et blocage automatique' },
  { name: 'Tracking & ETA', description: 'Suivi temps réel et prédiction' },
  { name: 'e-CMR / BL', description: 'Documents électroniques légaux' },
  { name: 'Notifications', description: 'Alertes multi-canal intelligentes' },
  { name: 'Affret.IA', description: 'Intelligence artificielle de cotation' },
  { name: 'Marketplace', description: 'Bourse de fret collaborative' },
];

const stats = [
  { value: '99.9%', label: 'Disponibilité', description: 'SLA garanti' },
  { value: '-40%', label: 'Temps admin', description: 'Automatisation' },
  { value: '+25%', label: 'Productivité', description: 'Gains moyens' },
  { value: '24/7', label: 'Support', description: 'Assistance experte' },
];

export default function Home() {
  return (
    <>
      <SEO
        title="Plateforme Logistique & Transport"
        description="RT Technologie : solution SaaS complète pour la gestion logistique et le transport multimodal. Vigilance, planification, e-CMR, tracking et IA intégrée. Testez notre démo gratuite."
        keywords="logistique, transport, TMS, WMS, e-CMR, gestion flotte, supply chain, affrètement, transitaire, plateforme logistique, SaaS transport, digitalisation transport"
        canonical="/"
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50 -z-10" />
        <div className="max-w-4xl mx-auto text-center py-16 lg:py-24">
          <Badge variant="accent" size="lg" className="mb-6">
            Nouvelle version 2025
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Digitalisez votre{' '}
            <span className="text-gradient">supply chain</span>
            <br />
            avec l'intelligence artificielle
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            RT Technologie unifie <strong>Transport</strong>, <strong>Logistique</strong> et{' '}
            <strong>Industrie</strong> sur une seule plateforme. Vigilance, planification,
            suivi temps réel, e-CMR et cotations IA : tout ce dont vous avez besoin pour
            optimiser vos flux logistiques.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" variant="primary">
                Accéder à la démo
                <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="secondary">
                Voir les tarifs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* TrainingButton */}
      <div className="flex justify-center py-8">
        <TrainingButton toolName="Backoffice Admin" />
      </div>

      {/* Stats Section */}
      <section className="py-12 bg-white rounded-2xl shadow-soft relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-1">{stat.value}</div>
              <div className="text-sm font-semibold text-gray-900">{stat.label}</div>
              <div className="text-xs text-gray-500">{stat.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Une plateforme, tous les métiers du transport
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Que vous soyez industriel, transporteur, logisticien ou transitaire,
            RT Technologie s'adapte à vos besoins spécifiques avec des modules dédiés.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} hover className="h-full">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                    {feature.icon}
                  </div>
                  <CardTitle as="h3">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.items.map((item) => (
                    <li key={item} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-success-500 mr-2 flex-shrink-0 mt-0.5"
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
                      <span className="text-sm text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Modules Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-primary-50 rounded-2xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Modules transverses</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Des fonctionnalités avancées qui s'intègrent à tous vos processus métier
            pour une efficacité maximale.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {modules.map((module) => (
            <div
              key={module.name}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <Badge variant="primary" className="mb-2">
                {module.name}
              </Badge>
              <p className="text-sm text-gray-600">{module.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <Card className="bg-gradient-to-r from-primary-600 to-accent-600 text-white" padding="lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Prêt à transformer votre logistique ?
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Découvrez comment RT Technologie peut optimiser vos flux, réduire vos coûts
              et améliorer votre service client. Accédez à notre démo interactive dès maintenant.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-white text-primary-600 hover:bg-gray-100 focus:ring-white"
                >
                  Tester gratuitement
                </Button>
              </Link>
              <Link href="/health">
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-white border border-white/30 hover:bg-white/10"
                >
                  Voir l'état des services
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>

      {/* FAQ Section for SEO */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Qu'est-ce que RT Technologie ?
            </h3>
            <p className="text-gray-600">
              RT Technologie est une plateforme SaaS de gestion logistique et transport multimodal
              qui digitalise l'ensemble de votre chaîne d'approvisionnement. Elle intègre la gestion
              des commandes, la planification des rendez-vous, la signature électronique des CMR,
              le suivi en temps réel et l'intelligence artificielle pour les cotations.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Comment fonctionne la vigilance transporteur ?
            </h3>
            <p className="text-gray-600">
              Notre module de vigilance vérifie automatiquement les documents des transporteurs
              (numéro de TVA, assurances, licences) et bloque les transporteurs non conformes.
              Cela garantit que vous travaillez uniquement avec des partenaires fiables et en règle.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Qu'est-ce que Affret.IA ?
            </h3>
            <p className="text-gray-600">
              Affret.IA est notre moteur d'intelligence artificielle qui génère automatiquement
              des cotations de transport en analysant vos historiques, les conditions du marché
              et les caractéristiques de chaque envoi. Il suggère également les meilleurs transporteurs
              pour chaque mission.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              La plateforme est-elle conforme au règlement e-CMR ?
            </h3>
            <p className="text-gray-600">
              Oui, notre module e-CMR est entièrement conforme aux réglementations européennes.
              Les documents sont signés électroniquement, horodatés et archivés de manière sécurisée
              sur AWS S3 au format PDF/A pour une valeur probante garantie.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
