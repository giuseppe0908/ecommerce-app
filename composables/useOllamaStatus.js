import { ref, onMounted, readonly } from 'vue'

export const useOllamaStatus = () => {
  const runtimeConfig = useRuntimeConfig()
  const featureEnabled = Boolean(runtimeConfig.public?.aiChatEnabled)
  const isChatAvailable = ref(false)
  const isChecking = ref(featureEnabled)
  const status = ref({
    enabled: featureEnabled,
    available: false,
    provider: runtimeConfig.public?.aiChatProvider || 'ollama',
    reason: featureEnabled ? 'checking' : 'disabled',
  })

  const checkOllamaStatus = async () => {
    if (!featureEnabled) {
      status.value = {
        enabled: false,
        available: false,
        provider: runtimeConfig.public?.aiChatProvider || 'ollama',
        reason: 'disabled',
      }
      isChatAvailable.value = false
      isChecking.value = false
      return status.value
    }

    try {
      isChecking.value = true

      const response = await $fetch('/api/chat/status', {
        method: 'GET',
        retry: 0,
      })

      status.value = {
        enabled: Boolean(response?.enabled),
        available: Boolean(response?.available),
        provider: response?.provider || runtimeConfig.public?.aiChatProvider || 'ollama',
        reason: response?.reason || 'unavailable',
      }
      isChatAvailable.value = status.value.enabled && status.value.available
    } catch (error) {
      console.warn('Assistente AI non disponibile:', error?.message || error)
      status.value = {
        enabled: featureEnabled,
        available: false,
        provider: runtimeConfig.public?.aiChatProvider || 'ollama',
        reason: 'unreachable',
      }
      isChatAvailable.value = false
    } finally {
      isChecking.value = false
    }

    return status.value
  }

  onMounted(() => {
    void checkOllamaStatus()
  })

  return {
    isChatAvailable: readonly(isChatAvailable),
    isOllamaAvailable: readonly(isChatAvailable),
    isChecking: readonly(isChecking),
    status: readonly(status),
    checkOllamaStatus
  }
}
