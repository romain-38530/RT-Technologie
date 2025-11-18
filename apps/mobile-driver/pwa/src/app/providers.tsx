'use client'

import { ChatProvider, ChatWidget } from '@rt/chatbot-widget'

export function Providers({ children }: { children: React.ReactNode }) {
  // TODO: Recuperer les infos utilisateur depuis la session/auth
  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null
  const userName = typeof window !== 'undefined' ? localStorage.getItem('user_name') : null

  return (
    <ChatProvider
      botType="copilote-chauffeur"
      userId={userId || undefined}
      userName={userName || undefined}
      role="conducteur"
    >
      {children}
      <ChatWidget
        botType="copilote-chauffeur"
        userId={userId || undefined}
        userName={userName || undefined}
        role="conducteur"
      />
    </ChatProvider>
  )
}
