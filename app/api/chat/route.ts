import { NextRequest } from 'next/server'
import OpenAI from 'openai'

export const runtime = 'edge'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
  try {
    const { messages } = await req.json()

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      stream: true,
    })

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of completion) {
          const token = chunk.choices[0]?.delta?.content || ''
          if (token) controller.enqueue(encoder.encode(token))
        }
        controller.close()
      },
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro interno' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}