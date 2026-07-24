'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Sparkles, Zap, Target, Users } from 'lucide-react'

export function FunnelGenerator() {
  const [niche, setNiche] = useState('')
  const [productName, setProductName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [funnel, setFunnel] = useState<any>(null)

  const handleGenerate = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/generate-funnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, productName }),
      })

      if (!response.ok) throw new Error('Falha ao gerar funil')

      const result = await response.json()
      setFunnel(result)
    } catch (error) {
      console.error('Generate error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card gradient className="w-full">
      {!funnel ? (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <Sparkles className="w-12 h-12 text-vanthex-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white">Gerador de Funis</h2>
            <p className="text-vanthex-300 mt-2">
              Receba um funil completo e estratégias vencedoras em segundos
            </p>
          </div>

          <div>
            <label className="block text-vanthex-200 mb-2">Nicho de Mercado</label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Ex: Emagrecimento, Ganho de Massa, Renda Extra..."
              className="w-full px-4 py-3 bg-vanthex-950/50 border border-vanthex-700 rounded-lg text-white placeholder-vanthex-500 focus:outline-none focus:border-vanthex-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-vanthex-200 mb-2">Nome do Produto (Opcional)</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ex: Método Seca 30 Dias..."
              className="w-full px-4 py-3 bg-vanthex-950/50 border border-vanthex-700 rounded-lg text-white placeholder-vanthex-500 focus:outline-none focus:border-vanthex-500 transition-colors"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!niche || isLoading}
            isLoading={isLoading}
            className="w-full"
            size="lg"
          >
            <Zap className="w-5 h-5 mr-2" />
            Gerar Funil Inteligente
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Funil Gerado</h3>
            <Button variant="ghost" size="sm" onClick={() => setFunnel(null)}>
              Novo Funil
            </Button>
          </div>

          {/* Estrutura do Funil */}
          <div>
            <h4 className="text-lg font-semibold text-vanthex-300 mb-3 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Estrutura
            </h4>
            <div className="space-y-2">
              {funnel.structure.map((step: string, i: number) => (
                <div key={i} className="bg-vanthex-900/50 border border-vanthex-700/50 rounded-lg p-3 text-vanthex-200">
                  <span className="text-vanthex-400 font-bold mr-2">{i + 1}.</span>
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* Copies */}
          <div>
            <h4 className="text-lg font-semibold text-vanthex-300 mb-3">Headlines Sugeridas</h4>
            <div className="space-y-2">
              {funnel.copies.headlines.map((headline: string, i: number) => (
                <div key={i} className="bg-vanthex-900/50 border border-vanthex-700/50 rounded-lg p-3 text-vanthex-200 italic">
                  "{headline}"
                </div>
              ))}
            </div>
          </div>

          {/* Audiences */}
          <div>
            <h4 className="text-lg font-semibold text-vanthex-300 mb-3 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Audiences Recomendadas
            </h4>
            <div className="space-y-2">
              {funnel.audiences.map((audience: string, i: number) => (
                <div key={i} className="bg-vanthex-900/50 border border-vanthex-700/50 rounded-lg p-3 text-vanthex-200">
                  {audience}
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full" size="lg">
            Salvar Funil
          </Button>
        </div>
      )}
    </Card>
  )
}