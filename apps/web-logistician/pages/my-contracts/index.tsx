import Link from 'next/link'

export default function MyContractsPage() {
  const contracts = [
    {
      id: 'CONTRACT-001',
      industrialName: 'Industriel ABC',
      site: 'Hub Lyon Est',
      status: 'ACTIVE',
      startDate: '22/01/2025',
      endDate: '22/07/2025',
      volume: '1000 m³',
      monthlyPrice: 12000,
      occupancy: 85
    },
    {
      id: 'CONTRACT-002',
      industrialName: 'Industriel XYZ',
      site: 'Entrepôt Paris Nord',
      status: 'PENDING_START',
      startDate: '05/02/2025',
      endDate: '31/12/2025',
      volume: '100 palettes',
      monthlyPrice: 1000,
      occupancy: 0
    }
  ]

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Mes Missions de Stockage</h1>
      <p className="text-gray-600 mb-6">Gérez vos contrats actifs et suivez vos performances</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Contrats actifs</div>
          <div className="text-3xl font-bold">2</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Revenu mensuel</div>
          <div className="text-3xl font-bold">13 000 €</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Taux occupation</div>
          <div className="text-3xl font-bold">78%</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Contrat</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Client</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Site</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Période</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Occupation</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Revenu/mois</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Statut</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {contracts.map((contract) => (
              <tr key={contract.id}>
                <td className="px-6 py-4 font-medium">{contract.id}</td>
                <td className="px-6 py-4">{contract.industrialName}</td>
                <td className="px-6 py-4">{contract.site}</td>
                <td className="px-6 py-4 text-sm">
                  {contract.startDate} - {contract.endDate}
                </td>
                <td className="px-6 py-4">
                  {contract.status === 'ACTIVE' && (
                    <span className={`px-3 py-1 rounded text-sm ${
                      contract.occupancy > 80 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {contract.occupancy}%
                    </span>
                  )}
                  {contract.status !== 'ACTIVE' && '-'}
                </td>
                <td className="px-6 py-4 font-medium">{contract.monthlyPrice.toLocaleString()} €</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded text-sm ${
                    contract.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {contract.status === 'ACTIVE' ? 'Actif' : 'À venir'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Link href={`/my-contracts/${contract.id}`}>
                    <a className="text-blue-600 hover:underline">Voir</a>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
