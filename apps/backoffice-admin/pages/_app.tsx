import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('admin_jwt') : null;
  const supportUrl = process.env.NEXT_PUBLIC_SUPPORT_URL || 'https://www.rt-technologie.com';
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}>
      <header style={{ marginBottom: 16 }}>
        <h1>RT Backoffice Admin</h1>
        <nav style={{ display: 'flex', gap: 12 }}>
          <a href="/orgs">Organisations</a>
          <a href="/pricing">Tarifs</a>
          <a href="/health">Etat</a>
          {!token ? <a href="/login">Se connecter</a> : <a href="#" onClick={(e)=>{e.preventDefault(); localStorage.removeItem('admin_jwt'); location.href='/';}}>Se déconnecter</a>}
          <a href={supportUrl} target="_blank" rel="noreferrer">Support</a>
        </nav>
      </header>
      <Component {...pageProps} />
    </div>
  );
}
