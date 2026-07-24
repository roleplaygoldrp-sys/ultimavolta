import { NextRequest } from 'next/server'
import { openai } from '@/lib/openai'
import { systemPrompt } from '@/lib/chat'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!Array.isArray(messages)) {
      return new Response('Invalid messages payload', { status: 400 })
    }

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
        try {
          for await (const chunk of completion) {
            const token = chunk.choices[0]?.delta?.content || ''
            if (token) controller.enqueue(encoder.encode(token))
          }
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `\n\nErro ao gerar resposta: ${
                error instanceof Error ? error.message : 'desconhecido'
              }`
            )
          )
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Erro interno',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}