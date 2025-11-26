import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [],
    isLoading: false,
    sessionId: null,
    userPreferences: {
      favoriteCategories: [],
      priceRange: { min: 0, max: 1000 },
      preferredBrands: [],
      size: null,
      gender: null
    },
    chatContext: {
      currentPage: null,
      productId: null,
      categoryId: null,
      searchQuery: null,
      lastInteraction: null
    },
    analytics: {
      totalMessages: 0,
      sessionsCount: 0,
      averageSessionLength: 0,
      popularQueries: []
    }
  }),

  getters: {
    lastMessage: (state) => state.messages[state.messages.length - 1],
    messageCount: (state) => state.messages.length,
    hasMessages: (state) => state.messages.length > 0,
    
    // Intelligent context for recommendations
    getSmartContext: (state) => {
      const recentMessages = state.messages.slice(-5)
      const keywords = recentMessages
        .filter(msg => msg.type === 'user')
        .map(msg => msg.content.toLowerCase())
        .join(' ')
      
      return {
        ...state.chatContext,
        recentKeywords: extractKeywords(keywords),
        userIntent: detectUserIntent(keywords),
        recommendationContext: buildRecommendationContext(state)
      }
    }
  },

  actions: {
    // Enhanced message sending with smart context
    async sendMessage(content) {
      // Controlla cache prima
      const cacheKey = content.toLowerCase().trim()
      if (this.responseCache.has(cacheKey)) {
        const cachedResponse = this.responseCache.get(cacheKey)
        this.addMessage({
          text: cachedResponse,
          isUser: false,
          timestamp: new Date(),
          cached: true
        })
        return cachedResponse
      }

      this.isLoading = true
      
      // Add user message
      const userMessage = {
        id: Date.now(),
        type: 'user',
        content,
        timestamp: new Date().toISOString(),
        context: { ...this.chatContext }
      }
      this.messages.push(userMessage)
      
      // Update context based on message
      this.updateContextFromMessage(content)
      
      try {
        // Get smart context for AI
        const smartContext = this.getSmartContext
        
        // Enhanced API call with intelligent context
        const response = await $fetch('/api/chat/ollama', {
          method: 'POST',
          body: {
            message: content,
            context: smartContext,
            userPreferences: this.userPreferences,
            sessionHistory: this.messages.slice(-10) // Last 10 messages for context
          }
        })

        // Add AI response
        const aiMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: response.response || response.message,
          timestamp: new Date().toISOString(),
          model: response.model,
          confidence: response.confidence || 0.8,
          suggestions: response.suggestions || []
        }
        this.messages.push(aiMessage)
        
        // Salva in cache per domande future simili
        const cacheKey = content.toLowerCase().trim()
        this.responseCache.set(cacheKey, response.response || response.message)
        
        // Limita la cache a 50 elementi per evitare memory leak
        if (this.responseCache.size > 50) {
          const firstKey = this.responseCache.keys().next().value
          this.responseCache.delete(firstKey)
        }
        
        // Update analytics
        this.updateAnalytics(content, response)
        
        // Learn from interaction
        this.learnFromInteraction(content, response)
        
      } catch (error) {
        console.error('Errore nell\'invio del messaggio:', error)
        
        const errorMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: 'Mi dispiace, si è verificato un errore. Riprova tra poco.',
          timestamp: new Date().toISOString(),
          isError: true
        }
        this.messages.push(errorMessage)
      } finally {
        this.isLoading = false
        this.saveToStorage()
      }
    },

    // Add message directly to chat
    addMessage(message) {
      const formattedMessage = {
        id: message.id || Date.now(),
        type: message.isUser ? 'user' : 'assistant',
        content: message.text || message.content,
        timestamp: message.timestamp || new Date().toISOString(),
        ...message
      }
      
      this.messages.push(formattedMessage)
      this.saveToStorage()
    },

    // Smart context updates
    updateContextFromMessage(message) {
      const lowerMessage = message.toLowerCase()
      
      // Detect product interest
      if (lowerMessage.includes('prodotto') || lowerMessage.includes('articolo')) {
        this.chatContext.lastInteraction = 'product_inquiry'
      }
      
      // Detect category interest
      const categories = ['abbigliamento', 'scarpe', 'accessori', 'sport', 'casual', 'elegante']
      const mentionedCategory = categories.find(cat => lowerMessage.includes(cat))
      if (mentionedCategory) {
        this.chatContext.categoryInterest = mentionedCategory
      }
      
      // Detect price sensitivity
      if (lowerMessage.includes('prezzo') || lowerMessage.includes('costo') || lowerMessage.includes('economico')) {
        this.chatContext.priceInterest = true
      }
      
      // Detect sale interest
      if (lowerMessage.includes('sald') || lowerMessage.includes('scont') || lowerMessage.includes('offert')) {
        this.chatContext.saleInterest = true
      }
      
      this.chatContext.lastInteraction = Date.now()
    },

    // Learn from user interactions
    learnFromInteraction(userMessage, aiResponse) {
      const intent = detectUserIntent(userMessage.toLowerCase())
      
      // Update user preferences based on interactions
      if (intent === 'product_search') {
        // Extract potential preferences
        const brands = extractBrands(userMessage)
        const categories = extractCategories(userMessage)
        
        brands.forEach(brand => {
          if (!this.userPreferences.preferredBrands.includes(brand)) {
            this.userPreferences.preferredBrands.push(brand)
          }
        })
        
        categories.forEach(category => {
          if (!this.userPreferences.favoriteCategories.includes(category)) {
            this.userPreferences.favoriteCategories.push(category)
          }
        })
      }
    },

    // Enhanced analytics
    updateAnalytics(userMessage, aiResponse) {
      this.analytics.totalMessages++
      
      // Track popular queries
      const intent = detectUserIntent(userMessage.toLowerCase())
      const existingQuery = this.analytics.popularQueries.find(q => q.intent === intent)
      
      if (existingQuery) {
        existingQuery.count++
      } else {
        this.analytics.popularQueries.push({
          intent,
          count: 1,
          lastUsed: new Date().toISOString()
        })
      }
      
      // Keep only top 10 popular queries
      this.analytics.popularQueries = this.analytics.popularQueries
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    },

    // Context management
    setPageContext(page, additionalData = {}) {
      this.chatContext = {
        ...this.chatContext,
        currentPage: page,
        ...additionalData,
        timestamp: Date.now()
      }
    },

    setProductContext(productId, productData = {}) {
      this.chatContext = {
        ...this.chatContext,
        productId,
        productData,
        lastInteraction: 'product_view',
        timestamp: Date.now()
      }
    },

    // User preferences management
    updateUserPreferences(preferences) {
      this.userPreferences = {
        ...this.userPreferences,
        ...preferences
      }
      this.saveToStorage()
    },

    // Session management
    startNewSession() {
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      this.analytics.sessionsCount++
      this.saveToStorage()
    },

    clearChat() {
      this.messages = []
      this.isLoading = false
      this.chatContext = {
        currentPage: null,
        productId: null,
        categoryId: null,
        searchQuery: null,
        lastInteraction: null
      }
      this.saveToStorage()
    },

    // Initialize chat system
    initializeChat() {
      // Load previous session data
      this.loadFromStorage()
      
      // Start new session if none exists
      if (!this.sessionId) {
        this.startNewSession()
      }
      
      // Add welcome message if no messages exist
      if (this.messages.length === 0) {
        this.messages.push({
          id: Date.now(),
          type: 'ai',
          content: 'Ciao! Sono il tuo assistente e-commerce. Come posso aiutarti oggi? Posso consigliarti prodotti, informarti sui saldi o rispondere a qualsiasi domanda sui nostri articoli! 🛍️',
          timestamp: new Date().toISOString()
        })
        this.saveToStorage()
      }
      
      // Update analytics
      this.analytics.sessionsCount++
      
      console.log('Chat system initialized successfully')
    },

    // Cache per risposte frequenti
    responseCache: new Map(),
    
    // Persistence
    saveToStorage() {
      try {
        const dataToSave = {
          messages: this.messages,
          sessionId: this.sessionId,
          chatContext: this.chatContext,
          userPreferences: this.userPreferences,
          analytics: this.analytics
        }
        localStorage.setItem('ecommerce-chat-data', JSON.stringify(dataToSave))
      } catch (error) {
        console.warn('Errore nel salvataggio chat:', error)
      }
    },

    loadFromStorage() {
      try {
        const saved = localStorage.getItem('ecommerce-chat-data')
        if (saved) {
          const data = JSON.parse(saved)
          this.messages = data.messages || []
          this.sessionId = data.sessionId || null
          this.chatContext = { ...this.chatContext, ...data.chatContext }
          this.userPreferences = { ...this.userPreferences, ...data.userPreferences }
          this.analytics = { ...this.analytics, ...data.analytics }
        }
      } catch (error) {
        console.warn('Errore nel caricamento chat:', error)
        // Reset to defaults on error
        this.messages = []
        this.sessionId = null
      }
    }
  }
})

// Utility functions for intelligent context
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
  return 'general_inquiry'
}

function buildRecommendationContext(state) {
  return {
    favoriteCategories: state.userPreferences.favoriteCategories,
    priceRange: state.userPreferences.priceRange,
    preferredBrands: state.userPreferences.preferredBrands,
    recentInteractions: state.messages.slice(-5).map(m => m.type === 'user' ? m.content : null).filter(Boolean),
    currentContext: state.chatContext
  }
}

function extractBrands(text) {
  const commonBrands = ['nike', 'adidas', 'puma', 'zara', 'h&m', 'uniqlo', 'gucci', 'prada']
  return commonBrands.filter(brand => text.toLowerCase().includes(brand))
}

function extractCategories(text) {
  const categories = ['abbigliamento', 'scarpe', 'accessori', 'sport', 'casual', 'elegante', 'formale']
  return categories.filter(category => text.toLowerCase().includes(category))
}