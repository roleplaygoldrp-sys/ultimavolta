import { cn } from '@/lib/utils'

type MessageProps = {
  role: 'user' | 'assistant'
  content: string
}

export function ChatMessage({ role, content }: MessageProps) {
  const isUser = role === 'user'

  return (
    <div className={cn('w-full flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm md:text-base leading-relaxed whitespace-pre-wrap',
          isUser
            ? 'bg-vanthex-600 text-white shadow-lg shadow-vanthex-500/20'
            : 'bg-white/5 text-vanthex-100 border border-white/10'
        )}
      >
        {content}
      </div>
    </div>
  )
}