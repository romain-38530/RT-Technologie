import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

interface Order {
  id: string;
  type: 'reception' | 'expedition';
  carrier: string;
  origin: string;
  destination: string;
}

export default function NewECMR() {
  const router = useRouter();
  const [orderId, setOrderId] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('logistician_jwt');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchOrders();
  }, [router]);

  const fetchOrders = async () => {
    try {
      // Mock data - Replace with actual API call
      setOrders([
        {
          id: 'ORD-004',
          type: 'reception',
          carrier: 'Fast Delivery',
          origin: 'Paris',
          destination: 'Lyon'
        },
        {
          id: 'ORD-005',
          type: 'expedition',
          carrier: 'Global Transport',
          origin: 'Lyon',
          destination: 'Marseille'
        }
      ]);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
    setOrderId(order.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // API call to create eCMR
      console.log('Creating eCMR for order:', orderId);

      // Redirect to sign page
      router.push(`/ecmr/sign?orderId=${orderId}`);
    } catch (error) {
      console.error('Error creating eCMR:', error);
      alert('Erreur lors de la création du CMR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => router.back()}
          style={{
            padding: '8px 16px',
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '16px',
            minHeight: '44px'
          }}
        >
          ← Retour
        </button>
        <h2 style={{ fontSize: '24px', fontWeight: 600 }}>Nouveau E-CMR</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '16px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Sélectionner une commande</h3>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151'
            }}>
              N° de commande
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Entrez le numéro de commande"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                minHeight: '48px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '12px' }}>
              Ou sélectionner dans la liste:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {orders.map(order => (
                <div
                  key={order.id}
                  onClick={() => handleOrderSelect(order)}
                  style={{
                    padding: '16px',
                    border: selectedOrder?.id === order.id ? '2px solid #2563eb' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: selectedOrder?.id === order.id ? '#eff6ff' : 'white',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 600 }}>{order.id}</div>
                    <span style={{
                      padding: '4px 12px',
                      background: order.type === 'reception' ? '#ddd6fe' : '#d1fae5',
                      color: order.type === 'reception' ? '#6b21a8' : '#065f46',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      {order.type === 'reception' ? 'Réception' : 'Expédition'}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    Transporteur: {order.carrier}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {order.origin} → {order.destination}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!orderId || loading}
          style={{
            width: '100%',
            padding: '14px',
            background: !orderId || loading ? '#9ca3af' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: !orderId || loading ? 'not-allowed' : 'pointer',
            minHeight: '52px'
          }}
        >
          {loading ? 'Création...' : 'Continuer vers la signature'}
        </button>
      </form>
    </div>
  );
}
