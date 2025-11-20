import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
// TEMPORAIRE: Désactivé pour déploiement Vercel (dépendance workspace non disponible)
// import { TrainingButton } from '@rt/design-system';

interface Stats {
  docksOccupied: number;
  docksTotal: number;
  pendingReceptions: number;
  pendingExpeditions: number;
  activeAnomalies: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    docksOccupied: 0,
    docksTotal: 0,
    pendingReceptions: 0,
    pendingExpeditions: 0,
    activeAnomalies: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('logistician_jwt');
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch dashboard stats
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      // Mock data - Replace with actual API calls
      setStats({
        docksOccupied: 3,
        docksTotal: 8,
        pendingReceptions: 5,
        pendingExpeditions: 7,
        activeAnomalies: 2
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Chargement...</div>;
  }

  return (
    <div>
      {/* <TrainingButton toolName="Logisticien" /> */}
      <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>Dashboard</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <StatCard
          title="Quais"
          value={`${stats.docksOccupied}/${stats.docksTotal}`}
          label="occupés"
          color="#3b82f6"
          onClick={() => router.push('/docks')}
        /> */
        <StatCard
          title="Réceptions"
          value={stats.pendingReceptions}
          label="en attente"
          color="#8b5cf6"
          onClick={() => router.push('/receptions')}
        /> */
        <StatCard
          title="Expéditions"
          value={stats.pendingExpeditions}
          label="à préparer"
          color="#10b981"
          onClick={() => router.push('/expeditions')}
        /> */
        <StatCard
          title="Anomalies"
          value={stats.activeAnomalies}
          label="actives"
          color="#ef4444"
          onClick={() => router.push('/anomalies')}
        /> */
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        <ActionCard
          title="Palettes"
          description="Réception des chèques palettes et gestion des sites"
          icon="📦"
          onClick={() => router.push('/palettes')}
        /> */
        <ActionCard
          title="E-CMR"
          description="Générer et signer des CMR électroniques"
          icon="📋"
          onClick={() => router.push('/ecmr')}
        /> */
        <ActionCard
          title="Scanner"
          description="Scanner un code-barres pour traiter une commande"
          icon="📷"
          onClick={() => router.push('/scanner')}
        /> */
      </div>
    </div>
  );
}

function StatCard({ title, value, label, color, onClick }: {
  title: string;
  value: number | string;
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        borderLeft: `4px solid ${color}`,
        transition: 'transform 0.2s',
        minHeight: '140px'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <h3 style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontWeight: 500 }}>{title}</h3>
      <div style={{ fontSize: '36px', fontWeight: 700, color, marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '14px', color: '#6b7280' }}>{label}</div>
    </div>
  );
}

function ActionCard({ title, description, icon, onClick }: {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        minHeight: '140px'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ fontSize: '48px', marginBottom: '12px' }}>{icon}</div>
      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{title}</h3>
      <p style={{ fontSize: '14px', color: '#6b7280' }}>{description}</p>
    </div>
  );
}
