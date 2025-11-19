import type { AppProps } from 'next/app';
import Layout from '../components/Layout';
import { ChatProvider, ChatWidget } from '@rt/chatbot-widget';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const userId = typeof window !== 'undefined' ? window.localStorage.getItem('user_id') : null;
  const userName = typeof window !== 'undefined' ? window.localStorage.getItem('user_name') : null;

  return (
    <ChatProvider
      botType="helpbot"
      userId={userId || undefined}
      userName={userName || undefined}
      role="admin"
    >
      <Layout children={<Component {...pageProps} />} />
      <ChatWidget
        botType="helpbot"
        userId={userId || undefined}
        userName={userName || undefined}
        role="admin"
      />
    </ChatProvider>
  );
}
