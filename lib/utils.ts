import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value)
}

export function extractScore(text: string): number {
  const match = text.match(/score[:\s]+(\d+)/i) || text.match(/(\d+)\/100/i)
  return match ? parseInt(match[1]) : 50
}

export function extractJSON<T>(text: string): T | null {
  try {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      return JSON.parse(match[0]) as T
    }
  } catch (e) {
    console.error('Failed to parse JSON:', e)
  }
  return null
}