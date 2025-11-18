import { useEffect, useState } from 'react';
import Card from '../components/Card';
import AIBadge from '../components/AIBadge';
import { loadOrders, getAssignment, Order, Assignment } from '../lib/api';

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [assignments, setAssignments] = useState<Map<string, Assignment>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const ordersData = await loadOrders();
        setOrders(ordersData);

        // Charger les assignments pour chaque ordre
        const assignmentsMap = new Map<string, Assignment>();
        for (const order of ordersData) {
          try {
            const { assignment } = await getAssignment(order.id);
            if (assignment) {
              assignmentsMap.set(order.id, assignment);
            }
          } catch (e) {
            // Ignorer les erreurs individuelles
          }
        }
        setAssignments(assignmentsMap);
      } catch (error) {
        console.error('Erreur chargement dashboard:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const escalatedOrders = orders.filter(o => o.forceEscalation);
  const aiAssignments = Array.from(assignments.values()).filter(a => a.source === 'ai');
  const totalSavings = aiAssignments.reduce((sum, a) => {
    if (a.priceRef && a.price < a.priceRef.price) {
      return sum + (a.priceRef.price - a.price);
    }
    return sum;
  }, 0);

  const autoAcceptRate = assignments.size > 0 ? (aiAssignments.length / assignments.size) * 100 : 0;

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40 }}>Chargement...</div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
        Dashboard Affret.IA
      </h1>
      <p style={{ color: '#666', marginBottom: 32 }}>
        Vue d'ensemble de vos operations d'affretement automatisees
      </p>

      {/* Metriques principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, marginBottom: 32 }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 4px 12px rgba(102,126,234,0.3)'
        }}>
          <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Commandes escaladees</div>
          <div style={{ fontSize: 36, fontWeight: 700 }}>{escalatedOrders.length}</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>Necessitent affretement IA</div>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Economies realisees</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#10b981' }}>
            {totalSavings.toFixed(0)} EUR
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>Grace a l'IA vs grilles</div>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Taux d'acceptation auto</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#667eea' }}>
            {autoAcceptRate.toFixed(0)}%
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
            {aiAssignments.length} / {assignments.size} affretements
          </div>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Commandes totales</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#1f2937' }}>{orders.length}</div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>Dans le systeme</div>
        </div>
      </div>

      {/* Commandes escaladees */}
      <Card title="Commandes escaladees - Affret.IA">
        {escalatedOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
            Aucune commande escaladee pour le moment
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {escalatedOrders.map(order => {
              const assignment = assignments.get(order.id);
              return (
                <div
                  key={order.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    padding: 16,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr auto',
                    gap: 16,
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Reference</div>
                    <div style={{ fontWeight: 600 }}>{order.ref}</div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{order.id}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Route</div>
                    <div style={{ fontWeight: 600 }}>
                      {order.ship_from} → {order.ship_to}
                    </div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                      {order.pallets} palettes • {order.weight}kg
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Statut</div>
                    {assignment ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          background: '#10b981',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 600
                        }}>
                          Affrete
                        </span>
                        {assignment.source === 'ai' && <AIBadge size="sm" />}
                      </div>
                    ) : (
                      <span style={{
                        background: '#f59e0b',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600
                      }}>
                        En attente
                      </span>
                    )}
                  </div>
                  <div>
                    <a
                      href={`/quotes?orderId=${order.id}`}
                      style={{
                        background: '#667eea',
                        color: '#fff',
                        padding: '8px 16px',
                        borderRadius: 6,
                        fontSize: 14,
                        fontWeight: 600,
                        textDecoration: 'none',
                        display: 'inline-block'
                      }}
                    >
                      Coter
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Affretements recents */}
      <Card title="Affretements recents">
        {assignments.size === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
            Aucun affretement pour le moment
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {Array.from(assignments.entries()).slice(0, 5).map(([orderId, assignment]) => {
              const order = orders.find(o => o.id === orderId);
              if (!order) return null;

              const savings = assignment.priceRef && assignment.price < assignment.priceRef.price
                ? assignment.priceRef.price - assignment.price
                : 0;

              return (
                <div
                  key={orderId}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    padding: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>
                      {order.ref} - {order.ship_from} → {order.ship_to}
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      Transporteur: {assignment.carrierId} • {assignment.price} {assignment.currency}
                      {assignment.source === 'ai' && (
                        <span style={{ marginLeft: 8 }}>
                          <AIBadge size="sm" />
                        </span>
                      )}
                    </div>
                  </div>
                  {savings > 0 && (
                    <div style={{
                      background: '#d1fae5',
                      color: '#065f46',
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      -{savings.toFixed(0)} EUR
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
