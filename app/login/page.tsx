'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Mail, Lock, LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card gradient className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo de volta</h1>
          <p className="text-vanthex-300">Faça login para acessar sua conta</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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

          <div>
            <label className="block text-vanthex-200 mb-2">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-vanthex-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 bg-vanthex-950/50 border border-vanthex-700 rounded-lg text-white placeholder-vanthex-500 focus:outline-none focus:border-vanthex-500 transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm flex items-center">
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
            <LogIn className="w-5 h-5 mr-2" />
            Entrar
          </Button>
        </form>

        <p className="text-center text-vanthex-300 mt-6">
          Não tem conta?{' '}
          <Link href="/signup" className="text-vanthex-400 hover:text-vanthex-300">
            Criar conta grátis
          </Link>
        </p>
      </Card>
    </div>
  )
}