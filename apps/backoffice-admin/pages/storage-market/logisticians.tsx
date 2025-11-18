import { useState } from 'react'

export default function LogisticiansManagementPage() {
  const [logisticians, setLogisticians] = useState([
    { id: 'LOG-1', name: 'Logistique Pro', email: 'contact@logpro.fr', status: 'APPROVED', sites: 2, contracts: 3, joinedDate: '2024-10-15' },
    { id: 'LOG-2', name: 'Hub Transport', email: 'info@hubtransport.fr', status: 'APPROVED', sites: 1, contracts: 1, joinedDate: '2024-11-20' },
    { id: 'LOG-5', name: 'Stock & Co', email: 'contact@stockco.fr', status: 'PENDING', sites: 0, contracts: 0, joinedDate: '2025-01-18' }
  ])

  const handleApprove = (id: string) => {
    setLogisticians(prev => prev.map(l => l.id === id ? { ...l, status: 'APPROVED' } : l))
  }

  const handleReject = (id: string) => {
    setLogisticians(prev => prev.map(l => l.id === id ? { ...l, status: 'REJECTED' } : l))
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Gestion des Logisticiens</h1>
      <p className="text-gray-600 mb-6">Validation des abonnements et supervision</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total logisticiens</div>
          <div className="text-3xl font-bold">{logisticians.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Approuvés</div>
          <div className="text-3xl font-bold text-green-600">
            {logisticians.filter(l => l.status === 'APPROVED').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">En attente</div>
          <div className="text-3xl font-bold text-orange-600">
            {logisticians.filter(l => l.status === 'PENDING').length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">ID</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Nom</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Sites</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Contrats actifs</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date inscription</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Statut</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logisticians.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 font-medium">{log.id}</td>
                <td className="px-6 py-4">{log.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{log.email}</td>
                <td className="px-6 py-4">{log.sites}</td>
                <td className="px-6 py-4">{log.contracts}</td>
                <td className="px-6 py-4 text-sm">{new Date(log.joinedDate).toLocaleDateString('fr-FR')}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded text-sm ${
                    log.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    log.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {log.status === 'APPROVED' ? 'Approuvé' : log.status === 'PENDING' ? 'En attente' : 'Rejeté'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {log.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(log.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Approuver
                      </button>
                      <button
                        onClick={() => handleReject(log.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Rejeter
                      </button>
                    </div>
                  )}
                  {log.status === 'APPROVED' && (
                    <a href={`/storage-market/logisticians/${log.id}`} className="text-blue-600 hover:underline text-sm">
                      Voir détails
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
