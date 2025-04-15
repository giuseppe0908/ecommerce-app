<script setup>
import { ref, onMounted } from 'vue'
import { useProductStore } from '@/stores/productStore'
import { useAuthStore } from '@/stores/authStore'
import { useWishlistStore } from '@/stores/wishlistStore'
import SearchBar from './SearchBar.vue'
import { useCartStore } from '@/stores/cartStore'
import { navigateTo } from '#app'

const authStore = useAuthStore()
const cartStore = useCartStore()
const productStore = useProductStore()
const wishlistStore = useWishlistStore()

// Stato
const isOpen = ref(false)
const searchBar = ref(false)
const showAuthMenu = ref(false)
const hasToken = ref(false)
let leaveTimeout = null  // Timeout per ritardare la chiusura del menu

// Link di navigazione
const links = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/' },
]

// Funzioni
const checkToken = () => {
  if (process.client) {
    const token = localStorage.getItem('authToken')
    hasToken.value = !!token
  }
}

const clearLeaveTimeout = () => {
  if (leaveTimeout) {
    clearTimeout(leaveTimeout)
    leaveTimeout = null
  }
}

const handleMouseEnter = () => {
  clearLeaveTimeout()
  checkToken()
  showAuthMenu.value = true
}

const handleMouseLeave = () => {
  // Aggiunge un ritardo di 200ms prima di nascondere il menu
  leaveTimeout = setTimeout(() => {
    showAuthMenu.value = false
  }, 200)
}

const openSearch = () => {
  searchBar.value = !searchBar.value
}

const checkAuth = () => {
  if (process.client) {
    const token = localStorage.getItem('authToken')
    if (!token) {
      navigateTo('/login')
    } else {
      navigateTo('/dashboard')
    }
  }
}

// Inizializzazione
onMounted(() => {
  checkToken()
})
</script>

<template>
  <nav class="bg-white border-b border-gray-200">
    <div class="w-[95%] mx-auto sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Mobile menu button -->
        <div class="md:hidden flex items-center">
          <div
            @click="isOpen = !isOpen"
            class="inline-flex items-center justify-center p-2 mr-2 rounded-md text-gray-800 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            aria-controls="mobile-menu"
            aria-expanded="false"
          >
            <span class="sr-only">Open main menu</span>
            <svg
              class="h-[30px] w-[30px]"
              :class="{ 'hidden': isOpen, 'block': !isOpen }"
              :style="{ color: productStore.colorPrimary }"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg
              class="h-[30px] w-[30px]"
              :class="{ 'block': isOpen, 'hidden': !isOpen }"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <!-- ICON SEARCH -->
          <svg @click="openSearch" class="h-[25px] w-[25px] cursor-pointer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <g>
              <path :style="{fill: productStore.colorPrimary}" d="m20.71 19.29-3.4-3.39A7.92 7.92 0 0 0 19 11a8 8 0 1 0-8 8 7.92 7.92 0 0 0 4.9-1.69l3.39 3.4a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42zM5 11a6 6 0 1 1 6 6 6 6 0 0 1-6-6z" />
            </g>
          </svg>
        </div>

        <!-- Logo -->
        <div class="flex-shrink-0">
          <NuxtLink to="/">
            <img class="md:h-[50px]" src="../assets/img/logoGiudizioUniversale.png" alt="logo">
          </NuxtLink>
        </div>

        <!-- Links desktop -->
        <div class="hidden md:flex space-x-8">
          <SearchBar pl="82px"/>
        </div>

        <!-- Icons (User, Heart, Cart) -->
        <div class="flex space-x-2 items-center">
          <!-- User Icon -->
          <div 
            class="relative"
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg"
              class="h-[22px] w-[30px] mt-[-4px] cursor-pointer"
              :fill="productStore.colorPrimary"
            >
              <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2a9.985 9.985 0 0 0-8 4 9.985 9.985 0 0 0 8 4 9.985 9.985 0 0 0 8-4 9.985 9.985 0 0 0-8-4z" />
            </svg>

            <!-- Dropdown Menu: gestisci anche gli eventi sul menu per mantenerlo visibile -->
            <div 
              v-if="showAuthMenu" 
              class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
              @mouseenter="handleMouseEnter"
              @mouseleave="handleMouseLeave"
            >
              <!-- Menu per utenti non autenticati -->
              <template v-if="!hasToken">
                <NuxtLink 
                  to="/login"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Accedi
                </NuxtLink>
                <NuxtLink 
                  to="/register"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Registrati
                </NuxtLink>
              </template>

              <!-- Menu per utenti autenticati -->
              <template v-else>
                <NuxtLink 
                  to="/dashboard"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Dashboard
                </NuxtLink>
                <NuxtLink 
                  to="/profile"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Profilo
                </NuxtLink>
                <button 
                  @click="authStore.logout(); navigateTo('/login') "
                  class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </template>
            </div>
          </div>

          <!-- Heart Icon (Wishlist) -->
          <WishlistIcon :colorPrimary="productStore.colorPrimary" />

          <!-- Cart Icon -->
          <div 
            @click="cartStore.flag_cart = !cartStore.flag_cart"
            class="cursor-pointer"
          >
            <CartIcon :colorPrimary="productStore.colorPrimary" />
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="isOpen" class="md:hidden" id="mobile-menu">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <NuxtLink
          v-for="(link, index) in links"
          :key="index"
          :to="link.href"
          class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
        >
          {{ link.label }}
        </NuxtLink>
      </div>
    </div>
    <div class="flex justify-center" v-if="searchBar">
      <SearchBar />
    </div>
  </nav>

 
</template>

<style scoped>
.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
              0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>
