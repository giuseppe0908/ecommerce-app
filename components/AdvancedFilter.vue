<template>
  <div class="filter-container p-4 border rounded-lg bg-white shadow-sm">
    <h2 class="text-xl font-bold mb-4">Filtri</h2>
    
    <!-- Filtro per prezzo -->
    <div class="price-filter mb-6">
      <h3 class="font-semibold mb-2">Prezzo</h3>
      <div class="flex items-center space-x-2">
        <input 
          type="number" 
          v-model="filters.priceMin" 
          placeholder="Min" 
          class="w-1/2 p-2 border rounded"
          min="0"
        />
        <span>-</span>
        <input 
          type="number" 
          v-model="filters.priceMax" 
          placeholder="Max" 
          class="w-1/2 p-2 border rounded"
          min="0"
        />
      </div>
    </div>
    
    <!-- Filtro per categoria -->
    <div class="category-filter mb-6">
      <h3 class="font-semibold mb-2">Categoria</h3>
      <div class="space-y-2">
        <div v-for="category in categories" :key="category.id" class="flex items-center">
          <input 
            type="checkbox" 
            :id="`category-${category.id}`" 
            :value="category.id" 
            v-model="filters.categories"
            class="mr-2"
          />
          <label :for="`category-${category.id}`">{{ category.name }}</label>
        </div>
      </div>
    </div>
    
    <!-- Filtro per brand -->
    <div class="brand-filter mb-6">
      <h3 class="font-semibold mb-2">Brand</h3>
      <div class="space-y-2">
        <div v-for="brand in brands" :key="brand.id" class="flex items-center">
          <input 
            type="checkbox" 
            :id="`brand-${brand.id}`" 
            :value="brand.id" 
            v-model="filters.brands"
            class="mr-2"
          />
          <label :for="`brand-${brand.id}`">{{ brand.name }}</label>
        </div>
      </div>
    </div>
    
    <!-- Filtro per disponibilità -->
    <div class="availability-filter mb-6">
      <h3 class="font-semibold mb-2">Disponibilità</h3>
      <div class="flex items-center">
        <input 
          type="checkbox" 
          id="in-stock" 
          v-model="filters.inStock"
          class="mr-2"
        />
        <label for="in-stock">Solo prodotti disponibili</label>
      </div>
    </div>
    
    <!-- Filtro per promozioni -->
    <div class="promo-filter mb-6">
      <h3 class="font-semibold mb-2">Promozioni</h3>
      <div class="flex items-center">
        <input 
          type="checkbox" 
          id="on-sale" 
          v-model="filters.onSale"
          class="mr-2"
        />
        <label for="on-sale">Solo prodotti in promozione</label>
      </div>
    </div>
    
    <!-- Pulsanti -->
    <div class="filter-actions flex space-x-2">
      <button 
        @click="applyFilters" 
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex-grow"
      >
        Applica filtri
      </button>
      <button 
        @click="resetFilters" 
        class="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
      >
        Reset
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const props = defineProps({
  initialFilters: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['filter-change']);

const router = useRouter();
const route = useRoute();

const categories = ref([]);
const brands = ref([]);

const filters = reactive({
  priceMin: null,
  priceMax: null,
  categories: [],
  brands: [],
  inStock: false,
  onSale: false,
  ...props.initialFilters
});

// Carica le categorie e i brand all'avvio
onMounted(async () => {
  await Promise.all([
    fetchCategories(),
    fetchBrands()
  ]);
  
  // Inizializza i filtri dai parametri URL se presenti
  initializeFiltersFromUrl();
});

async function fetchCategories() {
  try {
    const response = await fetch('/api/categories');
    if (response.ok) {
      categories.value = await response.json();
    }
  } catch (error) {
    console.error('Errore nel caricamento delle categorie:', error);
  }
}

async function fetchBrands() {
  try {
    const response = await fetch('/api/brands');
    if (response.ok) {
      brands.value = await response.json();
    }
  } catch (error) {
    console.error('Errore nel caricamento dei brand:', error);
  }
}

function initializeFiltersFromUrl() {
  const query = route.query;
  
  if (query.priceMin) filters.priceMin = Number(query.priceMin);
  if (query.priceMax) filters.priceMax = Number(query.priceMax);
  if (query.categories) filters.categories = Array.isArray(query.categories) 
    ? query.categories.map(Number) 
    : [Number(query.categories)];
  if (query.brands) filters.brands = Array.isArray(query.brands) 
    ? query.brands.map(Number) 
    : [Number(query.brands)];
  if (query.inStock) filters.inStock = query.inStock === 'true';
  if (query.onSale) filters.onSale = query.onSale === 'true';
}

function applyFilters() {
  // Costruisci l'oggetto query per l'URL
  const query = {};
  
  if (filters.priceMin) query.priceMin = filters.priceMin;
  if (filters.priceMax) query.priceMax = filters.priceMax;
  if (filters.categories.length) query.categories = filters.categories;
  if (filters.brands.length) query.brands = filters.brands;
  if (filters.inStock) query.inStock = filters.inStock;
  if (filters.onSale) query.onSale = filters.onSale;
  
  // Aggiorna l'URL con i parametri di filtro
  router.push({ query });
  
  // Emetti l'evento con i filtri applicati
  emit('filter-change', { ...filters });
}

function resetFilters() {
  // Resetta tutti i filtri
  filters.priceMin = null;
  filters.priceMax = null;
  filters.categories = [];
  filters.brands = [];
  filters.inStock = false;
  filters.onSale = false;
  
  // Rimuovi i parametri di query dall'URL
  router.push({ query: {} });
  
  // Emetti l'evento con i filtri resettati
  emit('filter-change', { ...filters });
}

// Osserva i cambiamenti nella route per aggiornare i filtri
watch(() => route.query, (newQuery) => {
  if (Object.keys(newQuery).length === 0) {
    // Se non ci sono parametri di query, resetta i filtri
    resetFilters();
  }
}, { deep: true });
</script>