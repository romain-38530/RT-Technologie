import { useState, useEffect } from 'react'
import Link from 'next/link'
import { storageMarketApi, type StorageNeed } from '@/lib/api/storage'

export default function StorageMarketPage() {
  const [filters, setFilters] = useState({ region: '', type: '', minBudget: '', maxDistance: '' })
  const [needs, setNeeds] = useState<StorageNeed[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch available needs from API
  useEffect(() => {
    const fetchNeeds = async () => {
      try {
        setLoading(true)
        const data = await storageMarketApi.getAvailableNeeds({ status: 'PUBLISHED' })
        setNeeds(data)
      } catch (err) {
        console.error('Error fetching needs:', err)
        setError(err instanceof Error ? err.message : 'Failed to load needs')
      } finally {
        setLoading(false)
      }
    }

    fetchNeeds()
  }, [])

  // Filter needs based on current filters
  const filteredNeeds = needs.filter((need) => {
    if (filters.region && need.location?.region !== filters.region) return false
    if (filters.type && need.storageType !== filters.type) return false
    if (filters.minBudget && (need.budget?.indicative || 0) < parseInt(filters.minBudget)) return false
    return true
  })

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des besoins...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Bourse de Stockage</h1>
        <p className="text-gray-600">Découvrez les annonces de besoins et soumettez vos offres</p>
        <div className="mt-2 text-sm text-gray-500">
          {needs.length} besoin{needs.length > 1 ? 's' : ''} disponible{needs.length > 1 ? 's' : ''}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">Erreur: {error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-semibold mb-3">Filtres</h3>
        <div className="grid grid-cols-4 gap-4">
          <select className="border rounded px-3 py-2" onChange={(e) => setFilters({...filters, region: e.target.value})}>
            <option value="">Toutes les régions</option>
            <option value="Île-de-France">Île-de-France</option>
            <option value="Auvergne-Rhône-Alpes">Auvergne-Rhône-Alpes</option>
            <option value="Nouvelle-Aquitaine">Nouvelle-Aquitaine</option>
            <option value="Hauts-de-France">Hauts-de-France</option>
          </select>
          <select className="border rounded px-3 py-2" onChange={(e) => setFilters({...filters, type: e.target.value})}>
            <option value="">Tous les types</option>
            <option value="long_term">Long terme</option>
            <option value="short_term">Court terme</option>
            <option value="seasonal">Saisonnier</option>
            <option value="project">Projet</option>
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
        {filteredNeeds.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">Aucun besoin disponible pour le moment</p>
          </div>
        ) : (
          filteredNeeds.map((need) => (
            <div key={need.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{need.id}</h3>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">
                      {need.storageType === 'long_term' ? 'Long terme' :
                       need.storageType === 'short_term' ? 'Court terme' :
                       need.storageType === 'seasonal' ? 'Saisonnier' : 'Projet'}
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">
                      {need.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                    <div>
                      <span className="text-gray-600">Volume:</span>
                      <span className="ml-2 font-medium">
                        {need.volume.quantity} {need.volume.type}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Localisation:</span>
                      <span className="ml-2 font-medium">
                        {need.location?.region} {need.location?.department && `(${need.location.department})`}
                      </span>
                    </div>
                    {need.budget?.indicative && (
                      <div>
                        <span className="text-gray-600">Budget indicatif:</span>
                        <span className="ml-2 font-medium">
                          {need.budget.indicative.toLocaleString('fr-FR')} {need.budget.currency}/{need.budget.period === 'monthly' ? 'mois' : 'total'}
                        </span>
                      </div>
                    )}
                  </div>

                  {need.constraints?.certifications && need.constraints.certifications.length > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      {need.constraints.certifications.map((cert, idx) => (
                        <span key={idx} className="bg-gray-100 px-2 py-1 rounded text-xs">{cert}</span>
                      ))}
                    </div>
                  )}

                  {need.deadline && (
                    <p className="text-sm text-red-600">
                      Date limite: {new Date(need.deadline).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link href={`/storage-market/need/${need.id}`}>
                    <a className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded">Voir détails</a>
                  </Link>
                  <Link href={`/storage-market/offer-form/${need.id}`}>
                    <a className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Soumettre offre</a>
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
