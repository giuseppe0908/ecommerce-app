import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
export const useAuthStore = defineStore('authStore', {
  state: () => ({
    user: null as null | { id: string; email: string; role: string },
    token: null as string | null,
    isLoading: false,
    error: null as string | null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'ADMIN',
    isAuthenticated: (state) => !!state.token && !!state.user
  },

  actions: {

    async login(email: string, password: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })

        const data = await response.json()
        
        if (!response.ok) throw new Error(data.message || 'Login failed')
        
        this.token = data.token
        this.user = data.user
        
        // Salva nello storage locale
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        return data
      } catch (error: any) {
        this.error = error.message
        this.logout()
        throw error
      } finally {
        this.isLoading = false
      }
    },

    logout() {
      this.token = null
      this.user = null
      this.error = null
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
    },

    async checkAuth() {
      //if (!this.token) return false
// QUI ABBIAMO IL TOKEN CORRETTO ERROR IN VERIFYTOKEN 500
        
      try {
        const response = await fetch('/api/verify/token', {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        })

        if (!response.ok) {
          throw new Error('Token non valido')
        }
        console.log("puoi accededere");
        return true
        
        
      } catch (error) {
        this.logout()
        return false
      }
    },

    initialize() {
      if (process.client) {
        const token = localStorage.getItem('authToken')
        const user = localStorage.getItem('user')
        
        if (token && user) {
          this.token = token
          this.user = JSON.parse(user)
          // Verifica il token all'inizializzazione
          this.checkAuth()
        }
      }
    },

    async register(email: string, password: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })

        const data = await response.json()

        if (!response.ok) throw new Error(data.message || 'Registrazione fallita')

        // Effettua il login automatico dopo la registrazione
        return this.login(email, password)
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    }
  }
})

// function navigateTo(arg0: string) {
//     throw new Error('Function not implemented.');
// }
