<!-- layouts/default.vue -->
<template>
  <div>
    <Navbar />
    <main>
      <slot />
    </main>
    <ClientOnly>
      <Cart />
    </ClientOnly>
    <ClientOnly>
      <ChatBot v-if="isChatAvailable" />
    </ClientOnly>
  </div>
</template>

<script setup>
import Navbar from '~/components/Navbar.vue'
import Cart from '~/components/Cart.vue'
import ChatBot from '~/components/ChatBot.vue'
import { useOllamaStatus } from '~/composables/useOllamaStatus.js'

const { isChatAvailable } = useOllamaStatus()
</script>

<style scoped>
</style>
