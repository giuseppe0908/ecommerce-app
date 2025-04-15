// Plugin per la pulizia automatica dei token scaduti
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(async (nuxtApp) => {
  // Funzione per pulire i token scaduti
  const cleanupTokens = async () => {
    try {
      console.log('Avvio pulizia automatica dei token scaduti...')
      const response = await fetch('/api/cleanup-tokens')
      const data = await response.json()
      console.log(`Pulizia token completata: ${data.deletedTokens} token di autenticazione e ${data.deletedResetTokens} token di reset eliminati`)
      return data.success
    } catch (error) {
      console.error('Errore durante la pulizia automatica dei token:', error)
      return false
    }
  }

  // Esegui la pulizia all'avvio dell'applicazione (solo lato client)
  if (process.client) {
    // Esegui la pulizia dopo un breve ritardo per assicurarsi che l'app sia completamente caricata
    setTimeout(async () => {
      await cleanupTokens()
    }, 2000) // 2 secondi di ritardo

    // Imposta un intervallo per la pulizia periodica (ogni 12 ore)
    const CLEANUP_INTERVAL = 12 * 60 * 60 * 1000 // 12 ore in millisecondi
    setInterval(async () => {
      await cleanupTokens()
    }, CLEANUP_INTERVAL)
  }

  // Esponi la funzione di pulizia per poterla chiamare manualmente se necessario
  return {
    provide: {
      cleanupTokens
    }
  }
})