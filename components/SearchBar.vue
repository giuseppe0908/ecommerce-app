<template>
    <div class="w-full flex justify-center">
      <div class="relative">
        <!-- Icona SVG a Sinistra -->
      <svg 
        @click="openSearch"
        class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 cursor-pointer"
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24"
        id="search"
        style="fill: white ;"
      >
        <g>
          <path d="m20.71 19.29-3.4-3.39A7.92 7.92 0 0 0 19 11a8 8 0 1 0-8 8 7.92 7.92 0 0 0 4.9-1.69l3.39 3.4a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42zM5 11a6 6 0 1 1 6 6 6 6 0 0 1-6-6z"></path>
        </g>
      </svg>
  
      <!-- Input con spazio per l'icona -->
      <input
        type="text"
        class="w-[210px] h-[20px] pl-10 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 border rounded-2xl md:w-[377px]"
        placeholder="Ricerca..."
        :style="{ backgroundColor: productStore.colorPrimary }"
      />
      </div>  
      
    </div>
  </template>
  
  <script setup>
  import { useProductStore } from '@/stores/productStore'
  
  const productStore = useProductStore()
  
  function openSearch() {
    console.log('Ricerca aperta')
  }
  </script>
  