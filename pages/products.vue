<template>
  <div class="w-[95%] mx-auto">
    <ToggleMenu
      :open="open"
      :categories="categories"
      :colorPrimary="colorPrimary"
      :buttonHeight="buttonHeight"
      @toggleMenu="toggleMenu"
      @search="onSearch"
    />
    <!-- <NavBar
      :categories="categories"
      :colorPrimary="colorPrimary"
      @selectCategory="setCategory"
    /> -->
    <ActiveFilters
      :activeFilters="activeFilters"
      @removeFilter="removeFilter"
    />
    <FilterSidebar
      :filtri="filtri"
      :colorPrimary="colorPrimary"
      :priceRange="priceRange"
      :minPrice="minPrice"
      :maxPrice="maxPrice"
      :isPriceFilterSelected="isPriceFilterSelected"
      @selectFilter="selectFilter"
      @updatePriceFilter="updatePriceFilter"
      @resetPriceFilter="resetPriceFilter"
      @applyPriceFilter="applyPriceFilter"
    />
    <ProductGrid
      :products="products"
      :colorPrimary="colorPrimary"
    />
    <template v-if="products && products.length === 0">
      <div style="text-align:center; color: #888; margin-top: 2rem;">
        Nessun prodotto trovato.
      </div>
    </template>
  </div>
</template>
<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useFilters } from '@/composables/useFilters'
import { useFetchProducts } from '@/composables/useFetchProducts'
import { useFetch } from '#app'
import ToggleMenu from '~/components/Product/ToggleMenu.vue'
// import NavBar from '@/components/NavBar.vue'
import ActiveFilters from '~/components/Product/ActiveFilters.vue'
import FilterSidebar from '~/components/Product/FilterSidebar.vue'
import ProductGrid from '~/components/Product/ProductGrid.vue'

// Stato del menu aperto/chiuso
const open = ref(false)
const toggleMenu = () => { open.value = !open.value }

// Gestione filtri & products
const { filters, activeFilters, updateFilter, removeFilter, syncFromRoute } = useFilters()
const { products, fetchProducts, loading, error } = useFetchProducts(filters)

// Caricamento dati per categorie e filtri
const categories = ref([])
const colorPrimary = '#5D758B'
const buttonHeight = '40px'

// Caricamento categorie
const { data: categoriesData } = await useFetch('/api/categories')
if (categoriesData.value) {
  categories.value = categoriesData.value
}

// Configurazione filtri
const filtri = ref([
  { name: "Colore", key: "color", value: "", selected: false },
  { name: "Taglia", key: "size", value: "", selected: false },
  { name: "Prezzo", key: "price", value: "", selected: false }
])

// Configurazione filtro prezzo
const priceRange = ref({ min: 0, max: 100 })
const minPrice = 0
const maxPrice = 100
const isPriceFilterSelected = ref(false)

// Funzioni per gestire i filtri
const setCategory = (category) => {
  if (category && category.name) {
    updateFilter('category', category.name)
  }
}

const onSearch = (query) => updateFilter('search', query)

const selectFilter = (filter) => {
  if (filter && filter.key) {
    updateFilter(filter.key, filter.value)
    if (filter.key === 'price') {
      isPriceFilterSelected.value = true
    }
  }
}

const updatePriceFilter = () => {
  // Validazione range prezzi
  if (priceRange.value.min > priceRange.value.max) {
    priceRange.value.min = priceRange.value.max
  }
}

const resetPriceFilter = () => {
  priceRange.value.min = minPrice
  priceRange.value.max = maxPrice
  updateFilter('priceMin', '')
  updateFilter('priceMax', '')
}

const applyPriceFilter = () => {
  updateFilter('priceMin', priceRange.value.min.toString())
  updateFilter('priceMax', priceRange.value.max.toString())
}

// Watch su cambiamenti
watch(filters, fetchProducts, { deep: true })

// Sincronizza query params su mount
onMounted(() => { 
  syncFromRoute()
  fetchProducts() 
})
</script>