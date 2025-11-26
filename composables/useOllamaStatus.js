import { ref, onMounted, readonly } from 'vue'

export const useOllamaStatus = () => {
  const isOllamaAvailable = ref(false)
  const isChecking = ref(true)

  const checkOllamaStatus = async () => {
    try {
      isChecking.value = true
      
      // Verifica se Ollama è disponibile facendo una richiesta ai modelli
      const response = await fetch('http://localhost:11434/api/tags', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        // Timeout di 3 secondi per evitare attese lunghe
        signal: AbortSignal.timeout(3000)
      })
      
      if (response.ok) {
        const data = await response.json()
        // Verifica che ci siano modelli disponibili
        isOllamaAvailable.value = data.models && data.models.length > 0
      } else {
        isOllamaAvailable.value = false
      }
    } catch (error) {
      // Se c'è un errore (connessione rifiutata, timeout, ecc.), Ollama non è disponibile
      console.warn('Ollama non disponibile:', error.message)
      isOllamaAvailable.value = false
    } finally {
      isChecking.value = false
    }
  }

  // Controlla lo stato all'avvio
  onMounted(() => {
    checkOllamaStatus()
  })

  return {
    isOllamaAvailable: readonly(isOllamaAvailable),
    isChecking: readonly(isChecking),
    checkOllamaStatus
  }
}