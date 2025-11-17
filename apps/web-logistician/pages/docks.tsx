import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface Dock {
  id: string;
  name: string;
  status: 'available' | 'occupied' | 'maintenance';
  currentOrder?: {
    id: string;
    type: 'reception' | 'expedition';
    carrier: string;
    arrival: string;
    estimatedDuration: number;
  };
}

interface Appointment {
  id: string;
  orderId: string;
  dockId: string;
  carrier: string;
  type: 'reception' | 'expedition';
  scheduledAt: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'arrived' | 'completed';
}

export default function Docks() {
  const router = useRouter();
  const [docks, setDocks] = useState<Dock[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const token = localStorage.getItem('logistician_jwt');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchDocks();
    fetchAppointments();
  }, [selectedDate, router]);

  const fetchDocks = async () => {
    try {
      // Mock data - Replace with actual API call to Planning service
      setDocks([
        {
          id: 'D1',
          name: 'Quai 1',
          status: 'occupied',
          currentOrder: {
            id: 'ORD-001',
            type: 'reception',
            carrier: 'Transport ABC',
            arrival: '09:30',
            estimatedDuration: 120
          }
        },
        {
          id: 'D2',
          name: 'Quai 2',
          status: 'occupied',
          currentOrder: {
            id: 'ORD-002',
            type: 'expedition',
            carrier: 'Logistics XYZ',
            arrival: '10:00',
            estimatedDuration: 90
          }
        },
        {
          id: 'D3',
          name: 'Quai 3',
          status: 'available'
        },
        {
          id: 'D4',
          name: 'Quai 4',
          status: 'available'
        },
        {
          id: 'D5',
          name: 'Quai 5',
          status: 'occupied',
          currentOrder: {
            id: 'ORD-003',
            type: 'reception',
            carrier: 'Express Transport',
            arrival: '11:00',
            estimatedDuration: 60
          }
        },
        {
          id: 'D6',
          name: 'Quai 6',
          status: 'available'
        },
        {
          id: 'D7',
          name: 'Quai 7',
          status: 'maintenance'
        },
        {
          id: 'D8',
          name: 'Quai 8',
          status: 'available'
        }
      ]);
    } catch (error) {
      console.error('Error fetching docks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      // Mock data - Replace with actual API call
      setAppointments([
        {
          id: 'APT-001',
          orderId: 'ORD-004',
          dockId: 'D3',
          carrier: 'Fast Delivery',
          type: 'reception',
          scheduledAt: '14:00',
          duration: 90,
          status: 'confirmed'
        },
        {
          id: 'APT-002',
          orderId: 'ORD-005',
          dockId: 'D4',
          carrier: 'Global Transport',
          type: 'expedition',
          scheduledAt: '15:30',
          duration: 60,
          status: 'confirmed'
        },
        {
          id: 'APT-003',
          orderId: 'ORD-006',
          dockId: 'D6',
          carrier: 'Rapid Logistics',
          type: 'reception',
          scheduledAt: '16:00',
          duration: 75,
          status: 'pending'
        }
      ]);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleArrival = async (appointmentId: string) => {
    const confirmed = confirm('Confirmer l\'arrivée du transporteur ?');
    if (!confirmed) return;

    try {
      // API call to mark arrival
      console.log('Marking arrival for:', appointmentId);
      // Refresh data
      fetchDocks();
      fetchAppointments();
    } catch (error) {
      console.error('Error marking arrival:', error);
      alert('Erreur lors de la confirmation d\'arrivée');
    }
  };

  const handleRelease = async (dockId: string) => {
    const confirmed = confirm('Libérer ce quai ?');
    if (!confirmed) return;

    try {
      // API call to release dock
      console.log('Releasing dock:', dockId);
      // Refresh data
      fetchDocks();
      fetchAppointments();
    } catch (error) {
      console.error('Error releasing dock:', error);
      alert('Erreur lors de la libération du quai');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Chargement...</div>;
  }

  const occupiedCount = docks.filter(d => d.status === 'occupied').length;
  const availableCount = docks.filter(d => d.status === 'available').length;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px' }}>Planning des Quais</h2>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: '#6b7280' }}>
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '10px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                minHeight: '44px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <StatusBadge color="#10b981" count={availableCount} label="Disponibles" />
            <StatusBadge color="#f59e0b" count={occupiedCount} label="Occupés" />
            <StatusBadge color="#ef4444" count={docks.filter(d => d.status === 'maintenance').length} label="Maintenance" />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>État des quais</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {docks.map(dock => (
            <DockCard key={dock.id} dock={dock} onRelease={handleRelease} />
          ))}
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
          Rendez-vous programmés ({appointments.length})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {appointments.length === 0 ? (
            <div style={{
              background: 'white',
              padding: '32px',
              borderRadius: '12px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              Aucun rendez-vous programmé pour cette date
            </div>
          ) : (
            appointments.map(apt => (
              <AppointmentCard key={apt.id} appointment={apt} onArrival={handleArrival} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function DockCard({ dock, onRelease }: { dock: Dock; onRelease: (id: string) => void }) {
  const statusConfig = {
    available: { color: '#10b981', bg: '#d1fae5', label: 'Disponible' },
    occupied: { color: '#f59e0b', bg: '#fef3c7', label: 'Occupé' },
    maintenance: { color: '#ef4444', bg: '#fee2e2', label: 'Maintenance' }
  };

  const config = statusConfig[dock.status];

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${config.color}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
        <h4 style={{ fontSize: '18px', fontWeight: 600 }}>{dock.name}</h4>
        <span style={{
          padding: '4px 12px',
          background: config.bg,
          color: config.color,
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 600
        }}>
          {config.label}
        </span>
      </div>

      {dock.currentOrder && (
        <div style={{ marginTop: '12px', fontSize: '14px' }}>
          <div style={{ color: '#6b7280', marginBottom: '8px' }}>
            <strong>Commande:</strong> {dock.currentOrder.id}
          </div>
          <div style={{ color: '#6b7280', marginBottom: '8px' }}>
            <strong>Type:</strong> {dock.currentOrder.type === 'reception' ? 'Réception' : 'Expédition'}
          </div>
          <div style={{ color: '#6b7280', marginBottom: '8px' }}>
            <strong>Transporteur:</strong> {dock.currentOrder.carrier}
          </div>
          <div style={{ color: '#6b7280', marginBottom: '12px' }}>
            <strong>Arrivée:</strong> {dock.currentOrder.arrival} ({dock.currentOrder.estimatedDuration} min)
          </div>
          <button
            onClick={() => onRelease(dock.id)}
            style={{
              width: '100%',
              padding: '10px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              minHeight: '44px'
            }}
          >
            Libérer le quai
          </button>
        </div>
      )}
    </div>
  );
}

function AppointmentCard({ appointment, onArrival }: { appointment: Appointment; onArrival: (id: string) => void }) {
  const typeConfig = {
    reception: { color: '#8b5cf6', label: 'Réception' },
    expedition: { color: '#10b981', label: 'Expédition' }
  };

  const statusConfig = {
    pending: { color: '#f59e0b', label: 'En attente' },
    confirmed: { color: '#3b82f6', label: 'Confirmé' },
    arrived: { color: '#10b981', label: 'Arrivé' },
    completed: { color: '#6b7280', label: 'Terminé' }
  };

  const typeConf = typeConfig[appointment.type];
  const statusConf = statusConfig[appointment.status];

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '16px',
      flexWrap: 'wrap'
    }}>
      <div style={{ flex: 1, minWidth: '200px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <span style={{
            padding: '4px 12px',
            background: typeConf.color + '20',
            color: typeConf.color,
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 600
          }}>
            {typeConf.label}
          </span>
          <span style={{
            padding: '4px 12px',
            background: statusConf.color + '20',
            color: statusConf.color,
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 600
          }}>
            {statusConf.label}
          </span>
        </div>
        <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
          {appointment.carrier}
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Quai {appointment.dockId} - {appointment.scheduledAt} ({appointment.duration} min)
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Commande: {appointment.orderId}
        </div>
      </div>

      {appointment.status === 'confirmed' && (
        <button
          onClick={() => onArrival(appointment.id)}
          style={{
            padding: '10px 20px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            minHeight: '44px',
            whiteSpace: 'nowrap'
          }}
        >
          Confirmer arrivée
        </button>
      )}
    </div>
  );
}

function StatusBadge({ color, count, label }: { color: string; count: number; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: color
      }} />
      <span style={{ fontSize: '14px', fontWeight: 500 }}>
        {count} {label}
      </span>
    </div>
  );
}
