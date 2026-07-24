'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Plus, MessageSquare, LogOut, Send } from 'lucide-react'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!res.ok || !res.body) throw new Error('Erro ao gerar resposta')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        assistantText += decoder.decode(value, { stream: true })
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: assistantText },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Tive um erro ao responder. Tente novamente.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card gradient className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Acesse a Vanthex</h1>
          <p className="text-vanthex-300">
            Faça login para conversar com a sua IA de mercado digital.
          </p>
          <Button onClick={() => (window.location.href = '/')}>Voltar</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-[#0c081f] text-white">
      <aside
        className={`${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-white/10 bg-[#120a2a]`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">Vanthex</h2>
              <p className="text-xs text-vanthex-300">IA para mercado digital</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={() => setMessages([])} className="mb-4 w-full">
            <Plus className="h-4 w-4 mr-2" />
            Nova conversa
          </Button>

          <div className="space-y-2">
            <button className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-left transition hover:bg-white/10">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-vanthex-300" />
                <span className="text-sm font-medium">Nova conversa</span>
              </div>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="border-b border-white/10 bg-[#120a2a]/70 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!isSidebarOpen)}>
              <MessageSquare className="h-5 w-5" />
            </Button>
            <div className="text-xs text-vanthex-300">{user.email}</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto max-w-4xl flex flex-col gap-4">
            {messages.length === 0 && (
              <div className="text-center py-16">
                <h1 className="text-3xl font-bold mb-4">Como posso ajudar hoje?</h1>
                <p className="text-vanthex-300">
                  Pergunte sobre anúncios, funis, copy, estratégia ou escala.
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm md:text-base leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-vanthex-600 text-white shadow-lg shadow-vanthex-500/20'
                      : 'bg-white/5 text-vanthex-100 border border-white/10'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-vanthex-300">
                  Gerando resposta...
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>
        </div>

        <div className="border-t border-white/10 bg-[#120a2a]/70 px-4 py-4 backdrop-blur-md">
          <div className="mx-auto max-w-4xl">
            <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte qualquer coisa sobre performance digital..."
                className="min-h-[52px] max-h-40 flex-1 resize-none bg-transparent px-2 py-3 text-white placeholder:text-vanthex-300 focus:outline-none"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
              />
              <Button onClick={handleSend} isLoading={isLoading} className="self-end">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
