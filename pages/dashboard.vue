<template>
  <div class="dashboard-container max-w-7xl mx-auto px-4 py-8">
    <div v-if="user">
      <DashboardHeader
        :user="user"
        :progress="progress"
        :progressBarClass="progressBarClass"
        :formattedTime="formatTime(timeRemaining)"
      />

      <AdminOverview v-if="user.role === 'ADMIN'" />

      <div v-else class="user-dashboard grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <UserProfile :userData="user" />
          <OrderHistory :userId="user.id" :userData="user" />
        </div>

        <div class="space-y-6">
          <WishlistManagement />
          <ProductRecommendations :userId="user.id" />
        </div>
      </div>

      <div class="mt-8 text-center">
        <button
          @click="handleLogout"
          class="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>

    <div v-else class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { navigateTo } from 'nuxt/app'
import { useAuthStore } from '~/stores/authStore'
import { useSessionTimer } from '~/composables/useSessionTimer'

import DashboardHeader from '~/components/Dashboard/DashboardHeader.vue'
import AdminOverview from '~/components/Dashboard/AdminOverview.vue'
import UserProfile from '~/components/Dashboard/UserProfile.vue'
import OrderHistory from '~/components/Dashboard/OrderHistory.vue'
import WishlistManagement from '~/components/Dashboard/WishlistManagement.vue'
import ProductRecommendations from '~/components/Dashboard/ProductRecommendations.vue'

definePageMeta({
  middleware: ['auth'],
})

const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => {
  if (!authStore.user) return null

  return {
    id: authStore.user.id,
    name: authStore.user.name || authStore.user.email,
    role: authStore.user.role,
    email: authStore.user.email,
    address: authStore.user.address || '',
    number: authStore.user.number || '',
    surname: authStore.user.surname || '',
  }
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const {
  timeRemaining,
  progress,
  progressBarClass,
  formatTime,
  startTimer,
  stopTimer,
  attachActivityListeners,
  detachActivityListeners,
} = useSessionTimer({
  durationMs: 5 * 60 * 1000,
  onExpire: handleLogout,
})

onMounted(async () => {
  const authenticated = await authStore.initialize()
  if (!authenticated) {
    navigateTo('/login')
    return
  }

  startTimer()
  attachActivityListeners()
})

onUnmounted(() => {
  stopTimer()
  detachActivityListeners()
})
</script>

<style scoped>
.dashboard-container {
  min-height: calc(100vh - 80px);
}

.session-timer {
  transition: all 0.3s ease;
}

.tabs button {
  background-color: #f0f0f0;
  border: none;
  border-radius: 4px;
}

.tabs button.active {
  background-color: #007bff;
  color: white;
}

@media (max-width: 768px) {
  .dashboard-header h1 {
    font-size: 1.75rem;
  }
}
</style>
