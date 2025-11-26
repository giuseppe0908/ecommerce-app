<!-- layouts/default.vue -->
<template>
    <div>
      <Navbar />
      <main>
        <slot />
      </main>
      <!-- AI ChatBot Integration - Solo se Ollama è disponibile -->
      <ChatBot v-if="isOllamaAvailable" />
      <!-- Messaggio opzionale quando Ollama non è disponibile -->
      <div v-else-if="!isChecking" class="ollama-unavailable-notice">
        <!-- Puoi personalizzare questo messaggio o rimuoverlo completamente -->
      </div>
    </div>
  </template>
  
  <script setup>
  import Navbar from '~/components/Navbar.vue'
  import ChatBot from '~/components/ChatBot.vue'
  import { useOllamaStatus } from '~/composables/useOllamaStatus.js'

  // Verifica lo stato di Ollama
  const { isOllamaAvailable, isChecking } = useOllamaStatus()
  </script>
  
  <style scoped>
  </style>
  