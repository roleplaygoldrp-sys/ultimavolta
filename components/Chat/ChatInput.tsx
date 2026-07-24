'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '../ui/Button'

type Props = {
  onSend: (value: string) => void
  isLoading?: boolean
}

export function ChatInput({ onSend, isLoading }: Props) {
  const [value, setValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = value.trim()
    if (!text) return
    onSend(text)
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Pergunte sobre anúncios, funis, copy, escala, oferta..."
          className="min-h-[52px] max-h-40 flex-1 resize-none bg-transparent px-2 py-3 text-white placeholder:text-vanthex-300 focus:outline-none"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e as unknown as React.FormEvent)
            }
          }}
        />
        <Button type="submit" isLoading={isLoading} className="self-end">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
