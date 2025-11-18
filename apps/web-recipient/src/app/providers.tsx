'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { ChatProvider, ChatWidget } from '@rt/chatbot-widget'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }))

  // TODO: Recuperer les infos utilisateur depuis la session/auth
  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null
  const userName = typeof window !== 'undefined' ? localStorage.getItem('user_name') : null

  return (
    <QueryClientProvider client={queryClient}>
      <ChatProvider
        botType="livraisons"
        userId={userId || undefined}
        userName={userName || undefined}
        role="destinataire"
      >
        {children}
        <ChatWidget
          botType="livraisons"
          userId={userId || undefined}
          userName={userName || undefined}
          role="destinataire"
        />
      </ChatProvider>
    </QueryClientProvider>
  )
}
