import { defineStore } from 'pinia'

export const useSearchStore = defineStore('search', {
  state: () => ({
    searchResults: {
      products: [],
      brands: []
    },
    isLoading: false,
    error: null
  }),

  actions: {
    async searchItems(query) {
      if (!query || query.length < 2) {
        this.searchResults = { products: [], brands: [] }
        return
      }

      this.isLoading = true
      try {
        const { data } = await useFetch('/api/search', {
          query: {
            q: query
          }
        })
        if (data.value) {
          this.searchResults = data.value
        }
      } catch (error) {
        this.error = error
        console.error('Errore nella ricerca:', error)
      } finally {
        this.isLoading = false
      }
    }
  }
})
