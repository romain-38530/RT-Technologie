import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RT Industry - Gestion des commandes',
  description: 'Plateforme de gestion des commandes pour industriels',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <div className="flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]">
              <Sidebar />
              <main className="flex w-full flex-1 flex-col overflow-hidden">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
