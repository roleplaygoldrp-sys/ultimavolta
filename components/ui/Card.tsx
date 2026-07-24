import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  gradient?: boolean
}

export function Card({ children, className, hover = false, gradient = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl p-6',
        gradient
          ? 'bg-gradient-to-br from-vanthex-900/50 to-vanthex-950/50 border border-vanthex-700/50 backdrop-blur-sm'
          : 'bg-vanthex-950/30 border border-vanthex-800/50',
        hover && 'hover:border-vanthex-500/50 hover:shadow-lg hover:shadow-vanthex-500/10 transition-all duration-300',
        className
      )}
    >
      {children}
    </div>
  )
}