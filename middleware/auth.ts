import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { useAuthStore } from '~/stores/authStore'

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  // Inizializza lo store se necessario
  if (!authStore.token && process.client) {
    authStore.initialize()
  }

  // Debug migliorato
  console.log('Debug Auth Middleware:', {
    path: to.path,
    token: authStore.token ? 'presente' : 'assente',
    userRole: authStore.user?.role || 'nessun ruolo',
    isAuthenticated: authStore.isAuthenticated
  })

  const requiresAuth = ['/dashboard', '/profile']
  const publicRoutes = ['/', '/login', '/register']
  
  // Verifica se è una rotta admin
  const isAdminRoute = (path: string) => path.startsWith('/admin')

  // Protezione rotte admin
  if (isAdminRoute(to.path)) {
    if (!authStore.token) {
      console.log('Accesso negato: token mancante')
      return navigateTo('/login')
    }
    
    if (authStore.user?.role !== 'ADMIN') {
      console.log('Accesso negato: ruolo non autorizzato')
      return navigateTo('/dashboard')
    }
  }

  // Protezione rotte autenticate
  if (requiresAuth.includes(to.path) && !authStore.token) {
    console.log('Accesso negato: autenticazione richiesta')
    return navigateTo('/login')
  }

  // Redirect da rotte pubbliche se autenticato
  if (publicRoutes.includes(to.path) && authStore.token) {
    console.log('Reindirizzamento: utente già autenticato')
    return navigateTo('/dashboard')
  }
})