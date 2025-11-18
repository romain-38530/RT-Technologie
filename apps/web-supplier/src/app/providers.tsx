'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { ChatProvider, ChatWidget } from '@rt/chatbot-widget'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  // TODO: Recuperer les infos utilisateur depuis la session/auth
  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null
  const userName = typeof window !== 'undefined' ? localStorage.getItem('user_name') : null

  return (
    <QueryClientProvider client={queryClient}>
      <ChatProvider
        botType="expedition"
        userId={userId || undefined}
        userName={userName || undefined}
        role="fournisseur"
      >
        {children}
        <Toaster />
        <ChatWidget
          botType="expedition"
          userId={userId || undefined}
          userName={userName || undefined}
          role="fournisseur"
        />
      </ChatProvider>
    </QueryClientProvider>
  )
}
