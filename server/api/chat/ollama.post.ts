import { EcommerceRecommendationEngine, type UserProfile, type RecommendationContext } from './business-logic'
import { z } from 'zod'
import { createLogger } from '../../utils/observability'
import { createAiChatUnavailableError, getAiChatGenerateUrl, getAiChatRuntimeConfig } from '../../utils/ai-chat'

const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  context: z.unknown().optional()
})
const logger = createLogger('chat-ollama')

function hasStatusCode(error: unknown): error is { statusCode: number } {
  return typeof error === 'object' && error !== null && 'statusCode' in error
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsedBody = chatRequestSchema.safeParse(body)
  if (!parsedBody.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Payload chat non valido',
      data: parsedBody.error.format()
    })
  }
  const { message } = parsedBody.data

  try {
    const aiChatConfig = getAiChatRuntimeConfig(event)
    if (!aiChatConfig.enabled || !aiChatConfig.configured) {
      throw createAiChatUnavailableError()
    }

    // Build system prompt with context
    const systemPrompt = await buildSystemPrompt(message)

    const response = await fetch(getAiChatGenerateUrl(event), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(aiChatConfig.timeoutMs),
      body: JSON.stringify({
        model: aiChatConfig.model,
        prompt: `${systemPrompt}\n\nUtente: ${message}\nAssistente:`,
        stream: false,
        options: {
          temperature: 0.3,  // Ridotto per risposte più deterministiche e veloci
          top_p: 0.8,        // Ridotto per limitare le opzioni
          max_tokens: 300,   // Ridotto per risposte più concise
          num_predict: 300,  // Limita la lunghezza della predizione
          repeat_penalty: 1.1, // Evita ripetizioni
          num_ctx: 2048      // Contesto ridotto per velocità
        }
      })
    })

    if (!response.ok) {
      throw createAiChatUnavailableError()
    }

    const ollamaResponse = await response.json() as { response: string }
    const cleanedResponse = cleanResponse(ollamaResponse.response)

    return {
      success: true,
      response: cleanedResponse,
      model: aiChatConfig.model
    }

  } catch (error: unknown) {
    if (hasStatusCode(error)) {
      throw error
    }

    logger.error('Errore nella chiamata a Ollama', {
      requestId: event.context.requestId,
      error,
      message,
    })

    throw createAiChatUnavailableError()
  }
})

// Sistema di prompt intelligente con integrazione e-commerce
async function buildSystemPrompt(userMessage: string): Promise<string> {
  let systemPrompt = `Sei un assistente e-commerce esperto e amichevole. Il tuo compito è aiutare i clienti con:
- Consigli sui prodotti personalizzati
- Informazioni su saldi e promozioni
- Suggerimenti basati su preferenze e budget
- Supporto nella scelta di prodotti

IMPORTANTE: Rispondi sempre in italiano e mantieni un tono professionale ma amichevole.`

  try {
    // Analizza il messaggio per capire l'intento dell'utente
    const lowerMessage = userMessage.toLowerCase()
    
    // Crea un profilo utente di base (in futuro potrebbe venire dal database)
    const userProfile: UserProfile = {
      favoriteCategories: [],
      priceRange: { min: 0, max: 1000 },
      preferredBrands: []
    }
    
    // Crea il contesto della raccomandazione
    const context: RecommendationContext = {
      saleInterest: lowerMessage.includes('sald') || lowerMessage.includes('scont') || lowerMessage.includes('offert'),
      priceInterest: lowerMessage.includes('prezzo') || lowerMessage.includes('costo') || lowerMessage.includes('budget'),
      categoryInterest: extractCategoryFromMessage(lowerMessage),
      userIntent: determineUserIntent(lowerMessage),
      recentKeywords: lowerMessage.split(' ').filter(word => word.length > 3)
    }
    
    // Ottieni raccomandazioni intelligenti
    const recommendations = await EcommerceRecommendationEngine.getSmartRecommendations(
      userProfile,
      context,
      6
    )
    
    if (recommendations.products.length > 0) {
      systemPrompt += `\n\nDATI PRODOTTI RILEVANTI:\n`
      systemPrompt += `Strategia utilizzata: ${recommendations.strategy}\n`
      systemPrompt += `Ragionamento: ${recommendations.reasoning}\n\n`
      
      recommendations.products.forEach((product, index) => {
        systemPrompt += `${index + 1}. ${product.name}\n`
        systemPrompt += `   - Prezzo: €${product.price}`
        if (product.promo && product.percentualPromo > 0) {
          const discountedPrice = product.price * (1 - product.percentualPromo / 100)
          systemPrompt += ` (SCONTATO: €${discountedPrice.toFixed(2)} - ${product.percentualPromo}% OFF)`
        }
        systemPrompt += `\n   - Brand: ${product.brand?.name || 'N/A'}\n`
        systemPrompt += `   - Categoria: ${product.subCategory?.category?.name || 'N/A'}\n`
        if (product.rating) {
          systemPrompt += `   - Rating: ${product.rating}/5 stelle\n`
        }
        if (product.newArrival) {
          systemPrompt += `   - 🆕 NUOVO ARRIVO\n`
        }
        systemPrompt += `\n`
      })
      
      // Aggiungi alternative se disponibili
      if (recommendations.alternatives && recommendations.alternatives.length > 0) {
        systemPrompt += `\nALTERNATIVE CONSIGLIATE:\n`
        recommendations.alternatives.slice(0, 3).forEach((product) => {
          systemPrompt += `• ${product.name} - €${product.price} (${product.brand?.name})\n`
        })
      }
    }
    
    systemPrompt += `\n\nUSA QUESTI DATI per fornire consigli personalizzati e accurati. Menziona sempre i prezzi, eventuali sconti, e spiega perché stai consigliando determinati prodotti.`
    
  } catch (error) {
    logger.error('Errore nel sistema di raccomandazioni chat', {
      error,
      userMessage,
    })
    systemPrompt += `\n\nNota: Sistema di raccomandazioni temporaneamente non disponibile. Fornisci comunque il miglior supporto possibile.`
  }
  
  return systemPrompt
}

