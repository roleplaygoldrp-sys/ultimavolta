import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { getServerSupabase } from '@/lib/supabase'
import { extractJSON } from '@/lib/utils'

interface AnalysisResponse {
  score: number
  suggestions: string[]
  strengths: string[]
  weaknesses: string[]
  improvements: string[]
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, imageStoragePath } = await request.json()

    // Get current user
    const supabase = getServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      request.headers.get('authorization')?.replace('Bearer ', '')
    )

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user credits
    const { data: userData } = await supabase
      .from('users')
      .select('credits, plan')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (userData.plan === 'free' && userData.credits <= 0) {
      return NextResponse.json(
        { error: 'Créditos esgotados. Faça upgrade para Pro.' },
        { status: 403 }
      )
    }

    // Analyze image with OpenAI Vision
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é Vanthex, uma IA profissional especializada em análise de Facebook Ads.
Sua tarefa é analisar a imagem enviada e retornar UM JSON com:
- score: número de 0 a 100
- strengths: array com 2-3 pontos fortes do ad
- weaknesses: array com 2-3 pontos de melhoria
- improvements: array com 3-5 ações específicas para melhorar performance
- suggestions: array com dicas extras de otimização

Responda APENAS o JSON, sem texto adicional.`,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analise este Facebook Ad e me dê um relatório completo:' },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
      response_format: { type: 'json_object' },
    })

    const analysis = extractJSON<AnalysisResponse>(completion.choices[0].message.content)

    if (!analysis) {
      throw new Error('Falha ao processar análise da IA')
    }

    // Save to database
    await supabase.from('ad_analyses').insert({
      user_id: user.id,
      image_url: imageUrl,
      image_storage_path: imageStoragePath,
      score: analysis.score,
      suggestions: analysis.suggestions,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      improvements: analysis.improvements,
    })

    // Decrement credits for free users
    if (userData.plan === 'free') {
      await supabase
        .from('users')
        .update({ credits: userData.credits - 1 })
        .eq('id', user.id)
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Erro interno ao analisar imagem' },
      { status: 500 }
    )
  }
}