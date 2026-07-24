'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Upload, Image, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdUploaderProps {
  onAnalysisComplete: (result: any) => void
  onError: (error: string) => void
}

export function AdUploader({ onAnalysisComplete, onError }: AdUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      onError('Por favor, envie apenas imagens (PNG, JPG)')
      return
    }

    setIsUploading(true)
    setPreview(URL.createObjectURL(file))

    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) {
        onError('Você precisa estar logado para analisar ads')
        return
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ad-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('ad-images')
        .getPublicUrl(fileName)

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: publicUrl,
          imageStoragePath: fileName,
        }),
      })

      if (!response.ok) throw new Error('Falha na análise')

      const result = await response.json()
      onAnalysisComplete(result)
    } catch (error) {
      console.error('Upload error:', error)
      onError(error instanceof Error ? error.message : 'Erro ao analisar ad')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  return (
    <Card gradient className="w-full">
      <div
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300',
          preview
            ? 'border-vanthex-500/50 bg-vanthex-900/30'
            : 'border-vanthex-700/50 hover:border-vanthex-500/50 hover:bg-vanthex-900/20'
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative inline-block">
            <img src={preview} alt="Preview" className="max-h-64 rounded-lg shadow-lg" />
            <button
              onClick={() => setPreview(null)}
              className="absolute -top-2 -right-2 bg-vanthex-600 hover:bg-vanthex-700 rounded-full p-1 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-vanthex-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-vanthex-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Envie seu Ad do Facebook
            </h3>
            <p className="text-vanthex-300 mb-4">
              Arraste e solte ou clique para selecionar
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              isLoading={isUploading}
            >
              <Image className="w-4 h-4 mr-2" />
              {isUploading ? 'Analisando...' : 'Selecionar Imagem'}
            </Button>
          </>
        )}
      </div>
    </Card>
  )
}