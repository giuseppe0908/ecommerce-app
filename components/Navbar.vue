<script setup>
import { ref } from 'vue'
import { useProductStore } from '@/stores/productStore'
import SearchBar from './SearchBar.vue'
import { useCartStore } from '@/stores/cartStore';

const cartStore = useCartStore();  
const productStore = useProductStore()
// Stato del menu mobile
const isOpen = ref(false)
const searchBar = ref(false)

// Link di navigazione
const links = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Login', href: '/login' },
  { label: 'Contact', href: '/' },
]
const openSearch = () => {
  searchBar.value = !searchBar.value
}
</script>

<template>
  <nav class="bg-white border-b border-gray-200 ">
    <div class="w-[95%] mx-auto  sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        
        <!-- Mobile menu button -->
        <div class="md:hidden flex items-center">
          <div
            @click="isOpen = !isOpen"
            type="button"
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
              aria-hidden="true"
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
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <!-- ICON SEARCH -->
          <svg @click="openSearch" class="h-[25px] w-[25px]"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="search">
            <g>
              <path :style="{fill: productStore.colorPrimary}" d="m20.71 19.29-3.4-3.39A7.92 7.92 0 0 0 19 11a8 8 0 1 0-8 8 7.92 7.92 0 0 0 4.9-1.69l3.39 3.4a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42zM5 11a6 6 0 1 1 6 6 6 6 0 0 1-6-6z"></path>
            </g>
          </svg>        
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
        <div class="md:hidden flex space-x-2 items-center">
          <!-- User Icon -->
          <NuxtLink to="/profile" >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-[22px] w-[30px]" :fill="productStore.colorPrimary" id="user">
              <path  d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2a9.985 9.985 0 0 0-8 4 9.985 9.985 0 0 0 8 4 9.985 9.985 0 0 0 8-4 9.985 9.985 0 0 0-8-4z"></path>
            </svg>

          </NuxtLink>
          <!-- Heart Icon -->
          <NuxtLink to="/favorites" class="text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg"
                class="h-[22px] w-[30px]"
                :style="{ fill: productStore.colorPrimary }"
                viewBox="0 0 1792 1792"
                id="heart">
              <path d="M896 1664q-26 0-44-18l-624-602q-10-8-27.5-26T145 952.5 77 855 23.5 734 0 596q0-220 127-344t351-124q62 0 126.5 21.5t120 58T820 276t76 68q36-36 76-68t95.5-68.5 120-58T1314 128q224 0 351 124t127 344q0 221-229 450l-623 600q-18 18-44 18z"/>
            </svg>

          </NuxtLink>
          <!-- Cart Icon -->
          <!-- <NuxtLink to="/cart" class="text-gray-800">
            <CartIcon :colorPrimary="productStore.colorPrimary"/>
          </NuxtLink> -->
          <div @click="cartStore.flag_cart = !cartStore.flag_cart">
            <CartIcon :colorPrimary="productStore.colorPrimary"/>
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
  </nav>
  <div class="flex justify-center" v-if="searchBar">
    <SearchBar />
  </div>
</template>

<style scoped>
/* Personalizza qui eventuali stili aggiuntivi */
</style>
