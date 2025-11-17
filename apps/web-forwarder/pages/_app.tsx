import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('forwarder_jwt') : null;

  const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Cotations', href: '/quotes' },
    { label: 'Appels d\'offres', href: '/tenders' },
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Analytics', href: '/analytics' },
  ];

  const isActive = (href: string) => router.pathname === href;

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh', background: '#f5f7fa' }}>
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        padding: '16px 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 24, margin: 0, fontWeight: 700 }}>
              RT Forwarder <span style={{ fontSize: 14, opacity: 0.9, fontWeight: 400 }}>| Affret.IA</span>
            </h1>
          </div>
          <nav style={{ display: 'flex', gap: 8 }}>
            {navItems.map(item => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  textDecoration: 'none',
                  color: '#fff',
                  background: isActive(item.href) ? 'rgba(255,255,255,0.2)' : 'transparent',
                  fontWeight: isActive(item.href) ? 600 : 400,
                  transition: 'all 0.2s'
                }}
              >
                {item.label}
              </a>
            ))}
            {!token ? (
              <a href="/login" style={{ padding: '8px 16px', borderRadius: 6, textDecoration: 'none', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
                Se connecter
              </a>
            ) : (
              <button
                onClick={() => { localStorage.removeItem('forwarder_jwt'); location.href='/'; }}
                style={{ padding: '8px 16px', borderRadius: 6, background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', cursor: 'pointer' }}
              >
                Déconnexion
              </button>
            )}
          </nav>
        </div>
      </header>
      <main style={{ maxWidth: 1400, margin: '24px auto', padding: '0 24px' }}>
        <Component {...pageProps} />
      </main>
      <footer style={{ textAlign: 'center', padding: 24, color: '#666', fontSize: 14 }}>
        RT Technologie - Plateforme Affret.IA
      </footer>
    </div>
  );
}
