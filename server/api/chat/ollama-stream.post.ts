export default defineEventHandler(async (event) => {
  const { message, context } = await readBody(event)

  if (!message) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Message is required'
    })
  }

  // Set headers for Server-Sent Events
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setHeader(event, 'Cache-Control', 'no-cache')
  setHeader(event, 'Connection', 'keep-alive')
  setHeader(event, 'Access-Control-Allow-Origin', '*')

  try {
    // Build system prompt
    const systemPrompt = `Sei un assistente AI per un e-commerce. Rispondi in modo conciso e utile in italiano.`

    // Call Ollama API with streaming
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2:1b',
        prompt: `${systemPrompt}\n\nUtente: ${message}\nAssistente:`,
        stream: true,
        options: {
          temperature: 0.3,
          top_p: 0.8,
          max_tokens: 300,
          num_predict: 300,
          repeat_penalty: 1.1,
          num_ctx: 2048
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`)
    }

    // Create readable stream
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    let fullResponse = ''
    
    // Stream the response
    return new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read()
            
            if (done) {
              controller.close()
              break
            }

            const chunk = new TextDecoder().decode(value)
            const lines = chunk.split('\n').filter(line => line.trim())
            
            for (const line of lines) {
              try {
                const data = JSON.parse(line)
                if (data.response) {
                  fullResponse += data.response
                  // Send each chunk to the client
                  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ 
                    chunk: data.response, 
                    done: data.done || false,
                    fullResponse: fullResponse 
                  })}\n\n`))
                }
                
                if (data.done) {
                  controller.close()
                  break
                }
              } catch (parseError) {
                // Skip invalid JSON lines
                continue
              }
            }
          }
        } catch (error) {
          controller.error(error)
        }
      }
    })

  } catch (error: any) {
    console.error('Errore nello streaming Ollama:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Errore interno del server'
    })
  }
})