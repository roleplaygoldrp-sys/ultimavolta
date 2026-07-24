'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from './ui/Button'
import { useState, useEffect } from 'react'
import { LogOut, User } from 'lucide-react'

export function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-vanthex-950/80 backdrop-blur-md border-b border-vanthex-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-vanthex-400 to-vanthex-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Vanthex</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/#features"
              className="text-vanthex-200 hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#pricing"
              className="text-vanthex-200 hover:text-white transition-colors"
            >
              Preços
            </Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-vanthex-200 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Entrar</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Começar Grátis</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}