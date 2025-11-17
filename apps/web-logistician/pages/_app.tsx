import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('logistician_jwt') : null;

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem('logistician_jwt');
    router.push('/login');
  };

  return (
    <>
      <Head>
        <title>RT Logistician</title>
        <meta name="description" content="Gestion d'entrepôt RT Technologie" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </Head>
      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: #f3f4f6;
          color: #1f2937;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          touch-action: manipulation;
        }
        button, input, select, textarea {
          font-family: inherit;
          font-size: 16px; /* Prevents zoom on iOS */
        }
      `}</style>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {router.pathname !== '/login' && token && (
          <>
            {!isOnline && (
              <div style={{
                background: '#f59e0b',
                color: 'white',
                padding: '8px 16px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 500
              }}>
                Mode hors-ligne - Les données seront synchronisées à la reconnexion
              </div>
            )}
            <header style={{
              background: '#2563eb',
              color: 'white',
              padding: '16px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>RT Logistician</h1>
              <nav style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                fontSize: '14px'
              }}>
                <NavButton href="/" active={router.pathname === '/'}>Dashboard</NavButton>
                <NavButton href="/docks" active={router.pathname.startsWith('/docks')}>Quais</NavButton>
                <NavButton href="/ecmr" active={router.pathname.startsWith('/ecmr')}>E-CMR</NavButton>
                <NavButton href="/receptions" active={router.pathname.startsWith('/receptions')}>Réceptions</NavButton>
                <NavButton href="/expeditions" active={router.pathname.startsWith('/expeditions')}>Expéditions</NavButton>
                <NavButton href="/anomalies" active={router.pathname.startsWith('/anomalies')}>Anomalies</NavButton>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer',
                    minHeight: '44px'
                  }}
                >
                  Déconnexion
                </button>
              </nav>
            </header>
          </>
        )}
        <main style={{ flex: 1, padding: router.pathname === '/login' ? '0' : '16px' }}>
          <Component {...pageProps} />
        </main>
      </div>
    </>
  );
}

function NavButton({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <a
      href={href}
      style={{
        padding: '8px 12px',
        background: active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
        border: active ? '2px solid white' : '1px solid rgba(255,255,255,0.3)',
        borderRadius: '6px',
        color: 'white',
        textDecoration: 'none',
        fontWeight: active ? 600 : 400,
        minHeight: '44px',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      {children}
    </a>
  );
}
