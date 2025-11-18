import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Card from '../components/Card';
import PriceComparator from '../components/PriceComparator';
import CarrierCard from '../components/CarrierCard';
import AIBadge from '../components/AIBadge';
import { loadOrders, loadCarriers, getQuote, dispatchOrder, Order, Carrier, Quote } from '../lib/api';

export default function Quotes() {
  const router = useRouter();
  const { orderId: queryOrderId } = router.query;

  const [orders, setOrders] = useState<Order[]>([]);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<any>(null);

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
      } else if (ordersData.length > 0) {
        setSelectedOrderId(ordersData[0].id);
      }
    }
    load();
  }, [queryOrderId]);

  const selectedOrder = orders.find(o => o.id === selectedOrderId);
  const premiumCarriers = carriers.filter(c => c.premium && !c.blocked);

  const handleGetQuote = async () => {
    if (!selectedOrderId) return;
    setLoading(true);
    setQuote(null);
    setDispatchResult(null);
    try {
      const quoteData = await getQuote(selectedOrderId);
      setQuote(quoteData);
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatch = async () => {
    if (!selectedOrderId) return;
    setDispatching(true);
    try {
      const result = await dispatchOrder(selectedOrderId);
      setDispatchResult(result);
    } catch (error: any) {
      alert('Erreur dispatch: ' + error.message);
    } finally {
      setDispatching(false);
    }
  };

  const suggestedCarriers = quote?.suggestedCarriers
    ?.map(id => carriers.find(c => c.id === id))
    .filter(Boolean) as Carrier[] || [];

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
        Cotations AI
      </h1>
      <p style={{ color: '#666', marginBottom: 32 }}>
        Obtenez des cotations instantanees generees par l'IA avec prix de reference et transporteurs suggeres
      </p>

      <Card title="Selectionner une commande">
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>
          <div>
            <select
              value={selectedOrderId}
              onChange={(e) => {
                setSelectedOrderId(e.target.value);
                setQuote(null);
                setDispatchResult(null);
              }}
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                fontSize: 14,
                marginBottom: 16
              }}
            >
              <option value="">-- Choisir une commande --</option>
              {orders.map(order => (
                <option key={order.id} value={order.id}>
                  {order.ref} - {order.ship_from} → {order.ship_to}
                </option>
              ))}
            </select>

            <button
              onClick={handleGetQuote}
              disabled={!selectedOrderId || loading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: 8,
                border: 'none',
                fontSize: 16,
                fontWeight: 600,
                cursor: selectedOrderId && !loading ? 'pointer' : 'not-allowed',
                opacity: selectedOrderId && !loading ? 1 : 0.5
              }}
            >
              {loading ? 'Chargement...' : 'Obtenir cotation AI'}
            </button>
          </div>

          {selectedOrder && (
            <div style={{
              background: '#f9fafb',
              padding: 20,
              borderRadius: 8,
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Details de la commande</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, fontSize: 14 }}>
                <div>
                  <strong>Reference:</strong> {selectedOrder.ref}
                </div>
                <div>
                  <strong>ID:</strong> {selectedOrder.id}
                </div>
                <div>
                  <strong>Origine:</strong> {selectedOrder.ship_from}
                </div>
                <div>
                  <strong>Destination:</strong> {selectedOrder.ship_to}
                </div>
                <div>
                  <strong>Palettes:</strong> {selectedOrder.pallets}
                </div>
                <div>
                  <strong>Poids:</strong> {selectedOrder.weight} kg
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <strong>Statut:</strong>{' '}
                  <span style={{
                    background: selectedOrder.forceEscalation ? '#f59e0b' : '#10b981',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {selectedOrder.forceEscalation ? 'Escaladee' : selectedOrder.status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {quote && (
        <>
          <Card
            title="Comparaison des prix"
            action={<AIBadge size="md" />}
          >
            <PriceComparator
              prices={[
                {
                  label: 'Prix AI',
                  value: quote.price,
                  currency: quote.currency,
                  isAI: true,
                  description: 'Prix genere par l\'IA'
                },
                ...(quote.priceRef ? [{
                  label: `Prix reference (${quote.priceRef.mode})`,
                  value: quote.priceRef.price,
                  currency: quote.priceRef.currency,
                  description: 'Prix grille tarifaire'
                }] : [])
              ]}
            />

            {quote.priceRef && quote.price < quote.priceRef.price && (
              <div style={{
                marginTop: 24,
                padding: 16,
                background: '#d1fae5',
                border: '1px solid #10b981',
                borderRadius: 8,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 14, color: '#065f46', fontWeight: 600 }}>
                  Economie potentielle: {(quote.priceRef.price - quote.price).toFixed(2)} EUR
                </div>
              </div>
            )}
          </Card>

          <Card title="Transporteurs suggeres">
            {suggestedCarriers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                Aucun transporteur premium suggere
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                {suggestedCarriers.map(carrier => (
                  <CarrierCard key={carrier.id} carrier={carrier} />
                ))}
              </div>
            )}
          </Card>

          <Card title="Actions">
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <button
                onClick={handleDispatch}
                disabled={dispatching}
                style={{
                  background: '#10b981',
                  color: '#fff',
                  padding: '12px 24px',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: dispatching ? 'not-allowed' : 'pointer',
                  opacity: dispatching ? 0.5 : 1
                }}
              >
                {dispatching ? 'Dispatch en cours...' : 'Dispatcher automatiquement'}
              </button>

              <a
                href={`/tenders?orderId=${selectedOrderId}`}
                style={{
                  background: '#667eea',
                  color: '#fff',
                  padding: '12px 24px',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                Lancer un appel d'offres
              </a>
            </div>

            {dispatchResult && (
              <div style={{
                marginTop: 16,
                padding: 16,
                background: dispatchResult.assignedCarrierId ? '#d1fae5' : '#fef3c7',
                border: `1px solid ${dispatchResult.assignedCarrierId ? '#10b981' : '#f59e0b'}`,
                borderRadius: 8
              }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                  Resultat du dispatch
                </h4>
                {dispatchResult.assignedCarrierId ? (
                  <div style={{ fontSize: 14 }}>
                    <strong>Transporteur assigne:</strong> {dispatchResult.assignedCarrierId}
                    <br />
                    <strong>Prix:</strong> {dispatchResult.quote?.price || 'N/A'} EUR
                    <br />
                    <strong>Source:</strong> {dispatchResult.source || 'N/A'}
                  </div>
                ) : (
                  <div style={{ fontSize: 14, color: '#92400e' }}>
                    Aucun transporteur n'a pu etre assigne automatiquement
                  </div>
                )}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
