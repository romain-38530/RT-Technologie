'use client'

// TEMPORAIRE: Désactivé pour déploiement Vercel (dépendance workspace non disponible)
// import { ChatProvider, ChatWidget } from '@rt/chatbot-widget'

export function Providers({ children }: { children: React.ReactNode }) {
  // TODO: Recuperer les infos utilisateur depuis la session/auth
  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null
  const userName = typeof window !== 'undefined' ? localStorage.getItem('user_name') : null

  return (
    <>
      {/* TEMPORAIRE: Chatbot désactivé pour déploiement Vercel */}
      {/* <ChatProvider
        botType="routier"
        userId={userId || undefined}
        userName={userName || undefined}
        role="transporteur"
      > */}
        {children}
        {/* <ChatWidget
          botType="routier"
          userId={userId || undefined}
          userName={userName || undefined}
          role="transporteur"
        /> */}
      {/* </ChatProvider> */}
    </>
  )
}
