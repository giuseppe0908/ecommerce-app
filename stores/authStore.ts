import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { navigateTo } from 'nuxt/app'
import { jwtDecode } from 'jwt-decode'
import { useWishlistStore } from './wishlistStore'

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
    isAuthenticated: (state) => !!state.token && !!state.user,
    // Add token expiration checker
    isTokenExpired: (state) => {
      if (!state.token) return true
      
      try {
        const decoded = jwtDecode(state.token)
        const currentTime = Date.now() / 1000
        
        // Check if token is expired
        return decoded.exp < currentTime
      } catch (error) {
        console.error('Error decoding token:', error)
        return true
      }
    },
    // Get token expiry time
    tokenExpiryTime: (state) => {
      if (!state.token) return null
      
      try {
        const decoded = jwtDecode(state.token)
        return decoded.exp
      } catch (error) {
        console.error('Error getting token expiry:', error)
        return null
      }
    }
  },

  actions: {

    async loginWithGitHub() {
      try {
        if (process.client) {
          window.location.href =  '/api/auth/github'
        }
      } catch (error: any) {
        this.handleAuthError(error)
      }
    },
    handleAuthError(error: any) {
      console.error('Auth error:', error)
      this.error = error.message || 'Authentication error'
      this.logout()
      navigateTo('/login?error=auth_failed')
    },

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
      
      // Clear wishlist data when user logs out
      const wishlistStore = useWishlistStore()
      if (wishlistStore) {
        wishlistStore.wishlist = []
      }
    },

    // Add refresh token method
    async refreshToken() {
      if (!this.token) return false
      
      try {
        const response = await fetch('/api/refresh-token', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to refresh token')
        }

        const data = await response.json()
        
        this.token = data.token
        // Update localStorage
        localStorage.setItem('authToken', data.token)
        
        return true
      } catch (error) {
        console.error('Error refreshing token:', error)
        this.logout()
        return false
      }
    },

    // Metodo per pulire i token scaduti nel database
    async cleanupExpiredTokens() {
      try {
        const response = await fetch('/api/cleanup-tokens')
        const data = await response.json()
        console.log('Token cleanup result:', data)
        return data.success
      } catch (error) {
        console.error('Error cleaning up tokens:', error)
        return false
      }
    },

    // Enhanced checkAuth to verify token expiration
    async checkAuth() {
      if (!this.token) return false
      
      // Check if token is expired
      if (this.isTokenExpired) {
        console.log('Token is expired, attempting to refresh...')
        const refreshed = await this.refreshToken()
        if (!refreshed) {
          // Pulisci i token scaduti nel database
          await this.cleanupExpiredTokens()
          this.logout()
          return false
        }
      }
        
      try {
        const response = await fetch('/api/verify/token', {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        })

        if (!response.ok) {
          throw new Error('Token non valido')
        }
        const data = await response.json()
        if(!this.user){
          this.user = data.user 
        }
        console.log("puoi accededere");
        return true
      } catch (error) {
        // Pulisci i token scaduti nel database
        await this.cleanupExpiredTokens()
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
