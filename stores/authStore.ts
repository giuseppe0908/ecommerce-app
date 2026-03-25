import { defineStore } from 'pinia'
import { navigateTo, useRequestFetch } from 'nuxt/app'
import { useWishlistStore } from './wishlistStore'

type AuthUser = {
  id: string | number
  email: string
  role: string
  name?: string | null
  surname?: string | null
  address?: string | null
  number?: string | null
}
type MeResponse = {
  user?: unknown
}

let authCheckPromise: Promise<boolean> | null = null

function normalizeUser(user: any): AuthUser | null {
  if (!user || typeof user !== 'object') return null

  const id = user.id
  const email = typeof user.email === 'string' ? user.email : ''
  const role = typeof user.role === 'string' ? user.role : ''

  if ((typeof id !== 'string' && typeof id !== 'number') || !email || !role) {
    return null
  }

  return {
    id,
    email,
    role,
    name: typeof user.name === 'string' ? user.name : null,
    surname: typeof user.surname === 'string' ? user.surname : null,
    address: typeof user.address === 'string' ? user.address : null,
    number: typeof user.number === 'string' ? user.number : null,
  }
}

function createRequestFetch() {
  return process.server ? useRequestFetch() : $fetch
}

export const useAuthStore = defineStore('authStore', {
  state: () => ({
    user: null as AuthUser | null,
    isLoading: false,
    error: null as string | null,
    isInitialized: false,
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'ADMIN',
    isAuthenticated: (state) => !!state.user,
  },

  actions: {
    setAuthenticatedUser(user: unknown) {
      const normalizedUser = normalizeUser(user)
      if (!normalizedUser) {
        throw new Error('Utente sessione non valido')
      }

      this.user = normalizedUser
      this.error = null
      this.isInitialized = true
    },

    clearSessionState() {
      this.user = null
      this.error = null
      this.isInitialized = true
    },

    async fetchCurrentUser() {
      const requestFetch = createRequestFetch()
      const payload = await requestFetch<MeResponse | AuthUser>('/api/auth/me', {
        method: 'GET',
      })
      const sessionPayload =
        payload && typeof payload === 'object' && 'user' in payload ? payload.user : payload
      const normalizedUser = normalizeUser(sessionPayload)
      if (!normalizedUser) {
        throw new Error('Utente non valido in risposta sessione')
      }
      return normalizedUser
    },

    async completeOAuthCallback() {
      return this.initialize(true)
    },

    async initialize(force = false) {
      if (this.isInitialized && !force) {
        return this.isAuthenticated
      }

      this.isLoading = true
      try {
        const currentUser = await this.fetchCurrentUser()
        this.user = currentUser
        this.error = null
        this.isInitialized = true
        return true
      } catch {
        this.clearSessionState()
        return false
      } finally {
        this.isLoading = false
      }
    },

    async loginWithGitHub() {
      try {
        if (process.client) {
          window.location.href = '/api/auth/github'
        }
      } catch (error: any) {
        this.handleAuthError(error)
      }
    },

    handleAuthError(error: any) {
      console.error('Auth error:', error)
      this.error = error?.message || 'Authentication error'
      this.clearSessionState()

      if (process.client) {
        navigateTo('/login?error=auth_failed')
      }
    },

    async login(email: string, password: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.message || 'Login failed')
        }

        this.setAuthenticatedUser(data.user)
        return data
      } catch (error: any) {
        this.error = error?.message || 'Errore durante il login'
        this.clearSessionState()
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      try {
        await $fetch('/api/auth/logout', { method: 'POST' })
      } catch (error) {
        console.error('Errore logout:', error)
      } finally {
        this.clearSessionState()

        const wishlistStore = useWishlistStore()
        if (wishlistStore) {
          wishlistStore.wishlist = []
        }
      }
    },

    async refreshToken() {
      try {
        const response = await fetch('/api/refresh-token', {
          method: 'POST',
        })

        if (!response.ok) {
          return false
        }

        const data = await response.json()
        if (data?.user) {
          this.setAuthenticatedUser(data.user)
          return true
        }

        return this.initialize(true)
      } catch (error) {
        console.error('Error refreshing token:', error)
        return false
      }
    },

    async performAuthCheck() {
      try {
        const verifiedUser = await this.fetchCurrentUser()
        this.user = verifiedUser
        this.error = null
        this.isInitialized = true
        return true
      } catch (error) {
        this.clearSessionState()
        return false
      }
    },

    async checkAuth() {
      if (authCheckPromise) {
        return authCheckPromise
      }

      authCheckPromise = this.performAuthCheck()

      try {
        return await authCheckPromise
      } finally {
        authCheckPromise = null
      }
    },

    async register(email: string, password: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.message || 'Registrazione fallita')
        }

        return this.login(email, password)
      } catch (error: any) {
        this.error = error?.message || 'Registrazione fallita'
        throw error
      } finally {
        this.isLoading = false
      }
    },
  },
})
