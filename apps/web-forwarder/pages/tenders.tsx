import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Card from '../components/Card';
import CarrierCard from '../components/CarrierCard';
import { loadOrders, loadCarriers, getBids, submitBid, Order, Carrier, Bid } from '../lib/api';

export default function Tenders() {
  const router = useRouter();
  const { orderId: queryOrderId } = router.query;

  const [orders, setOrders] = useState<Order[]>([]);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(false);
  const [newBid, setNewBid] = useState({ carrierId: '', price: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const [ordersData, carriersData] = await Promise.all([
        loadOrders(),
        loadCarriers()
      ]);
      setOrders(ordersData);
      setCarriers(carriersData);

      if (queryOrderId && typeof queryOrderId === 'string') {
        setSelectedOrderId(queryOrderId);
        loadBids(queryOrderId);
      } else if (ordersData.length > 0) {
        setSelectedOrderId(ordersData[0].id);
        loadBids(ordersData[0].id);
      }
    }
    load();
  }, [queryOrderId]);

  const loadBids = async (orderId: string) => {
    setLoading(true);
    try {
      const { bids: bidsData } = await getBids(orderId);
      setBids(bidsData);
    } catch (error) {
      console.error('Erreur chargement bids:', error);
      setBids([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderChange = (orderId: string) => {
    setSelectedOrderId(orderId);
    setNewBid({ carrierId: '', price: '' });
    if (orderId) {
      loadBids(orderId);
    }
  };

  const handleSubmitBid = async () => {
    if (!selectedOrderId || !newBid.carrierId || !newBid.price) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    setSubmitting(true);
    try {
      await submitBid(selectedOrderId, newBid.carrierId, parseFloat(newBid.price));
      alert('Offre soumise avec succes !');
      setNewBid({ carrierId: '', price: '' });
      loadBids(selectedOrderId);
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedOrder = orders.find(o => o.id === selectedOrderId);
  const premiumCarriers = carriers.filter(c => c.premium && !c.blocked);

  const sortedBids = [...bids].sort((a, b) => a.price - b.price);
  const bestBid = sortedBids[0];

  const getBidCarrier = (carrierId: string) => carriers.find(c => c.id === carrierId);

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
        Appels d'offres
      </h1>
      <p style={{ color: '#666', marginBottom: 32 }}>
        Lancez des tenders et comparez les offres des transporteurs premium
      </p>

      <Card title="Selectionner une commande">
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>
          <select
            value={selectedOrderId}
            onChange={(e) => handleOrderChange(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              fontSize: 14
            }}
          >
            <option value="">-- Choisir une commande --</option>
            {orders.map(order => (
              <option key={order.id} value={order.id}>
                {order.ref} - {order.ship_from} → {order.ship_to}
              </option>
            ))}
          </select>

          {selectedOrder && (
            <div style={{
              background: '#f9fafb',
              padding: 20,
              borderRadius: 8,
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Details de la commande</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, fontSize: 14 }}>
                <div><strong>Ref:</strong> {selectedOrder.ref}</div>
                <div><strong>Route:</strong> {selectedOrder.ship_from} → {selectedOrder.ship_to}</div>
                <div><strong>Palettes:</strong> {selectedOrder.pallets}</div>
                <div><strong>Poids:</strong> {selectedOrder.weight} kg</div>
                <div><strong>ID:</strong> {selectedOrder.id}</div>
                <div>
                  <strong>Offres recues:</strong>{' '}
                  <span style={{
                    background: bids.length > 0 ? '#10b981' : '#9ca3af',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {bids.length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {selectedOrderId && (
        <>
          <Card title="Soumettre une offre">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px auto', gap: 16, alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                  Transporteur premium
                </label>
                <select
                  value={newBid.carrierId}
                  onChange={(e) => setNewBid({ ...newBid, carrierId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    fontSize: 14
                  }}
                >
                  <option value="">-- Choisir un transporteur --</option>
                  {premiumCarriers.map(carrier => (
                    <option key={carrier.id} value={carrier.id}>
                      {carrier.name} (Scoring: {carrier.scoring})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                  Prix (EUR)
                </label>
                <input
                  type="number"
                  value={newBid.price}
                  onChange={(e) => setNewBid({ ...newBid, price: e.target.value })}
                  placeholder="950.00"
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    fontSize: 14
                  }}
                />
              </div>

              <button
                onClick={handleSubmitBid}
                disabled={submitting || !newBid.carrierId || !newBid.price}
                style={{
                  background: '#667eea',
                  color: '#fff',
                  padding: '12px 24px',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: submitting || !newBid.carrierId || !newBid.price ? 'not-allowed' : 'pointer',
                  opacity: submitting || !newBid.carrierId || !newBid.price ? 0.5 : 1
                }}
              >
                {submitting ? 'Envoi...' : 'Soumettre'}
              </button>
            </div>
          </Card>

          <Card title={`Offres recues (${bids.length})`}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                Chargement des offres...
              </div>
            ) : bids.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                Aucune offre pour cette commande
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ textAlign: 'left', padding: 12, fontSize: 14, fontWeight: 600 }}>Rang</th>
                      <th style={{ textAlign: 'left', padding: 12, fontSize: 14, fontWeight: 600 }}>Transporteur</th>
                      <th style={{ textAlign: 'left', padding: 12, fontSize: 14, fontWeight: 600 }}>Scoring</th>
                      <th style={{ textAlign: 'left', padding: 12, fontSize: 14, fontWeight: 600 }}>Prix</th>
                      <th style={{ textAlign: 'left', padding: 12, fontSize: 14, fontWeight: 600 }}>Date</th>
                      <th style={{ textAlign: 'left', padding: 12, fontSize: 14, fontWeight: 600 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBids.map((bid, idx) => {
                      const carrier = getBidCarrier(bid.carrierId);
                      const isBest = bid === bestBid;
                      return (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: '1px solid #f3f4f6',
                            background: isBest ? '#f0fdf4' : 'transparent'
                          }}
                        >
                          <td style={{ padding: 12 }}>
                            <div style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: isBest ? '#10b981' : '#e5e7eb',
                              color: isBest ? '#fff' : '#666',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: 14
                            }}>
                              {idx + 1}
                            </div>
                          </td>
                          <td style={{ padding: 12 }}>
                            <div style={{ fontWeight: 600 }}>{carrier?.name || bid.carrierId}</div>
                            <div style={{ fontSize: 12, color: '#666' }}>{carrier?.email}</div>
                          </td>
                          <td style={{ padding: 12 }}>
                            <span style={{
                              background: bid.scoring && bid.scoring >= 85 ? '#10b981' : bid.scoring && bid.scoring >= 70 ? '#f59e0b' : '#ef4444',
                              color: '#fff',
                              padding: '4px 8px',
                              borderRadius: 4,
                              fontSize: 12,
                              fontWeight: 600
                            }}>
                              {bid.scoring ?? 'N/A'}
                            </span>
                          </td>
                          <td style={{ padding: 12 }}>
                            <div style={{ fontSize: 18, fontWeight: 700 }}>
                              {bid.price.toFixed(2)} {bid.currency}
                            </div>
                            {isBest && (
                              <div style={{ fontSize: 10, color: '#10b981', fontWeight: 600 }}>
                                MEILLEURE OFFRE
                              </div>
                            )}
                          </td>
                          <td style={{ padding: 12, fontSize: 12, color: '#666' }}>
                            {new Date(bid.at).toLocaleDateString('fr-FR')}
                            <br />
                            {new Date(bid.at).toLocaleTimeString('fr-FR')}
                          </td>
                          <td style={{ padding: 12 }}>
                            {isBest && (
                              <button
                                style={{
                                  background: '#10b981',
                                  color: '#fff',
                                  padding: '6px 12px',
                                  borderRadius: 6,
                                  border: 'none',
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                Accepter
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {bestBid && (
            <Card title="Analyse comparative">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                <div style={{ background: '#f0fdf4', padding: 16, borderRadius: 8, border: '1px solid #10b981' }}>
                  <div style={{ fontSize: 12, color: '#065f46', marginBottom: 4 }}>Meilleure offre</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>
                    {bestBid.price.toFixed(2)} EUR
                  </div>
                </div>
                <div style={{ background: '#f9fafb', padding: 16, borderRadius: 8, border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Prix moyen</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#1f2937' }}>
                    {(bids.reduce((sum, b) => sum + b.price, 0) / bids.length).toFixed(2)} EUR
                  </div>
                </div>
                <div style={{ background: '#f9fafb', padding: 16, borderRadius: 8, border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Offre la plus haute</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#1f2937' }}>
                    {Math.max(...bids.map(b => b.price)).toFixed(2)} EUR
                  </div>
                </div>
                <div style={{ background: '#f9fafb', padding: 16, borderRadius: 8, border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Ecart min/max</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#1f2937' }}>
                    {(Math.max(...bids.map(b => b.price)) - Math.min(...bids.map(b => b.price))).toFixed(2)} EUR
                  </div>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
