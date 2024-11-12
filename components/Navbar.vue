<script setup>
import { ref } from 'vue'
  import { useProductStore } from '@/stores/productStore'

  
  const productStore = useProductStore()
// Stato del menu mobile
const isOpen = ref(false)
// Link di navigazione
const links = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Login', href: '/login' },
  { label: 'Contact', href: '/' },
]
</script>

<template>
  <nav class="bg-white border-b border-gray-200 w-[95%]">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        
        <!-- Mobile menu button -->
        <div class="md:hidden flex items-center">
          <div
            @click="isOpen = !isOpen"
            type="button"
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-800 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            aria-controls="mobile-menu"
            aria-expanded="false"
          >
            <span class="sr-only">Open main menu</span>
            <svg
              class="h-6 w-6"
              :class="{ 'hidden': isOpen, 'block': !isOpen }"
              :style="{ color: productStore.colorPrimary }"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg
              class="h-6 w-6"
              :class="{ 'block': isOpen, 'hidden': !isOpen }"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        <!-- Logo -->
        <div class="flex-shrink-0">
          <NuxtLink to="/" class="text-xl font-bold text-gray-800">Logo</NuxtLink>
        </div>

        <!-- Links desktop -->
        <div class="hidden md:flex space-x-8">
          <NuxtLink
            v-for="(link, index) in links"
            :key="index"
            :to="link.href"
            class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            {{ link.label }}
          </NuxtLink>
        </div>

        <!-- Icons (User, Heart, Cart) -->
        <div class="md:hidden flex space-x-4 items-center">
          <!-- User Icon -->
          <NuxtLink to="/profile" class="text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 font-extrabold" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.209 0 4-1.791 4-4s-1.791-4-4-4-4 1.791-4 4 1.791 4 4 4zm0 2c-3.86 0-7 3.14-7 7h2c0-2.762 2.238-5 5-5s5 2.238 5 5h2c0-3.86-3.14-7-7-7z"/>
            </svg>
          </NuxtLink>
          <!-- Heart Icon -->
          <NuxtLink to="/favorites" class="text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-black border-2 border-black rounded-full p-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </NuxtLink>
          <!-- Cart Icon -->
          <NuxtLink to="/cart" class="text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-black border-2 border-black rounded-full p-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M16 13a4 4 0 11-8 0m8 0H7" />
            </svg>
          </NuxtLink>
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
  </nav>
</template>

<style scoped>
/* Personalizza qui eventuali stili aggiuntivi */
</style>
