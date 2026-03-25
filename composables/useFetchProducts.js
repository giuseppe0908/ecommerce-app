import { ref, watch } from 'vue'
import { useAsyncData } from '#app'

export const useFetchProducts = (filters) => {
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchProducts = async () => {
    loading.value = true
    error.value = null
    try {
      // Costruisci la query string dai filtri non vuoti
      const query = Object.entries(filters)
        .filter(([_, v]) => v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&')
      
      // Usa useAsyncData per il caching e la gestione dello stato
      const { data: fetchedData, error: fetchError } = await useAsyncData(
        `products-${query}`, // Chiave unica basata sui filtri
        () => $fetch(`/api/products?${query}`),
        {
          server: false, // Esegui solo lato client
          immediate: true, // Esegui immediatamente
          watch: false // Non osservare automaticamente
        }
      )
      
      if (fetchError.value) {
        throw fetchError.value
      }
      
      // Aggiorna i prodotti con i dati ricevuti
      if (fetchedData.value) {
        products.value = fetchedData.value
        console.log('Prodotti caricati:', products.value.length)
      } else {
        products.value = []
        console.log('Nessun prodotto trovato')
      }
    } catch (err) {
      console.error('Errore nel caricamento dei prodotti:', err)
      error.value = err
      products.value = []
    } finally {
      loading.value = false
    }
  }

  return { products, fetchProducts, loading, error }
}