// Funzioni di supporto per l'analisi del messaggio
function extractCategoryFromMessage(message: string): string | undefined {
  const categories = ['abbigliamento', 'scarpe', 'accessori', 'sport', 'casual', 'elegante', 'donna', 'uomo']
  return categories.find(cat => message.includes(cat))
}

function determineUserIntent(message: string): string {
  if (message.includes('sald') || message.includes('scont') || message.includes('offert')) {
    return 'sale_inquiry'
  }
  if (message.includes('nuovo') || message.includes('novità')) {
    return 'new_arrivals'
  }
  if (message.includes('prezzo') || message.includes('budget')) {
    return 'price_inquiry'
  }
  if (message.includes('consiglio') || message.includes('suggerisci')) {
    return 'recommendation_request'
  }
  return 'general_inquiry'
}

// Funzioni di formattazione dati (mantenute per compatibilità)
function _formatSalesData(data: any): string {
  if (!data?.products?.length) return 'Nessun prodotto in saldo al momento.'
  
  return data.products.slice(0, 5).map((product: any) => 
    `- ${product.name} (${product.brand}) - €${product.discountedPrice.toFixed(2)} (era €${product.originalPrice.toFixed(2)}, -${product.discountPercentage}%)`
  ).join('\n')
}

function _formatNewArrivalsData(data: any): string {
  if (!data?.products?.length) return 'Nessun nuovo arrivo al momento.'
  
  return data.products.slice(0, 5).map((product: any) => 
    `- ${product.name} (${product.brand}) - €${product.price.toFixed(2)}${product.isOnSale ? ` (SALDO -${product.discountPercentage}%)` : ''}`
  ).join('\n')
}

function _formatRecommendationsData(data: any): string {
  if (!data?.products?.length) return 'Nessuna raccomandazione disponibile.'
  
  return data.products.slice(0, 5).map((product: any) => 
    `- ${product.name} (${product.brand}) - €${product.price.toFixed(2)} - ${product.reason}`
  ).join('\n')
}

function _formatCategoriesData(data: any): string {
  if (!data?.length) return 'Nessuna categoria disponibile.'
  
  return data.slice(0, 5).map((category: any) => 
    `- ${category.name}: ${category.totalProducts} prodotti (${category.onSaleProducts} in saldo, ${category.newArrivals} novità)`
  ).join('\n')
}

function cleanResponse(response: string): string {
  // Remove common AI response artifacts
  const cleaned = response
    .replace(/^(Assistant:|AI:|Bot:)/i, '')
    .replace(/\n\n+/g, '\n\n')
    // Remove <think> tags and their content
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    // Remove any remaining whitespace after think tag removal
    .replace(/^\s+|\s+$/g, '')
    .trim()

  // Ensure the response is not empty
  if (!cleaned || cleaned.length < 3) {
    return 'Mi dispiace, non sono riuscito a comprendere la tua richiesta. Puoi riformularla?'
  }

  return cleaned
}
