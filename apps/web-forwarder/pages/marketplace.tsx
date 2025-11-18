import { useEffect, useState } from 'react';
import Card from '../components/Card';
import CarrierCard from '../components/CarrierCard';
import { loadCarriers, Carrier } from '../lib/api';

export default function Marketplace() {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [filters, setFilters] = useState({
    minScoring: 0,
    search: '',
    showBlocked: false
  });
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null);

  useEffect(() => {
    async function load() {
      const carriersData = await loadCarriers();
      setCarriers(carriersData);
    }
    load();
  }, []);

  const premiumCarriers = carriers.filter(c => c.premium);

  const filteredCarriers = premiumCarriers.filter(carrier => {
    if (carrier.scoring < filters.minScoring) return false;
    if (!filters.showBlocked && carrier.blocked) return false;
    if (filters.search && !carrier.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !carrier.email.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const scoringRanges = [
    { label: 'Tous', min: 0, color: '#9ca3af' },
    { label: 'Excellence (85+)', min: 85, color: '#10b981' },
    { label: 'Bon (70+)', min: 70, color: '#f59e0b' },
    { label: 'Acceptable (50+)', min: 50, color: '#ef4444' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
        Marketplace Premium
      </h1>
      <p style={{ color: '#666', marginBottom: 32 }}>
        Reseau de transporteurs premium avec scoring, certifications et disponibilite
      </p>

      {/* Statistiques */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Transporteurs premium</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#667eea' }}>{premiumCarriers.length}</div>
        </div>
        <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Actifs</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#10b981' }}>
            {premiumCarriers.filter(c => !c.blocked).length}
          </div>
        </div>
        <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Scoring moyen</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#1f2937' }}>
            {premiumCarriers.length > 0
              ? (premiumCarriers.reduce((sum, c) => sum + c.scoring, 0) / premiumCarriers.length).toFixed(0)
              : 'N/A'}
          </div>
        </div>
        <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Excellence (85+)</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#10b981' }}>
            {premiumCarriers.filter(c => c.scoring >= 85).length}
          </div>
        </div>
      </div>

      {/* Filtres */}
      <Card title="Filtres">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px 200px', gap: 16, alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              Rechercher
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Nom ou email du transporteur..."
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                fontSize: 14
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              Scoring minimum
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {scoringRanges.map(range => (
                <button
                  key={range.min}
                  onClick={() => setFilters({ ...filters, minScoring: range.min })}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: filters.minScoring === range.min ? `2px solid ${range.color}` : '1px solid #e5e7eb',
                    background: filters.minScoring === range.min ? range.color : '#fff',
                    color: filters.minScoring === range.min ? '#fff' : '#666',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {range.min > 0 ? `${range.min}+` : 'Tous'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={filters.showBlocked}
                onChange={(e) => setFilters({ ...filters, showBlocked: e.target.checked })}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 14, fontWeight: 600 }}>Afficher bloques</span>
            </label>
          </div>
        </div>

        <div style={{ marginTop: 16, padding: 12, background: '#f9fafb', borderRadius: 8, fontSize: 14, color: '#666' }}>
          <strong>{filteredCarriers.length}</strong> transporteur(s) trouve(s)
        </div>
      </Card>

      {/* Liste des transporteurs */}
      <Card title="Transporteurs disponibles">
        {filteredCarriers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
            Aucun transporteur ne correspond a vos criteres
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
            {filteredCarriers.map(carrier => (
              <CarrierCard
                key={carrier.id}
                carrier={carrier}
                onClick={() => setSelectedCarrier(carrier)}
                selected={selectedCarrier?.id === carrier.id}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Details du transporteur selectionne */}
      {selectedCarrier && (
        <Card
          title="Details du transporteur"
          action={
            <button
              onClick={() => setSelectedCarrier(null)}
              style={{
                background: 'transparent',
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              Fermer
            </button>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
                {selectedCarrier.name}
                {selectedCarrier.premium && (
                  <span style={{
                    marginLeft: 12,
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    color: '#fff',
                    fontSize: 12,
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontWeight: 700
                  }}>
                    PREMIUM
                  </span>
                )}
              </h3>

              <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Contact</div>
                  <div style={{ fontSize: 16 }}>{selectedCarrier.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>VAT</div>
                  <div style={{ fontSize: 16 }}>{selectedCarrier.vat}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Statut</div>
                  <div style={{
                    display: 'inline-block',
                    background: selectedCarrier.blocked ? '#fef3c7' : '#d1fae5',
                    color: selectedCarrier.blocked ? '#92400e' : '#065f46',
                    padding: '4px 12px',
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 600
                  }}>
                    {selectedCarrier.blocked ? 'Bloque' : 'Actif'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  disabled={selectedCarrier.blocked}
                  style={{
                    background: selectedCarrier.blocked ? '#9ca3af' : '#667eea',
                    color: '#fff',
                    padding: '12px 24px',
                    borderRadius: 8,
                    border: 'none',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: selectedCarrier.blocked ? 'not-allowed' : 'pointer'
                  }}
                >
                  Inviter a soumissionner
                </button>
                <button
                  style={{
                    background: '#fff',
                    color: '#667eea',
                    padding: '12px 24px',
                    borderRadius: 8,
                    border: '1px solid #667eea',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Voir l'historique
                </button>
              </div>
            </div>

            <div>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                padding: 24,
                borderRadius: 12,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Score de performance</div>
                <div style={{ fontSize: 56, fontWeight: 700, marginBottom: 4 }}>
                  {selectedCarrier.scoring}
                </div>
                <div style={{ fontSize: 12, opacity: 0.9 }}>/ 100</div>
              </div>

              <div style={{ marginTop: 16, padding: 16, background: '#f9fafb', borderRadius: 8 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Criteres d'evaluation</h4>
                <div style={{ display: 'grid', gap: 8, fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Ponctualite</span>
                    <span style={{ fontWeight: 600 }}>
                      {selectedCarrier.scoring >= 85 ? 'Excellent' : selectedCarrier.scoring >= 70 ? 'Bon' : 'Moyen'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Qualite de service</span>
                    <span style={{ fontWeight: 600 }}>
                      {selectedCarrier.scoring >= 85 ? 'Excellent' : selectedCarrier.scoring >= 70 ? 'Bon' : 'Moyen'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Competitivite prix</span>
                    <span style={{ fontWeight: 600 }}>
                      {selectedCarrier.scoring >= 85 ? 'Excellent' : selectedCarrier.scoring >= 70 ? 'Bon' : 'Moyen'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
