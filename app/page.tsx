const handleSend = async () => {
  if (!input.trim() || isLoading) return

  const userMessage: Message = { role: 'user', content: input.trim() }
  const updatedMessages = [...messages, userMessage]
  setMessages(updatedMessages)
  setInput('')
  setIsLoading(true)

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    })

    if (!res.ok) {
      throw new Error('Erro ao gerar resposta')
    }

    const data = await res.json()
    const assistantMessage = data.content

    setMessages((prev) => [...prev, { role: 'assistant', content: assistantMessage }])
  } catch (error) {
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: `Erro: ${error instanceof Error ? error.message : 'Falha ao responder'}`,
      },
    ])
  } finally {
    setIsLoading(false)
  }
}
