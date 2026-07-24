import { NextRequest, NextResponse } from 'next/server'
import { Groq } from 'groq-sdk'

export const dynamic = 'force-dynamic'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const systemPrompt = `Você é a Vanthex, IA especialista em mercado digital. Responda de forma objetiva sobre anúncios, funis, copy e escala.`

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
