'use client'

import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { CheckCircle, XCircle, AlertCircle, TrendingUp, Download } from 'lucide-react'

interface AnalysisResultProps {
  score: number
  suggestions: string[]
  strengths: string[]
  weaknesses: string[]
  improvements: string[]
}

export function AnalysisResult({
  score,
  suggestions,
  strengths,
  weaknesses,
  improvements,
}: AnalysisResultProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente'
    if (score >= 60) return 'Bom'
    if (score >= 40) return 'Médio'
    return 'Precisa Melhorar'
  }

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <Card gradient className="text-center">
        <div className={`text-6xl font-bold ${getScoreColor(score)} mb-2`}>
          {score}
        </div>
        <div className="text-vanthex-300 text-lg">
          {getScoreLabel(score)}
        </div>
        <div className="w-full bg-vanthex-800 rounded-full h-2 mt-4">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${
              score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
      </Card>

      {/* Strengths */}
      {strengths.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
            Pontos Fortes
          </h3>
          <ul className="space-y-2">
            {strengths.map((strength, i) => (
              <li key={i} className="text-vanthex-200 flex items-start">
                <span className="text-green-400 mr-2">•</span>
                {strength}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Weaknesses */}
      {weaknesses.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <XCircle className="w-5 h-5 text-red-400 mr-2" />
            Pontos de Melhoria
          </h3>
          <ul className="space-y-2">
            {weaknesses.map((weakness, i) => (
              <li key={i} className="text-vanthex-200 flex items-start">
                <span className="text-red-400 mr-2">•</span>
                {weakness}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Improvements */}
      {improvements.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 text-vanthex-400 mr-2" />
            Ações Sugeridas
          </h3>
          <ul className="space-y-2">
            {improvements.map((improvement, i) => (
              <li key={i} className="text-vanthex-200 flex items-start">
                <span className="text-vanthex-400 mr-2">➤</span>
                {improvement}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Export Button */}
      <Button className="w-full" size="lg">
        <Download className="w-5 h-5 mr-2" />
        Exportar Relatório PDF
      </Button>
    </div>
  )
}