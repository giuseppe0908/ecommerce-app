import { z } from 'zod'
import { createLogger } from '../../utils/observability'
import { createAiChatUnavailableError, getAiChatGenerateUrl, getAiChatRuntimeConfig } from '../../utils/ai-chat'

const chatStreamRequestSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  context: z.unknown().optional()
})
const logger = createLogger('chat-ollama-stream')

function hasStatusCode(error: unknown): error is { statusCode: number } {
  return typeof error === 'object' && error !== null && 'statusCode' in error
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsedBody = chatStreamRequestSchema.safeParse(body)
  if (!parsedBody.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Payload chat stream non valido',
      data: parsedBody.error.format()
    })
  }
  const { message } = parsedBody.data

  // Set headers for Server-Sent Events
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setHeader(event, 'Cache-Control', 'no-cache')
  setHeader(event, 'Connection', 'keep-alive')
  setHeader(event, 'Access-Control-Allow-Origin', '*')

  try {
    const aiChatConfig = getAiChatRuntimeConfig(event)
    if (!aiChatConfig.enabled || !aiChatConfig.configured) {
      throw createAiChatUnavailableError()
    }

    // Build system prompt
    const systemPrompt = `Sei un assistente AI per un e-commerce. Rispondi in modo conciso e utile in italiano.`

    const response = await fetch(getAiChatGenerateUrl(event), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(aiChatConfig.timeoutMs),
      body: JSON.stringify({
        model: aiChatConfig.model,
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
      throw createAiChatUnavailableError()
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
              } catch {
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

  } catch (error: unknown) {
    if (hasStatusCode(error)) {
      throw error
    }

    logger.error('Errore nello streaming Ollama', {
      requestId: event.context.requestId,
      error,
      message,
    })
    throw createAiChatUnavailableError()
  }
})
