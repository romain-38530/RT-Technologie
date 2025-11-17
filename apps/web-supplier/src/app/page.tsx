import Link from 'next/link'
import { Package, Calendar, ClipboardCheck, History } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: Package,
      title: 'Enlevements Prevus',
      description: 'Consultez les pickups planifies avec dates et transporteurs',
      href: '/pickups',
      color: 'bg-primary-500',
    },
    {
      icon: Calendar,
      title: 'Creneaux',
      description: 'Proposez et confirmez vos creneaux de disponibilite',
      href: '/slots',
      color: 'bg-success-500',
    },
    {
      icon: ClipboardCheck,
      title: 'Preparation',
      description: 'Gerez la preparation et les documents d\'enlevement',
      href: '/preparation',
      color: 'bg-warning-500',
    },
    {
      icon: History,
      title: 'Historique',
      description: 'Consultez vos enlevements passes et KPIs',
      href: '/history',
      color: 'bg-danger-500',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-900">RT Supplier</h1>
          <p className="text-slate-600 mt-1">Gestion des enlevements fournisseur</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="group block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden"
            >
              <div className="p-8">
                <div className={`w-16 h-16 ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h2>
                <p className="text-slate-600">
                  {feature.description}
                </p>
              </div>
              <div className="bg-slate-50 px-8 py-4 border-t group-hover:bg-slate-100 transition-colors">
                <span className="text-primary-600 font-medium">
                  Acceder →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
