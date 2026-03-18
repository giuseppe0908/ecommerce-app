import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { useAuthStore } from '~/stores/authStore'

const GUEST_ONLY_ROUTES = ['/login', '/register']
const PROTECTED_PREFIXES = ['/dashboard', '/profile', '/admin']
const ADMIN_PREFIX = '/admin'

function isAdminRoute(path: string) {
  return path === ADMIN_PREFIX || path.startsWith(`${ADMIN_PREFIX}/`)
}

function isProtectedRoute(path: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  )
}

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  const protectedRoute = isProtectedRoute(to.path)
  const guestOnlyRoute = GUEST_ONLY_ROUTES.includes(to.path)

  if (!authStore.isInitialized) {
    await authStore.initialize()
  }

  if (!protectedRoute) {
    if (guestOnlyRoute && authStore.isAuthenticated) {
      return navigateTo('/dashboard')
    }
    return
  }

  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  if (isAdminRoute(to.path) && authStore.user?.role !== 'ADMIN') {
    return navigateTo('/dashboard')
  }
})
