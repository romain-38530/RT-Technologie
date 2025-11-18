export default function Home() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <h1 style={{ fontSize: 48, marginBottom: 16, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Bienvenue sur RT Forwarder
      </h1>
      <p style={{ fontSize: 20, color: '#666', marginBottom: 32, maxWidth: 600, margin: '0 auto 32px' }}>
        Plateforme d'affretement intelligente avec cotations IA, appels d'offres automatises et marketplace premium
      </p>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href="/dashboard" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          padding: '14px 28px',
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 16,
          boxShadow: '0 4px 12px rgba(102,126,234,0.3)'
        }}>
          Acceder au Dashboard
        </a>
        <a href="/quotes" style={{
          border: '2px solid #667eea',
          color: '#667eea',
          padding: '14px 28px',
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 16
        }}>
          Demander une cotation
        </a>
      </div>

      <section style={{ marginTop: 80, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
        <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🤖</div>
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>Cotations IA</h3>
          <p style={{ color: '#666', fontSize: 14 }}>
            Obtenez des prix instantanes generes par l'IA avec suggestions de transporteurs premium
          </p>
        </div>
        <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>Appels d'offres</h3>
          <p style={{ color: '#666', fontSize: 14 }}>
            Lancez des tenders et recevez des offres competitives de transporteurs qualifies
          </p>
        </div>
        <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🏪</div>
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>Marketplace Premium</h3>
          <p style={{ color: '#666', fontSize: 14 }}>
            Acces a un reseau de transporteurs premiums avec scoring et certifications
          </p>
        </div>
        <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>Analytics</h3>
          <p style={{ color: '#666', fontSize: 14 }}>
            Analysez vos economies, comparez IA vs manuel et suivez vos performances
          </p>
        </div>
      </section>
    </div>
  );
}
