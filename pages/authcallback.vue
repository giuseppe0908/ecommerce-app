<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNoIndexPageSeo } from '~/composables/usePageSeo'
import { useAuthStore } from '@/stores/authStore'

useNoIndexPageSeo({
  title: 'OAuth callback',
  description: 'Completamento autenticazione tramite provider esterno.',
  path: '/authcallback',
})

const router = useRouter()
const authStore = useAuthStore()

const isProcessing = ref(true)
const callbackError = ref('')

const errorMessage = computed(() => callbackError.value || authStore.error || '')

onMounted(async () => {
  const isAuthenticated = await authStore.completeOAuthCallback()
  if (isAuthenticated) {
    await router.replace('/dashboard')
    return
  }

  callbackError.value = authStore.error || 'Autenticazione OAuth fallita.'
  isProcessing.value = false
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
      <div v-if="isProcessing || authStore.isLoading" class="text-gray-700">
        Autenticazione in corso...
      </div>

      <div v-else-if="errorMessage" class="space-y-4">
        <p class="text-red-600">{{ errorMessage }}</p>
        <NuxtLink
          to="/login"
          class="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Torna al login
        </NuxtLink>
      </div>

      <div v-else class="text-green-600">
        Autenticazione completata. Reindirizzamento...
      </div>
    </div>
  </div>
</template>
