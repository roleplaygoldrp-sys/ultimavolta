'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AdUploader } from '@/components/AdUploader'
import { AnalysisResult } from '@/components/AnalysisResult'
import { FunnelGenerator } from '@/components/FunnelGenerator'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AlertCircle, LogOut, Mail, UserPlus } from 'lucide-react'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [isLoadingUser, setIsLoadingUser] = useState(false)

  useEffect(() => {
    checkUser()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user)
        createOrUpdateUser(session.user)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setAnalysis(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkUser() {
    setIsLoadingUser(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      setUser(session.user)
      await createOrUpdateUser(session.user)
    }
    setIsLoadingUser(false)
  }

  async function createOrUpdateUser(user: any) {
    try {
      await supabase.from('users').upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || null,
      }, {
        onConflict: 'id'
      })
    } catch (err) {
      console.error('Error creating user:', err)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })
      if (error) throw error
      
      setError('Email de login enviado! Verifique sua caixa de entrada.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar email')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setAnalysis(null)
  }

  const handleAnalysisComplete = (result: any) => {
    setAnalysis(result)
    setError(null)
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  // Loading state
  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-vanthex-400">Carregando...</div>
      </div>
    )
  }

  // Usuário não logado: mostra form de login
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <Card gradient className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-vanthex-400 to-vanthex-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">V</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Acesse com Magic Link
            </h1>
            <p className="text-vanthex-300">
              Sem senha. Só digite seu email e receba um link mágico.
            </p>
          </div>

          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <label className="block text-vanthex-200 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-vanthex-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-vanthex-950/50 border border-vanthex-700 rounded-lg text-white placeholder-vanthex-500 focus:outline-none focus:border-vanthex-500 transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className={`text-sm flex items-center ${error.includes('enviado') ? 'text-green-400' : 'text-red-400'}`}>
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              size="lg"
            >
              <Mail className="w-5 h-5 mr-2" />
              {isLoading ? 'Enviando...' : 'Receber Magic Link'}
            </Button>
          </form>

          <p className="text-center text-vanthex-500 text-xs mt-6">
            Ao continuar, você concorda com nossos termos de uso
          </p>
        </Card>
      </div>
    )
  }

  // Usuário logado: mostra dashboard completo
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-vanthex-400 to-vanthex-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-vanthex-300 text-sm">{user.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload & Analysis */}
          <div className="space-y-6">
            <AdUploader
              onAnalysisComplete={handleAnalysisComplete}
              onError={handleError}
            />
            
            {error && !error.includes('enviado') && (
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

          {/* Funnel Generator */}
          <div>
            <FunnelGenerator />
          </div>
        </div>
      </div>
    </div>
  )
}
