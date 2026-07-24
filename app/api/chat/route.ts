import { NextRequest, NextResponse } from 'next/server'
import { Groq } from 'groq-sdk'

export const dynamic = 'force-dynamic'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const systemPrompt = `
Você é a Vanthex, uma IA especialista em mercado digital.

Você ajuda com:
- Facebook Ads
- Google Ads
- Criativos
- Copywriting
- Funis
- Oferta
- Escala
- Diagnóstico de performance

Regras:
- Responda de forma objetiva, estratégica e profissional.
- Dê respostas práticas, sem enrolação.
- Se o usuário pedir análise, avalie pontos fortes, falhas e melhorias.
- Se pedir funil, entregue estrutura simples e aplicável.
- Se faltar contexto, faça uma pergunta curta.
- Não seja genérico. Fale como um especialista de tráfego e growth.
`

export async function POST(req: NextRequest) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: 'API key missing' },
      { status: 500 }
    )
  }

  try {
    const { messages } = await req.json()

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
    })

    const assistantMessage = completion.choices[0]?.message?.content || ''

    return NextResponse.json({ content: assistantMessage })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    )
  }
}
