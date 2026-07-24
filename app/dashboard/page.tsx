'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { ChatInput } from '@/components/chat/ChatInput'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Plus, MessageSquare, LogOut } from 'lucide-react'

type ChatMsg = {
  role: 'user' | 'assistant'
  content: string
}

type Thread = {
  id: string
  title: string
  messages: ChatMsg[]
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [threads, setThreads] = useState<Thread[]>([])
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId) ?? threads[0] ?? null,
    [threads, activeThreadId]
  )

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeThread?.messages])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const createThread = () => {
    const thread: Thread = {
      id: crypto.randomUUID(),
      title: 'Nova conversa',
      messages: [
        {
          role: 'assistant',
          content:
            'Olá. Sou a Vanthex. Posso analisar anúncios, criar estratégias, sugerir funis e otimizar sua operação de tráfego. O que você quer resolver hoje?',
        },
      ],
    }

    setThreads((prev) => [thread, ...prev])
    setActiveThreadId(thread.id)
  }

  const updateThreadMessages = (threadId: string, messages: ChatMsg[]) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, messages } : t))
    )
  }

  const handleSend = async (text: string) => {
    if (!activeThread) return

    const nextMessages: ChatMsg[] = [...activeThread.messages, { role: 'user', content: text }]
    updateThreadMessages(activeThread.id, nextMessages)
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!res.ok || !res.body) {
        throw new Error('Falha ao gerar resposta')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''

      const newMessages: ChatMsg[] = [...nextMessages, { role: 'assistant', content: '' }]
      updateThreadMessages(activeThread.id, newMessages)

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        assistantText += decoder.decode(value, { stream: true })
        updateThreadMessages(activeThread.id, [
          ...nextMessages,
          { role: 'assistant', content: assistantText },
        ])
      }
    } catch (error) {
      updateThreadMessages(activeThread.id, [
        ...nextMessages,
        {
          role: 'assistant',
          content: 'Tive um erro ao responder. Tente novamente em instantes.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
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
            Faça login para conversar com a sua IA de mercado digital.
          </p>
          <Button onClick={() => (window.location.href = '/')}>Voltar</Button>
        </Card>
      </div>
    )
  }

  if (!activeThread) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card gradient className="max-w-xl w-full text-center space-y-6">
          <h1 className="text-3xl font-bold text-white">Vanthex</h1>
          <p className="text-vanthex-300">
            Uma IA para anúncios, funis, copy e escala.
          </p>
          <Button onClick={createThread} className="mx-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nova conversa
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-[#0c081f] text-white">
      <aside className="hidden md:flex w-80 flex-col border-r border-white/10 bg-[#120a2a] p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Vanthex</h2>
            <p className="text-xs text-vanthex-300">IA para mercado digital</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        <Button onClick={createThread} className="mb-4 w-full">
          <Plus className="h-4 w-4 mr-2" />
          Nova conversa
        </Button>

        <div className="space-y-2 overflow-y-auto">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setActiveThreadId(thread.id)}
              className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                thread.id === activeThreadId
                  ? 'border-vanthex-500 bg-vanthex-600/20'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-vanthex-300" />
                <span className="text-sm font-medium">{thread.title}</span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="border-b border-white/10 bg-[#120a2a]/70 px-4 py-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">Vanthex Chat</h1>
              <p className="text-sm text-vanthex-300">
                Pergunte qualquer coisa sobre performance digital
              </p>
            </div>
            <div className="text-xs text-vanthex-300">{user.email}</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto flex max-w-4xl flex-col gap-4">
            {activeThread.messages.map((message, idx) => (
              <ChatMessage key={idx} role={message.role} content={message.content} />
            ))}
            <div ref={endRef} />
          </div>
        </div>

        <div className="border-t border-white/10 bg-[#120a2a]/70 px-4 py-4 backdrop-blur-md">
          <div className="mx-auto max-w-4xl">
            <ChatInput onSend={handleSend} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  )
}
