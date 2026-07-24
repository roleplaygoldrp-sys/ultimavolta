import { Check } from 'lucide-react'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { cn } from '@/lib/utils'

interface PricingCardProps {
  plan: 'free' | 'pro' | 'agency'
  price: number
  features: string[]
  highlighted?: boolean
}

export function PricingCard({ plan, price, features, highlighted = false }: PricingCardProps) {
  const planNames = {
    free: 'Grátis',
    pro: 'Pro',
    agency: 'Agency',
  }

  const planColors = {
    free: 'from-vanthex-700 to-vanthex-800',
    pro: 'from-vanthex-500 to-vanthex-600',
    agency: 'from-vanthex-400 to-vanthex-500',
  }

  return (
    <Card
      gradient={highlighted}
      className={cn(
        'relative',
        highlighted && 'border-vanthex-400 shadow-xl shadow-vanthex-500/20'
      )}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-vanthex-400 to-vanthex-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          MAIS POPULAR
        </div>
      )}

      <div className="text-center mb-6">
        <div className={`inline-block bg-gradient-to-r ${planColors[plan]} text-white font-bold px-4 py-1 rounded-full text-sm mb-3`}>
          {planNames[plan]}
        </div>
        <div className="text-4xl font-bold text-white">
          R$ {price}
          <span className="text-lg text-vanthex-300 font-normal">/mês</span>
        </div>
      </div>

      <ul className="space-y-3 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="text-vanthex-200 flex items-start">
            <Check className="w-5 h-5 text-vanthex-400 mr-2 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      <Button
        variant={highlighted ? 'primary' : 'outline'}
        className="w-full"
        size="lg"
      >
        {plan === 'free' ? 'Começar Grátis' : 'Assinar Agora'}
      </Button>
    </Card>
  )
}