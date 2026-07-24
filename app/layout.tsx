import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vanthex - IA Profissional para Facebook Ads',
  description: 'Analise imagens de ads e receba estratégias vencedoras automaticamente. Economize tempo e escale seus resultados.',
  keywords: ['facebook ads', 'ia', 'marketing digital', 'análise de ads', 'funis'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} bg-hero-gradient min-h-screen`}>
        <Navbar />
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  )
}
