<template>
  <div class="chatbot-container">
    <!-- Floating Chat Button -->
    <Transition name="bounce">
      <button
        v-if="!isOpen"
        @click="toggleChat"
        class="chat-toggle-btn fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 group"
        :class="{ 'animate-pulse': hasNewMessage }"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 21l1.98-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
        </svg>
        <div v-if="unreadCount > 0" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
          {{ unreadCount }}
        </div>
      </button>
    </Transition>

    <!-- Chat Window -->
    <Transition name="slide-up">
      <div
        v-if="isOpen"
        class="chat-window fixed bottom-6 right-6 w-96 h-[32rem] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden"
      >
        <!-- Header -->
        <div class="chat-header bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold">AI Assistant</h3>
              <p class="text-sm opacity-90">{{ isTyping ? 'Sta scrivendo...' : 'Online' }}</p>
            </div>
          </div>
          <button @click="toggleChat" class="hover:bg-white/20 p-2 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Messages Area -->
        <div ref="messagesContainer" class="messages-area flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
          <div v-if="messages.length === 0" class="text-center text-gray-500 mt-8">
            <div class="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 21l1.98-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
            </div>
            <p class="text-sm">Ciao! Come posso aiutarti oggi?</p>
            <div class="mt-4 space-y-2">
              <button
                v-for="suggestion in quickSuggestions"
                :key="suggestion"
                @click="sendMessage(suggestion)"
                class="block w-full text-left p-2 text-sm bg-white rounded-lg hover:bg-blue-50 transition-colors border"
              >
                {{ suggestion }}
              </button>
            </div>
          </div>

          <div
            v-for="(message, index) in messages"
            :key="index"
            class="message"
            :class="message.isUser ? 'user-message' : 'bot-message'"
          >
            <div class="flex" :class="message.isUser ? 'justify-end' : 'justify-start'">
              <div
                class="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl"
                :class="message.isUser 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                  : 'bg-white border shadow-sm'"
              >
                <p class="text-sm whitespace-pre-wrap">{{ message.text }}</p>
                <p class="text-xs mt-1 opacity-70">{{ formatTime(message.timestamp) }}</p>
              </div>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="isTyping" class="flex justify-start">
            <div class="bg-white border shadow-sm px-4 py-2 rounded-2xl">
              <div class="flex space-x-1">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="input-area p-4 bg-white border-t">
          <div class="flex space-x-2">
            <input
              v-model="currentMessage"
              @keypress.enter="handleSendMessage"
              @input="handleTyping"
              placeholder="Scrivi un messaggio..."
              class="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :disabled="isLoading"
            />
            <button
              @click="handleSendMessage"
              :disabled="!currentMessage.trim() || isLoading"
              class="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useChatStore } from '~/stores/chatStore'

const chatStore = useChatStore()

// Reactive data
const isOpen = ref(false)
const currentMessage = ref('')
const isLoading = ref(false)
const isTyping = ref(false)
const hasNewMessage = ref(false)
const unreadCount = ref(0)
const messagesContainer = ref(null)

// Quick suggestions for first interaction
const quickSuggestions = ref([
  'Mostrami i prodotti in offerta',
  'Come posso tracciare il mio ordine?',
  'Quali sono le taglie disponibili?',
  'Informazioni sulla spedizione'
])

// Computed
const messages = computed(() => chatStore.messages)

// Methods
const toggleChat = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    unreadCount.value = 0
    hasNewMessage.value = false
    nextTick(() => {
      scrollToBottom()
    })
  }
}

const handleSendMessage = async () => {
  if (!currentMessage.value.trim() || isLoading.value) return
  console.log(currentMessage.value)
  await sendMessage(currentMessage.value)
  currentMessage.value = ''
}

const sendMessage = async (text) => {
  if (!text.trim()) return

  // Add user message
  chatStore.addMessage({
    text: text.trim(),
    isUser: true,
    timestamp: new Date()
  })

  scrollToBottom()
  isLoading.value = true
  isTyping.value = true

  try {
    // Call Nuxt API endpoint for Ollama
    const response = await $fetch('/api/chat/ollama', {
      method: 'POST',
      body: {
        message: text.trim(),
        context: getContextualInfo()
      }
    })

    // Add bot response
    chatStore.addMessage({
      text: response.response,
      isUser: false,
      timestamp: new Date()
    })

    if (!isOpen.value) {
      hasNewMessage.value = true
      unreadCount.value++
    }

  } catch (error) {
    console.error('Errore nella comunicazione con Ollama:', error)
    chatStore.addMessage({
      text: 'Mi dispiace, si è verificato un errore. Riprova più tardi.',
      isUser: false,
      timestamp: new Date()
    })
  } finally {
    isLoading.value = false
    isTyping.value = false
    scrollToBottom()
  }
}

const getContextualInfo = () => {
  // Get current page context for better responses
  const route = useRoute()
  return {
    currentPage: route.name,
    currentPath: route.path,
    isProductPage: route.name === 'product-id',
    productId: route.params?.id
  }
}

const handleTyping = () => {
  // Could implement typing indicators for user
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Watch for new messages to scroll
watch(() => messages.value.length, () => {
  scrollToBottom()
})

// Initialize chat store on mount
onMounted(() => {
  chatStore.initializeChat()
})
</script>

<style scoped>
/* Animations */
.bounce-enter-active, .bounce-leave-active {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.bounce-enter-from, .bounce-leave-to {
  transform: scale(0) rotate(180deg);
  opacity: 0;
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s ease-out;
}

.slide-up-enter-from {
  transform: translateY(100%) scale(0.8);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%) scale(0.8);
  opacity: 0;
}

/* Custom scrollbar */
.messages-area::-webkit-scrollbar {
  width: 4px;
}

.messages-area::-webkit-scrollbar-track {
  background: transparent;
}

.messages-area::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 2px;
}

.messages-area::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .chat-window {
    width: calc(100vw - 2rem);
    height: calc(100vh - 2rem);
    bottom: 1rem;
    right: 1rem;
  }
}
</style>