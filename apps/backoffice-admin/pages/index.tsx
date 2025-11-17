export default function Home() {
  return (
    <main style={{ maxWidth: 960, margin: '0 auto' }}>
      <section style={{ padding: '32px 0' }}>
        <h2 style={{ fontSize: 28, marginBottom: 8 }}>RT Technologie</h2>
        <p style={{ fontSize: 18, opacity: 0.9 }}>
          Plateforme unifiée Transport • Logistique • Industrie — vigilance, planification, suivi, e‑CMR et Affret.IA.
          Testez notre démonstration en ligne et découvrez comment accélérer vos flux.
        </p>
        <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href="/login" style={{ background: '#0a66ff', color: '#fff', padding: '10px 14px', borderRadius: 8, textDecoration: 'none' }}>
            Se connecter à la démo
          </a>
          <a href="/health" style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', textDecoration: 'none' }}>
            État des services
          </a>
          <a
            href={process.env.NEXT_PUBLIC_SUPPORT_URL || 'https://www.rt-technologie.com'}
            target="_blank"
            rel="noreferrer"
            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #0a66ff', color: '#0a66ff', textDecoration: 'none' }}
          >
            Contacter le support
          </a>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
        <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
          <h3>Industrie</h3>
          <ul>
            <li>Vigilance (documents & blocages)</li>
            <li>Affectation + SLA + escalade Affret.IA</li>
            <li>Planification automatisée (RDV)</li>
            <li>Grilles transporteurs</li>
          </ul>
        </div>
        <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
          <h3>Transporteur</h3>
          <ul>
            <li>Acceptation mission (SLA)</li>
            <li>RDV 1‑clic & documents</li>
            <li>Premium : marketplace & Affret.IA</li>
          </ul>
        </div>
        <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
          <h3>Logisticien</h3>
          <ul>
            <li>Planning quais / borne accueil</li>
            <li>e‑CMR au quai (S3 + PDF/A)</li>
            <li>Webhooks WMS</li>
          </ul>
        </div>
        <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
          <h3>Transitaire</h3>
          <ul>
            <li>Tenders import/export</li>
            <li>Pré/post routier</li>
            <li>Suivi multimodal</li>
          </ul>
        </div>
      </section>

      <section style={{ marginTop: 24, borderTop: '1px solid #eee', paddingTop: 16 }}>
        <h3>Modules transverses</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ background: '#eef', padding: '6px 10px', borderRadius: 16 }}>Vigilance</span>
          <span style={{ background: '#eef', padding: '6px 10px', borderRadius: 16 }}>Tracking & ETA</span>
          <span style={{ background: '#eef', padding: '6px 10px', borderRadius: 16 }}>e‑CMR / BL</span>
          <span style={{ background: '#eef', padding: '6px 10px', borderRadius: 16 }}>Notifications</span>
          <span style={{ background: '#eef', padding: '6px 10px', borderRadius: 16 }}>Affret.IA</span>
          <span style={{ background: '#eef', padding: '6px 10px', borderRadius: 16 }}>Marketplace</span>
        </div>
        <p style={{ marginTop: 12, opacity: 0.85 }}>
          Prêt ? Cliquez sur « Se connecter à la démo » pour accéder à l’interface d’administration et tester l’activation des modules.
        </p>
      </section>
    </main>
  );
}
