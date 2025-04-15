import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { useAuthStore } from '~/stores/authStore'

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Salta il middleware se siamo già sulla pagina di login per evitare loop di reindirizzamento
  if (to.path === '/login') {
    return
  }

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
  
  // Se non autenticato, reindirizza al login
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
  
  // Verifica se il token è scaduto o in scadenza (entro 5 minuti)
  if (authStore.isTokenExpired) {
    console.log('Token scaduto, tentativo di aggiornamento...')
    const refreshed = await authStore.refreshToken()
    
    if (!refreshed) {
      // Aggiornamento fallito, reindirizza al login
      return navigateTo('/login')
    }
  } else if (authStore.tokenExpiryTime) {
    // Verifica prossima scadenza (entro 5 minuti)
    const currentTime = Date.now() / 1000
    const fiveMinutesInSeconds = 5 * 60
    
    if (authStore.tokenExpiryTime - currentTime < fiveMinutesInSeconds) {
      console.log('Token in scadenza imminente, aggiornamento...')
      await authStore.refreshToken()
    }
  }
  
  // Verifica validità token con il backend
  const isValid = await authStore.checkAuth()
  if (!isValid) {
    return navigateTo('/login')
  }

  // Reindirizzamento da rotte pubbliche se autenticato
  if (publicRoutes.includes(to.path) && authStore.token) {
    console.log('Reindirizzamento: utente già autenticato')
    return navigateTo('/dashboard')
  }
})