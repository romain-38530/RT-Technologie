import Link from 'next/link'

export default function MySitesPage() {
  const sites = [
    {
      id: 'SITE-001',
      name: 'Entrepôt Paris Nord',
      city: 'Gennevilliers',
      totalM2: 5000,
      availableM2: 2000,
      totalPalettes: 2000,
      availablePalettes: 800,
      types: ['Long terme', 'Temporaire', 'Picking'],
      certifications: ['ISO 9001', 'IFS', 'ADR']
    },
    {
      id: 'SITE-002',
      name: 'Hub Lyon Est',
      city: 'Chassieu',
      totalM2: 8000,
      availableM2: 3500,
      totalPalettes: 3200,
      availablePalettes: 1400,
      types: ['Long terme', 'Cross-dock'],
      certifications: ['ISO 9001', 'ISO 14001', 'IFS']
    }
  ]

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mes Sites Logistiques</h1>
          <p className="text-gray-600">Gérez vos capacités et disponibilités</p>
        </div>
        <Link href="/my-sites/new">
          <a className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
            + Ajouter un site
          </a>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Sites actifs</div>
          <div className="text-3xl font-bold">{sites.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Capacité totale</div>
          <div className="text-3xl font-bold">13 000 m²</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Disponibilité</div>
          <div className="text-3xl font-bold">5 500 m²</div>
        </div>
      </div>

      {/* Sites List */}
      <div className="space-y-4">
        {sites.map((site) => (
          <div key={site.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-1">{site.name}</h3>
                <p className="text-gray-600">{site.city}</p>
              </div>
              <Link href={`/my-sites/${site.id}/edit`}>
                <a className="text-blue-600 hover:underline">Modifier</a>
              </Link>
            </div>

            <div className="grid grid-cols-4 gap-6 mb-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Surface</div>
                <div className="font-medium">
                  {site.availableM2.toLocaleString()} / {site.totalM2.toLocaleString()} m²
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(site.availableM2 / site.totalM2) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">Palettes</div>
                <div className="font-medium">
                  {site.availablePalettes.toLocaleString()} / {site.totalPalettes.toLocaleString()}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(site.availablePalettes / site.totalPalettes) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">Types de stockage</div>
                <div className="flex flex-wrap gap-1">
                  {site.types.slice(0, 2).map((type, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                      {type}
                    </span>
                  ))}
                  {site.types.length > 2 && (
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">+{site.types.length - 2}</span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">Certifications</div>
                <div className="flex flex-wrap gap-1">
                  {site.certifications.slice(0, 3).map((cert, idx) => (
                    <span key={idx} className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded text-sm">
                Mettre à jour disponibilité
              </button>
              <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded text-sm">
                Voir tarifs
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
