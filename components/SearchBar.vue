<template>
    <div class="w-full flex justify-center "
      :style="{paddingLeft: props.pl}">
      <div class="relative flex items-center" ref="searchContainer">
        <!-- Icona SVG a Sinistra -->
      <svg 
        @click="handleSearch"
        class="absolute left-3  transform -translate-y-1/2 h-5 w-5 text-gray-400 cursor-pointer"
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
        class="w-[210px] h-[20px] pl-10 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 border rounded-3xl md:w-[377px]"
        placeholder="Ricerca..."
        v-model="search"
        @input="handleInput"
        :style="{ backgroundColor: productStore.colorPrimary }"
      />
      <!-- Risultati della ricerca -->
      <div v-if="showResults && hasResults" class="absolute w-full mt-1 bg-white rounded-md shadow-lg z-50" style="top: 100%">
        <!-- Prodotti -->
        <div v-if="searchStore.searchResults.products.length > 0" class="py-2">
          <div class="px-4 py-1 text-xs text-gray-500">Prodotti</div>
          <div v-for="product in searchStore.searchResults.products" :key="product.id"
               class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
               @click="navigateToProduct(product)">
            <div class="flex items-center">
              <img :src="product.photo" class="w-8 h-8 rounded-md mr-2" />
              <div>
                <div class="text-sm">{{ product.name }}</div>
                <div class="text-xs text-gray-500">€{{ product.price }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Brand -->
        <div v-if="searchStore.searchResults.brands.length > 0" class="py-2 border-t">
          <div class="px-4 py-1 text-xs text-gray-500">Brand</div>
          <div v-for="brand in searchStore.searchResults.brands" :key="brand.id"
               class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
               @click="navigateToBrand(brand)">
            {{ brand.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  import { useProductStore } from '@/stores/productStore'
  import { useSearchStore } from '@/stores/searchStore'
  import { useRouter } from 'vue-router'
  import { onClickOutside } from '@vueuse/core'  // Aggiungi questa importaziones
  
  const props = defineProps(['pl'])
  console.log(props)
  const router = useRouter()
  const productStore = useProductStore()
  const searchStore = useSearchStore()
  const search = ref('')
  const showResults = ref(false)
  const searchContainer = ref(null)  // Aggiungi questo ref 

    // Computed properties per gestire meglio lo stato
  const searchResults = computed(() => searchStore.searchResults)
  const hasResults = computed(() => {
    return (searchResults.value.products?.length > 0 || 
            searchResults.value.brands?.length > 0)
  })
  let debounceTimeout
  
  const handleInput = () => {
    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => {
      if (search.value) {
        searchStore.searchItems(search.value)
        showResults.value = true
      } else {
        showResults.value = false
      }
    }, 300)
  }
  
  const handleSearch = () => {
    if (search.value) {
      searchStore.searchItems(search.value)
      showResults.value = true
    }

  }
  
  const navigateToProduct = (product) => {
    router.push(`/product/${product.id}`)
    showResults.value = false
    search.value = ''
  }
  
  const navigateToBrand = (brand) => {
    router.push(`product?brand=${brand.name}`)
    showResults.value = false
    search.value = ''
  }
  
  // Chiudi i risultati quando si clicca fuori
  onClickOutside(searchContainer, () => {
    showResults.value = false
  })
  </script>
  
  <style scoped>
  .search-results {
    max-height: 400px;
    overflow-y: auto;
  }
  </style>
  