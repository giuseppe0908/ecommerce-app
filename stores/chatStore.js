import { defineStore } from 'pinia'

const CHAT_STORAGE_KEY = 'ecommerce-chat-data'
const MAX_CACHE_ITEMS = 50

function isClientStorageAvailable() {
  return process.client && typeof localStorage !== 'undefined'
}

function defaultUserPreferences() {
  return {
    favoriteCategories: [],
    priceRange: { min: 0, max: 1000 },
    preferredBrands: [],
    size: null,
    gender: null,
  }
}

function defaultChatContext() {
  return {
    currentPage: null,
    productId: null,
    categoryId: null,
    searchQuery: null,
    lastInteraction: null,
    interactionType: null,
    categoryInterest: null,
    priceInterest: false,
    saleInterest: false,
    timestamp: null,
  }
}

function defaultAnalytics() {
  return {
    totalMessages: 0,
    sessionsCount: 0,
    averageSessionLength: 0,
    popularQueries: [],
  }
}

function toIsoTimestamp(value) {
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return date.toISOString()
  }
  return new Date().toISOString()
}

function normalizeMessage(rawMessage) {
  if (!rawMessage || typeof rawMessage !== 'object') {
    return null
  }

  const text =
    typeof rawMessage.text === 'string'
      ? rawMessage.text
      : typeof rawMessage.content === 'string'
        ? rawMessage.content
        : ''

  if (!text.trim()) {
    return null
  }

  const isUser =
    typeof rawMessage.isUser === 'boolean'
      ? rawMessage.isUser
      : rawMessage.type === 'user'

  return {
    ...rawMessage,
    id: rawMessage.id ?? Date.now() + Math.floor(Math.random() * 1000),
    text,
    content: text,
    isUser,
    type: isUser ? 'user' : 'assistant',
    timestamp: toIsoTimestamp(rawMessage.timestamp),
  }
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [],
    isLoading: false,
    sessionId: null,
    responseCache: {},
    responseCacheKeys: [],
    userPreferences: defaultUserPreferences(),
    chatContext: defaultChatContext(),
    analytics: defaultAnalytics(),
  }),

  getters: {
    lastMessage: (state) => state.messages[state.messages.length - 1] || null,
    messageCount: (state) => state.messages.length,
    hasMessages: (state) => state.messages.length > 0,

    getSmartContext: (state) => {
      const recentMessages = state.messages.slice(-5)
      const keywordsText = recentMessages
        .filter((msg) => msg.isUser)
        .map((msg) => msg.text.toLowerCase())
        .join(' ')

      return {
        ...state.chatContext,
        recentKeywords: extractKeywords(keywordsText),
        userIntent: detectUserIntent(keywordsText),
        recommendationContext: buildRecommendationContext(state),
      }
    },
  },

  actions: {
    setCachedResponse(key, value) {
      if (!key || !value) return

      if (!(key in this.responseCache)) {
        this.responseCacheKeys.push(key)
      }

      this.responseCache[key] = value

      while (this.responseCacheKeys.length > MAX_CACHE_ITEMS) {
        const oldestKey = this.responseCacheKeys.shift()
        if (oldestKey) {
          delete this.responseCache[oldestKey]
        }
      }
    },

    getCachedResponse(key) {
      if (!key) return null
      return this.responseCache[key] || null
    },

    async sendMessage(content) {
      const normalizedContent = typeof content === 'string' ? content.trim() : ''
      if (!normalizedContent) return null

      const cacheKey = normalizedContent.toLowerCase()
      const cachedResponse = this.getCachedResponse(cacheKey)

      if (cachedResponse) {
        this.addMessage({
          text: cachedResponse,
          isUser: false,
          cached: true,
          timestamp: new Date(),
        })
        return cachedResponse
      }

      this.isLoading = true

      this.addMessage({
        text: normalizedContent,
        isUser: true,
        context: { ...this.chatContext },
      })

      this.updateContextFromMessage(normalizedContent)

      try {
        const smartContext = this.getSmartContext

        const response = await $fetch('/api/chat/ollama', {
          method: 'POST',
          body: {
            message: normalizedContent,
            context: smartContext,
            userPreferences: this.userPreferences,
            sessionHistory: this.messages.slice(-10).map((message) => ({
              type: message.type,
              content: message.text,
              timestamp: message.timestamp,
            })),
          },
        })

        const answer = response?.response || response?.message || 'Al momento non ho una risposta disponibile.'

        this.addMessage({
          text: answer,
          isUser: false,
          model: response?.model,
          confidence: response?.confidence ?? 0.8,
          suggestions: Array.isArray(response?.suggestions) ? response.suggestions : [],
        })

        this.setCachedResponse(cacheKey, answer)
        this.updateAnalytics(normalizedContent)
        this.learnFromInteraction(normalizedContent)

        return answer
      } catch (error) {
        console.error("Errore nell'invio del messaggio:", error)

        this.addMessage({
          text: 'Mi dispiace, si e verificato un errore. Riprova tra poco.',
          isUser: false,
          isError: true,
        })

        return null
      } finally {
        this.isLoading = false
        this.saveToStorage()
      }
    },

    addMessage(message) {
      const formattedMessage = normalizeMessage(message)
      if (!formattedMessage) return

      this.messages.push(formattedMessage)
      this.saveToStorage()
    },

    updateContextFromMessage(message) {
      const lowerMessage = String(message).toLowerCase()
      const updatedContext = { ...this.chatContext }

      if (lowerMessage.includes('prodotto') || lowerMessage.includes('articolo')) {
        updatedContext.interactionType = 'product_inquiry'
      }

      const categories = ['abbigliamento', 'scarpe', 'accessori', 'sport', 'casual', 'elegante']
      const mentionedCategory = categories.find((category) => lowerMessage.includes(category))
      if (mentionedCategory) {
        updatedContext.categoryInterest = mentionedCategory
      }

      if (
        lowerMessage.includes('prezzo') ||
        lowerMessage.includes('costo') ||
        lowerMessage.includes('economico')
      ) {
        updatedContext.priceInterest = true
      }

      if (
        lowerMessage.includes('sald') ||
        lowerMessage.includes('scont') ||
        lowerMessage.includes('offert')
      ) {
        updatedContext.saleInterest = true
      }

      updatedContext.lastInteraction = Date.now()
      updatedContext.timestamp = Date.now()
      this.chatContext = updatedContext
    },

    learnFromInteraction(userMessage) {
      const intent = detectUserIntent(userMessage.toLowerCase())

      if (intent !== 'product_search' && intent !== 'recommendation_request') {
        return
      }

      const brands = extractBrands(userMessage)
      const categories = extractCategories(userMessage)

      brands.forEach((brand) => {
        if (!this.userPreferences.preferredBrands.includes(brand)) {
          this.userPreferences.preferredBrands.push(brand)
        }
      })

      categories.forEach((category) => {
        if (!this.userPreferences.favoriteCategories.includes(category)) {
          this.userPreferences.favoriteCategories.push(category)
        }
      })
    },

    updateAnalytics(userMessage) {
      this.analytics.totalMessages += 1

      const intent = detectUserIntent(userMessage.toLowerCase())
      const existingQuery = this.analytics.popularQueries.find((query) => query.intent === intent)

      if (existingQuery) {
        existingQuery.count += 1
        existingQuery.lastUsed = new Date().toISOString()
      } else {
        this.analytics.popularQueries.push({
          intent,
          count: 1,
          lastUsed: new Date().toISOString(),
        })
      }

      this.analytics.popularQueries = this.analytics.popularQueries
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    },

    setPageContext(page, additionalData = {}) {
      this.chatContext = {
        ...this.chatContext,
        currentPage: page,
        ...additionalData,
        timestamp: Date.now(),
      }
    },

    setProductContext(productId, productData = {}) {
      this.chatContext = {
        ...this.chatContext,
        productId,
        productData,
        interactionType: 'product_view',
        lastInteraction: Date.now(),
        timestamp: Date.now(),
      }
    },

    updateUserPreferences(preferences) {
      this.userPreferences = {
        ...this.userPreferences,
        ...preferences,
      }

      this.saveToStorage()
    },

    startNewSession() {
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
      this.analytics.sessionsCount += 1
      this.saveToStorage()
    },

    clearChat() {
      this.messages = []
      this.isLoading = false
      this.chatContext = defaultChatContext()
      this.saveToStorage()
    },

    initializeChat() {
      this.loadFromStorage()

      if (!this.sessionId) {
        this.startNewSession()
      }

      if (this.messages.length === 0) {
        this.addMessage({
          text: 'Ciao! Sono il tuo assistente e-commerce. Come posso aiutarti oggi? Posso consigliarti prodotti, informarti sui saldi o rispondere a domande sui nostri articoli.',
          isUser: false,
        })
        this.saveToStorage()
      }
    },

    saveToStorage() {
      if (!isClientStorageAvailable()) return

      try {
        const dataToSave = {
          messages: this.messages,
          sessionId: this.sessionId,
          chatContext: this.chatContext,
          userPreferences: this.userPreferences,
          analytics: this.analytics,
          responseCache: this.responseCache,
          responseCacheKeys: this.responseCacheKeys,
        }

        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(dataToSave))
      } catch (error) {
        console.warn('Errore nel salvataggio chat:', error)
      }
    },

    loadFromStorage() {
      if (!isClientStorageAvailable()) return

      try {
        const saved = localStorage.getItem(CHAT_STORAGE_KEY)
        if (!saved) return

        const data = JSON.parse(saved)

        this.messages = Array.isArray(data?.messages)
          ? data.messages.map((message) => normalizeMessage(message)).filter((message) => message !== null)
          : []

        this.sessionId = typeof data?.sessionId === 'string' ? data.sessionId : null

        this.chatContext = {
          ...defaultChatContext(),
          ...(data?.chatContext || {}),
        }

        this.userPreferences = {
          ...defaultUserPreferences(),
          ...(data?.userPreferences || {}),
        }

        this.analytics = {
          ...defaultAnalytics(),
          ...(data?.analytics || {}),
        }

        this.responseCache =
          data?.responseCache && typeof data.responseCache === 'object'
            ? data.responseCache
            : {}

        const storedCacheKeys = Array.isArray(data?.responseCacheKeys)
          ? data.responseCacheKeys.filter((key) => typeof key === 'string')
          : Object.keys(this.responseCache)

        this.responseCacheKeys = storedCacheKeys.slice(-MAX_CACHE_ITEMS)

        // Sincronizza eventuali chiavi cache orfane
        Object.keys(this.responseCache).forEach((key) => {
          if (!this.responseCacheKeys.includes(key)) {
            delete this.responseCache[key]
          }
        })
      } catch (error) {
        console.warn('Errore nel caricamento chat:', error)
        this.messages = []
        this.sessionId = null
        this.responseCache = {}
        this.responseCacheKeys = []
      }
    },
  },
})

