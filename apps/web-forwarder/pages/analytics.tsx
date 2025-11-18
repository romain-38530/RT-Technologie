import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../components/Card';
import AIBadge from '../components/AIBadge';
import { loadOrders, loadCarriers, getAssignment, Order, Carrier, Assignment } from '../lib/api';

interface AnalyticsData {
  aiVsManual: { name: string; ai: number; manual: number }[];
  savingsByRoute: { route: string; savings: number }[];
  carrierPerformance: { name: string; orders: number; avgPrice: number; scoring: number }[];
  assignmentSources: { name: string; value: number }[];
}

export default function Analytics() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [assignments, setAssignments] = useState<Map<string, Assignment>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [ordersData, carriersData] = await Promise.all([
          loadOrders(),
          loadCarriers()
        ]);
        setOrders(ordersData);
        setCarriers(carriersData);

        const assignmentsMap = new Map<string, Assignment>();
        for (const order of ordersData) {
          try {
            const { assignment } = await getAssignment(order.id);
            if (assignment) {
              assignmentsMap.set(order.id, assignment);
            }
          } catch (e) {
            // Ignorer
          }
        }
        setAssignments(assignmentsMap);
      } catch (error) {
        console.error('Erreur chargement analytics:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40 }}>Chargement des analytics...</div>;
  }

  const aiAssignments = Array.from(assignments.values()).filter(a => a.source === 'ai');
  const manualAssignments = Array.from(assignments.values()).filter(a => a.source !== 'ai');

  const totalSavings = aiAssignments.reduce((sum, a) => {
    if (a.priceRef && a.price < a.priceRef.price) {
      return sum + (a.priceRef.price - a.price);
    }
    return sum;
  }, 0);

  const avgAIPrice = aiAssignments.length > 0
    ? aiAssignments.reduce((sum, a) => sum + a.price, 0) / aiAssignments.length
    : 0;

  const avgManualPrice = manualAssignments.length > 0
    ? manualAssignments.reduce((sum, a) => sum + a.price, 0) / manualAssignments.length
    : 0;

  // Donnees pour les graphiques
  const analyticsData: AnalyticsData = {
    aiVsManual: [
      { name: 'AI', ai: aiAssignments.length, manual: 0 },
      { name: 'Manuel', ai: 0, manual: manualAssignments.length },
    ],
    savingsByRoute: [],
    carrierPerformance: [],
    assignmentSources: [
      { name: 'AI', value: aiAssignments.length },
      { name: 'Manuel', value: manualAssignments.length },
      { name: 'Bid', value: Array.from(assignments.values()).filter(a => a.source === 'bid').length },
    ].filter(s => s.value > 0),
  };

  // Economies par route
  const routeSavings = new Map<string, number>();
  aiAssignments.forEach(a => {
    const order = orders.find(o => o.id === a.orderId);
    if (order && a.priceRef && a.price < a.priceRef.price) {
      const route = `${order.ship_from}-${order.ship_to}`;
      const savings = a.priceRef.price - a.price;
      routeSavings.set(route, (routeSavings.get(route) || 0) + savings);
    }
  });
  analyticsData.savingsByRoute = Array.from(routeSavings.entries())
    .map(([route, savings]) => ({ route, savings }))
    .sort((a, b) => b.savings - a.savings)
    .slice(0, 5);

  // Performance des transporteurs
  const carrierStats = new Map<string, { count: number; totalPrice: number; scoring: number }>();
  assignments.forEach(a => {
    const carrier = carriers.find(c => c.id === a.carrierId);
    if (carrier) {
      const stats = carrierStats.get(carrier.id) || { count: 0, totalPrice: 0, scoring: carrier.scoring };
      stats.count += 1;
      stats.totalPrice += a.price;
      carrierStats.set(carrier.id, stats);
    }
  });
  analyticsData.carrierPerformance = Array.from(carrierStats.entries())
    .map(([id, stats]) => {
      const carrier = carriers.find(c => c.id === id);
      return {
        name: carrier?.name || id,
        orders: stats.count,
        avgPrice: stats.totalPrice / stats.count,
        scoring: stats.scoring
      };
    })
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 5);

  const COLORS = ['#667eea', '#764ba2', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
        Analytics Affret.IA
      </h1>
      <p style={{ color: '#666', marginBottom: 32 }}>
        Analysez les performances, economies et comparaisons AI vs manuel
      </p>

      {/* KPIs principaux */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, marginBottom: 32 }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 4px 12px rgba(102,126,234,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ fontSize: 14, opacity: 0.9 }}>Affretements IA</div>
            <AIBadge size="sm" />
          </div>
          <div style={{ fontSize: 36, fontWeight: 700 }}>{aiAssignments.length}</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>
            {assignments.size > 0 ? `${((aiAssignments.length / assignments.size) * 100).toFixed(0)}%` : '0%'} du total
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Economies totales</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#10b981' }}>
            {totalSavings.toFixed(0)} EUR
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
            Grace a l'IA vs grilles
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Prix moyen IA</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#667eea' }}>
            {avgAIPrice > 0 ? avgAIPrice.toFixed(0) : 'N/A'}
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
            {avgManualPrice > 0 && avgAIPrice > 0 && avgAIPrice < avgManualPrice && (
              <span style={{ color: '#10b981', fontWeight: 600 }}>
                -{((avgManualPrice - avgAIPrice) / avgManualPrice * 100).toFixed(0)}% vs manuel
              </span>
            )}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Affretements totaux</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#1f2937' }}>{assignments.size}</div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
            {manualAssignments.length} manuels
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, marginBottom: 24 }}>
        {/* Sources d'affretement */}
        <Card title="Sources d'affretement">
          {analyticsData.assignmentSources.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
              Aucune donnee disponible
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.assignmentSources}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.assignmentSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* AI vs Manuel */}
        <Card title="AI vs Manuel">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.aiVsManual}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ai" fill="#667eea" name="AI" />
              <Bar dataKey="manual" fill="#9ca3af" name="Manuel" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Economies par route */}
      {analyticsData.savingsByRoute.length > 0 && (
        <Card title="Top 5 - Economies par route">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.savingsByRoute} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="route" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="savings" fill="#10b981" name="Economies (EUR)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Performance des transporteurs */}
      {analyticsData.carrierPerformance.length > 0 && (
        <Card title="Top 5 - Performance des transporteurs">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: 12, fontSize: 14, fontWeight: 600 }}>Transporteur</th>
                  <th style={{ textAlign: 'center', padding: 12, fontSize: 14, fontWeight: 600 }}>Commandes</th>
                  <th style={{ textAlign: 'center', padding: 12, fontSize: 14, fontWeight: 600 }}>Prix moyen</th>
                  <th style={{ textAlign: 'center', padding: 12, fontSize: 14, fontWeight: 600 }}>Scoring</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.carrierPerformance.map((carrier, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: 12, fontWeight: 600 }}>{carrier.name}</td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
                      <span style={{
                        background: '#667eea',
                        color: '#fff',
                        padding: '4px 12px',
                        borderRadius: 6,
                        fontSize: 14,
                        fontWeight: 600
                      }}>
                        {carrier.orders}
                      </span>
                    </td>
                    <td style={{ padding: 12, textAlign: 'center', fontSize: 16, fontWeight: 700 }}>
                      {carrier.avgPrice.toFixed(0)} EUR
                    </td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
                      <span style={{
                        background: carrier.scoring >= 85 ? '#10b981' : carrier.scoring >= 70 ? '#f59e0b' : '#ef4444',
                        color: '#fff',
                        padding: '4px 12px',
                        borderRadius: 6,
                        fontSize: 14,
                        fontWeight: 600
                      }}>
                        {carrier.scoring}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Insights */}
      <Card title="Insights">
        <div style={{ display: 'grid', gap: 16 }}>
          {aiAssignments.length > 0 && (
            <div style={{
              padding: 16,
              background: '#f0f9ff',
              border: '1px solid #667eea',
              borderRadius: 8,
              display: 'flex',
              gap: 12
            }}>
              <div style={{ fontSize: 24 }}>💡</div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4, color: '#1e40af' }}>
                  Performance IA exceptionnelle
                </div>
                <div style={{ fontSize: 14, color: '#1e3a8a' }}>
                  L'IA a traite {aiAssignments.length} commande{aiAssignments.length > 1 ? 's' : ''} avec succes,
                  generant {totalSavings.toFixed(0)} EUR d'economies par rapport aux grilles tarifaires.
                </div>
              </div>
            </div>
          )}

          {avgAIPrice > 0 && avgManualPrice > 0 && avgAIPrice < avgManualPrice && (
            <div style={{
              padding: 16,
              background: '#d1fae5',
              border: '1px solid #10b981',
              borderRadius: 8,
              display: 'flex',
              gap: 12
            }}>
              <div style={{ fontSize: 24 }}>📊</div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4, color: '#065f46' }}>
                  Prix IA plus competitifs
                </div>
                <div style={{ fontSize: 14, color: '#065f46' }}>
                  Le prix moyen des affretements IA ({avgAIPrice.toFixed(0)} EUR) est inferieur de{' '}
                  {((avgManualPrice - avgAIPrice) / avgManualPrice * 100).toFixed(0)}% au prix moyen manuel.
                </div>
              </div>
            </div>
          )}

          {analyticsData.savingsByRoute.length > 0 && (
            <div style={{
              padding: 16,
              background: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: 8,
              display: 'flex',
              gap: 12
            }}>
              <div style={{ fontSize: 24 }}>🎯</div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4, color: '#92400e' }}>
                  Route la plus economique
                </div>
                <div style={{ fontSize: 14, color: '#92400e' }}>
                  La route {analyticsData.savingsByRoute[0].route} genere les plus grandes economies:{' '}
                  {analyticsData.savingsByRoute[0].savings.toFixed(0)} EUR.
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
