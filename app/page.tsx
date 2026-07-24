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

    if (!res.ok || !res.body) {
      throw new Error('Erro ao gerar resposta')
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let assistantText = ''

    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const text = decoder.decode(value, { stream: true })
      assistantText += text

      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: assistantText },
      ])
    }
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
