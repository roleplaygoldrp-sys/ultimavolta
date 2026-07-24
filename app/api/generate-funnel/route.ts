import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { getServerSupabase } from '@/lib/supabase'
import { extractJSON } from '@/lib/utils'

interface FunnelResponse {
  niche: string
  productName?: string
  structure: string[]
  copies: {
    headlines: string[]
    bullets: string[]
    guarantee: string
    cta: string
  }
  audiences: string[]
}

export async function POST(request: NextRequest) {
  try {
    const { niche, productName } = await request.json()

    // Get current user
    const supabase = getServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      request.headers.get('authorization')?.replace('Bearer ', '')
    )

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate funnel with OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é Vanthex, uma IA especialista em funis de venda para Facebook Ads.
Gere um funil completo e estratégico para o nicho especificado.

Retorne UM JSON com:
- niche: string
- productName: string (opcional)
- structure: array de 4-6 etapas do funil (ex: ["Anúncio de conscientização", "Página de captura", ...])
- copies: objeto com headlines (array de 3), bullets (array de 5), guarantee (string), cta (string)
- audiences: array de 5-8 audiences detalhadas para Facebook Ads

Foco em conversão e escalabilidade. Responda APENAS o JSON.`,
        },
        {
          role: 'user',
          content: `Gere um funil completo para o nicho "${niche}"${productName ? ` com produto "${productName}"` : ''}.`,
        },
      ],
      response_format: { type: 'json_object' },
    })

    const funnel = extractJSON<FunnelResponse>(completion.choices[0].message.content)

    if (!funnel) {
      throw new Error('Falha ao gerar funil')
    }

    // Save to database
    await supabase.from('funnels').insert({
      user_id: user.id,
      niche,
      product_name: productName || null,
      structure: funnel.structure,
      copies: funnel.copies,
      audiences: funnel.audiences,
    })

    return NextResponse.json(funnel)
  } catch (error) {
    console.error('Funnel generation error:', error)
    return NextResponse.json(
      { error: 'Erro interno ao gerar funil' },
      { status: 500 }
    )
  }
}