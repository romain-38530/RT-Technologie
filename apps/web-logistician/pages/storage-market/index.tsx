import { useState } from 'react'
import Link from 'next/link'

export default function StorageMarketPage() {
  const [filters, setFilters] = useState({ region: '', type: '', minBudget: '', maxDistance: '' })

  const announcements = [
    {
      id: 'NEED-001',
      storageType: 'Long terme',
      volume: '200 palettes',
      location: 'Île-de-France (77)',
      distance: 45,
      budget: '5000 €/mois',
      deadline: '25/01/2025',
      constraints: ['Temp. ambiante', 'ISO 9001']
    },
    {
      id: 'NEED-002',
      storageType: 'Temporaire',
      volume: '500 m²',
      location: 'Rhône-Alpes (69)',
      distance: 12,
      budget: '8000 €/mois',
      deadline: '18/01/2025',
      constraints: ['Froid 2-8°C', 'ISO 9001', 'IFS']
    }
  ]

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Bourse de Stockage</h1>
        <p className="text-gray-600">Découvrez les annonces de besoins et soumettez vos offres</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-semibold mb-3">Filtres</h3>
        <div className="grid grid-cols-4 gap-4">
          <select className="border rounded px-3 py-2" onChange={(e) => setFilters({...filters, region: e.target.value})}>
            <option value="">Toutes les régions</option>
            <option value="idf">Île-de-France</option>
            <option value="ara">Auvergne-Rhône-Alpes</option>
          </select>
          <select className="border rounded px-3 py-2" onChange={(e) => setFilters({...filters, type: e.target.value})}>
            <option value="">Tous les types</option>
            <option value="long_term">Long terme</option>
            <option value="temporary">Temporaire</option>
          </select>
          <input
            type="number"
            placeholder="Distance max (km)"
            className="border rounded px-3 py-2"
            onChange={(e) => setFilters({...filters, maxDistance: e.target.value})}
          />
          <input
            type="number"
            placeholder="Budget min (€)"
            className="border rounded px-3 py-2"
            onChange={(e) => setFilters({...filters, minBudget: e.target.value})}
          />
        </div>
      </div>

      {/* Announcements */}
      <div className="space-y-4">
        {announcements.map((ann) => (
          <div key={ann.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold">{ann.id}</h3>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">{ann.storageType}</span>
                  {ann.distance <= 50 && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">
                      À {ann.distance}km
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                  <div>
                    <span className="text-gray-600">Volume:</span>
                    <span className="ml-2 font-medium">{ann.volume}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Localisation:</span>
                    <span className="ml-2 font-medium">{ann.location}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Budget indicatif:</span>
                    <span className="ml-2 font-medium">{ann.budget}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  {ann.constraints.map((c, idx) => (
                    <span key={idx} className="bg-gray-100 px-2 py-1 rounded text-xs">{c}</span>
                  ))}
                </div>

                <p className="text-sm text-red-600">Date limite: {ann.deadline}</p>
              </div>

              <div className="flex gap-2">
                <Link href={`/storage-market/need/${ann.id}`}>
                  <a className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded">Voir détails</a>
                </Link>
                <Link href={`/storage-market/offer-form/${ann.id}`}>
                  <a className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Soumettre offre</a>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