function extractKeywords(text) {
  const keywords = text.match(/\b\w{4,}\b/g) || []
  return [...new Set(keywords)].slice(0, 10)
}

function detectUserIntent(text) {
  if (text.includes('sald') || text.includes('scont') || text.includes('offert')) {
    return 'sale_inquiry'
  }
  if (text.includes('nuov') || text.includes('arriv')) {
    return 'new_arrivals'
  }
  if (text.includes('consiglio') || text.includes('raccomand')) {
    return 'recommendation_request'
  }
  if (text.includes('prezzo') || text.includes('costo')) {
    return 'price_inquiry'
  }
  if (text.includes('taglia') || text.includes('misura')) {
    return 'size_inquiry'
  }
  if (text.includes('disponibil') || text.includes('stock')) {
    return 'availability_check'
  }
  if (text.includes('prodotto') || text.includes('articolo') || text.includes('cerco')) {
    return 'product_search'
  }
  return 'general_inquiry'
}

function buildRecommendationContext(state) {
  return {
    favoriteCategories: state.userPreferences.favoriteCategories,
    priceRange: state.userPreferences.priceRange,
    preferredBrands: state.userPreferences.preferredBrands,
    recentInteractions: state.messages
      .slice(-5)
      .map((message) => (message.isUser ? message.text : null))
      .filter(Boolean),
    currentContext: state.chatContext,
  }
}

function extractBrands(text) {
  const commonBrands = ['nike', 'adidas', 'puma', 'zara', 'h&m', 'uniqlo', 'gucci', 'prada']
  return commonBrands.filter((brand) => text.toLowerCase().includes(brand))
}

function extractCategories(text) {
  const categories = ['abbigliamento', 'scarpe', 'accessori', 'sport', 'casual', 'elegante', 'formale']
  return categories.filter((category) => text.toLowerCase().includes(category))
}
