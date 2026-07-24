'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Mail, Lock, User, UserPlus } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error

      // Create user profile in database
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('users').insert({
          id: user.id,
          email: user.email,
          full_name: fullName,
        })
      }

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card gradient className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Crie sua conta</h1>
          <p className="text-vanthex-300">Comece a analisar seus ads grátis</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-vanthex-200 mb-2">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-vanthex-500" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome"
                required
                className="w-full pl-10 pr-4 py-3 bg-vanthex-950/50 border border-vanthex-700 rounded-lg text-white placeholder-vanthex-500 focus:outline-none focus:border-vanthex-500 transition-colors"
              />
            </div>
          </div>

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
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
                className="w-full pl-10 pr-4 py-3 bg-vanthex-950/50 border border-vanthex-700 rounded-lg text-white placeholder-vanthex-500 focus:outline-none focus:border-vanthex-500 transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full"
            size="lg"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Criar Conta Grátis
          </Button>
        </form>

        <p className="text-center text-vanthex-300 mt-6">
          Já tem conta?{' '}
          <Link href="/login" className="text-vanthex-400 hover:text-vanthex-300">
            Fazer login
          </Link>
        </p>
      </Card>
    </div>
  )
}