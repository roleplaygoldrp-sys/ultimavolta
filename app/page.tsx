import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-4xl mx-auto">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-vanthex-400 to-vanthex-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-vanthex-500/50">
            <span className="text-white font-bold text-3xl">V</span>
          </div>
        </div>

        {/* Headline Impactante */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Pare de queimar dinheiro<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-vanthex-400 to-vanthex-600">
            em ads que não convertem
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl text-vanthex-200 mb-10 max-w-2xl mx-auto">
          A Vanthex analisa seus criativos e entrega funis vencedores em segundos.
        </p>

        {/* CTA Button */}
        <Link href="/dashboard">
          <Button size="lg" className="animate-glow">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Analisar Meu Ad Agora
          </Button>
        </Link>

        /* Trust Signal */
        <p className="text-vanthex-400 text-sm mt-8">
          Comece grátis • Sem cartão necessário • Resultados em segundos
        </p>
      </div>
    </div>
  )
}