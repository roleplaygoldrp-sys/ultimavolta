'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AdUploader } from '@/components/AdUploader'
import { AnalysisResult } from '@/components/AnalysisResult'
import { FunnelGenerator } from '@/components/FunnelGenerator'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AlertCircle, LogOut } from 'lucide-react'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsLoadingUser(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleAnalysisComplete = (result: any) => {
    setAnalysis(result)
    setError(null)
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center text-vanthex-300">
        Carregando...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card gradient className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Acesse a Vanthex</h1>
          <p className="text-vanthex-300">
            Faça login para analisar seus anúncios.
          </p>
          <Button onClick={() => (window.location.href = '/')}>Voltar</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-vanthex-300 text-sm">{user.email}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <AdUploader
              onAnalysisComplete={handleAnalysisComplete}
              onError={handleError}
            />

            {error && (
              <Card className="border-red-500/50 bg-red-500/10">
                <div className="flex items-center text-red-400">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {error}
                </div>
              </Card>
            )}

            {analysis && (
              <AnalysisResult
                score={analysis.score}
                suggestions={analysis.suggestions}
                strengths={analysis.strengths}
                weaknesses={analysis.weaknesses}
                improvements={analysis.improvements}
              />
            )}
          </div>

          <div>
            <FunnelGenerator />
          </div>
        </div>
      </div>
    </div>
  )
}
