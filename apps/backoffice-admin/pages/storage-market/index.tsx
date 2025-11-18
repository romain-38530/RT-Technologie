export default function StorageMarketAdminDashboard() {
  const stats = {
    totalNeeds: 15,
    totalOffers: 42,
    totalContracts: 8,
    activeContracts: 5,
    totalLogisticians: 12,
    approvedLogisticians: 10,
    pendingLogisticians: 2,
    totalRevenue: 85000
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Dashboard Bourse de Stockage</h1>
      <p className="text-gray-600 mb-6">Vue d'ensemble et gestion du marché</p>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Besoins publiés</div>
          <div className="text-3xl font-bold">{stats.totalNeeds}</div>
          <div className="text-sm text-green-600 mt-1">+3 cette semaine</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Offres soumises</div>
          <div className="text-3xl font-bold">{stats.totalOffers}</div>
          <div className="text-sm text-gray-600 mt-1">Moyenne: 2.8/besoin</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Contrats actifs</div>
          <div className="text-3xl font-bold">{stats.activeContracts}/{stats.totalContracts}</div>
          <div className="text-sm text-gray-600 mt-1">Taux conversion: 53%</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Logisticiens</div>
          <div className="text-3xl font-bold">{stats.totalLogisticians}</div>
          <div className="text-sm text-orange-600 mt-1">{stats.pendingLogisticians} en attente</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Répartition par type de stockage</h3>
          <div className="space-y-3">
            {[
              { type: 'Long terme', count: 6, percent: 40 },
              { type: 'Temporaire', count: 4, percent: 27 },
              { type: 'Picking', count: 3, percent: 20 },
              { type: 'Cross-dock', count: 2, percent: 13 }
            ].map((item) => (
              <div key={item.type}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.type}</span>
                  <span className="text-gray-600">{item.count} contrats</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${item.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Top régions actives</h3>
          <div className="space-y-3">
            {[
              { region: 'Île-de-France', count: 5 },
              { region: 'Auvergne-Rhône-Alpes', count: 3 },
              { region: 'Hauts-de-France', count: 2 },
              { region: 'Provence-Alpes-Côte d\'Azur', count: 2 }
            ].map((item) => (
              <div key={item.region} className="flex justify-between items-center">
                <span>{item.region}</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-medium">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <a href="/storage-market/needs" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="font-semibold mb-2">Gérer les besoins</h3>
          <p className="text-sm text-gray-600">Superviser toutes les publications</p>
        </a>
        <a href="/storage-market/logisticians" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="font-semibold mb-2">Gérer les logisticiens</h3>
          <p className="text-sm text-gray-600">Valider les abonnements</p>
        </a>
        <a href="/storage-market/analytics" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="font-semibold mb-2">Analytics avancés</h3>
          <p className="text-sm text-gray-600">Rapports et statistiques</p>
        </a>
      </div>
    </div>
  )
}
