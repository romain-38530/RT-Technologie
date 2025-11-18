import type { AppProps } from 'next/app';
import Layout from '../components/Layout';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
import { ChatProvider, ChatWidget } from '@rt/chatbot-widget';

export default function App({ Component, pageProps }: AppProps) {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('admin_jwt') : null;
  const userId = typeof window !== 'undefined' ? window.localStorage.getItem('user_id') : null;
  const userName = typeof window !== 'undefined' ? window.localStorage.getItem('user_name') : null;
  const supportUrl = process.env.NEXT_PUBLIC_SUPPORT_URL || 'https://www.rt-technologie.com';

  return (
    <ChatProvider
      botType="helpbot"
      userId={userId || undefined}
      userName={userName || undefined}
      role="admin"
    >
      <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}>
      <header style={{ marginBottom: 16 }}>
        <h1>RT Backoffice Admin</h1>
        <nav style={{ display: 'flex', gap: 12 }}>
          <a href="/orgs">Organisations</a>
          <a href="/pricing">Tarifs</a>
          <a href="/palettes">Palettes</a>
          <a href="/health">Etat</a>
          {!token ? <a href="/login">Se connecter</a> : <a href="#" onClick={(e)=>{e.preventDefault(); localStorage.removeItem('admin_jwt'); location.href='/';}}>Se déconnecter</a>}
          <a href={supportUrl} target="_blank" rel="noreferrer">Support</a>
        </nav>
      </header>
      <Component {...pageProps} />
    </div>
    <ChatWidget
      botType="helpbot"
      userId={userId || undefined}
      userName={userName || undefined}
      role="admin"
    />
    </ChatProvider>
  );
}
