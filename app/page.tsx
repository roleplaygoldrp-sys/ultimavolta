'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { ChatMessage } from '../../components/chat/ChatMessage'
import { ChatInput } from '../../components/chat/ChatInput'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Plus, MessageSquare, LogOut } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-vanthex-400 to-vanthex-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-vanthex-500/30">
            <span className="text-white font-bold text-3xl">V</span>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
          Sua inteligência para<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-vanthex-300 to-vanthex-500">
            escalar anúncios
          </span>
        </h1>

        <p className="text-lg md:text-xl text-vanthex-200 mb-10 max-w-2xl mx-auto leading-relaxed">
          A Vanthex analisa criativos, identifica oportunidades e sugere próximos passos com precisão.
        </p>

        <Link href="/dashboard">
          <Button size="lg" className="px-8 py-4 text-base shadow-xl shadow-vanthex-500/30">
            Utilizar ferramenta agora
          </Button>
        </Link>

        <p className="text-vanthex-400 text-sm mt-8">
          Acesso rápido • Sem fricção • Resultado em segundos
        </p>
      </div>
    </div>
  )
}
