<template>
  <div class="catalog-container w-[95%] mx-auto my-8">
    <h1 class="text-3xl font-bold mb-6">Catalogo Prodotti</h1>
    
    <div class="flex flex-col md:flex-row gap-6">
      <!-- Sidebar con filtri -->
      <div class="w-full md:w-1/4">
        <AdvancedFilter @filter-change="handleFilterChange" />
      </div>
      
      <!-- Griglia prodotti -->
      <div class="w-full md:w-3/4">
        <!-- Controlli superiori -->
        <div class="controls flex justify-between items-center mb-4">
          <div class="results-count">
            {{ pagination.total }} prodotti trovati
          </div>
          
          <div class="sorting flex items-center">
            <label for="sort-select" class="mr-2">Ordina per:</label>
            <select 
              id="sort-select" 
              v-model="sortOption" 
              @change="handleSortChange"
              class="p-2 border rounded"
            >
              <option value="newest">Più recenti</option>
              <option value="price-asc">Prezzo: dal più basso</option>
              <option value="price-desc">Prezzo: dal più alto</option>
              <option value="name-asc">Nome: A-Z</option>
              <option value="name-desc">Nome: Z-A</option>
              <option value="rating-desc">Valutazione più alta</option>
            </select>
          </div>
        </div>
        
        <!-- Griglia prodotti -->
        <div v-if="isLoading" class="loading-indicator flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        
        <div v-else-if="products.length === 0" class="no-results text-center py-12">
          <p class="text-xl text-gray-500">Nessun prodotto trovato con i filtri selezionati.</p>
          <button 
            @click="resetFilters" 
            class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Resetta filtri
          </button>
        </div>
        
        <div v-else class="products-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card 
            v-for="product in products" 
            :key="product.id"
            :id="product.id"
            :name="product.name"
            :img="product.photo"
            :promo="product.promo"
            :plus="product.plus"
            :price="product.price"
            :category="product.category"
            :brand="product.brand"
            :colorPrimary="colorPrimary"
            :colorSecondary="colorSecondary"
            :codeItem="product.codeItem"
            :onCardClick="() => navigateToProduct(product.id)"
          />
        </div>
        
        <!-- Paginazione -->
        <div v-if="pagination.pages > 1" class="pagination flex justify-center mt-8">
          <button 
            v-for="page in pagination.pages" 
            :key="page"
            @click="changePage(page)"
            class="mx-1 px-4 py-2 rounded"
            :class="page === pagination.page ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'"
          >
            {{ page }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Card from '~/components/Card.vue';
import AdvancedFilter from '~/components/AdvancedFilter.vue';

const router = useRouter();
const route = useRoute();

const products = ref([]);
const isLoading = ref(false);
const error = ref(null);

const colorPrimary = "#5D758B";
const colorSecondary = "#00192F";

const pagination = reactive({
  page: 1,
  limit: 12,
  total: 0,
  pages: 0
});

const sortOption = ref('newest');
const activeFilters = reactive({});

// Carica i prodotti all'avvio e quando cambiano i parametri di query
onMounted(() => {
  // Inizializza l'opzione di ordinamento dalla query se presente
  if (route.query.sortBy) {
    const sortBy = route.query.sortBy;
    const sortOrder = route.query.sortOrder || 'asc';
    
    if (sortBy === 'price' && sortOrder === 'asc') sortOption.value = 'price-asc';
    else if (sortBy === 'price' && sortOrder === 'desc') sortOption.value = 'price-desc';
    else if (sortBy === 'name' && sortOrder === 'asc') sortOption.value = 'name-asc';
    else if (sortBy === 'name' && sortOrder === 'desc') sortOption.value = 'name-desc';
    else if (sortBy === 'rating' && sortOrder === 'desc') sortOption.value = 'rating-desc';
    else sortOption.value = 'newest';
  }
  
  fetchProducts();
});

// Osserva i cambiamenti nella route per ricaricare i prodotti
watch(() => route.query, () => {
  fetchProducts();
}, { deep: true });

async function fetchProducts() {
  isLoading.value = true;
  error.value = null;
  
  try {
    // Costruisci l'URL con i parametri di query
    const queryParams = new URLSearchParams();
    
    // Aggiungi i parametri dalla route
    Object.entries(route.query).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => queryParams.append(key, v));
      } else if (value) {
        queryParams.append(key, value);
      }
    });
    
    // Assicurati che la paginazione sia inclusa
    if (!queryParams.has('page')) queryParams.append('page', pagination.page.toString());
    if (!queryParams.has('limit')) queryParams.append('limit', pagination.limit.toString());
    
    const response = await fetch(`/api/products/search?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error('Errore nel caricamento dei prodotti');
    }
    
    const data = await response.json();
    products.value = data.products;
    
    // Aggiorna la paginazione
    pagination.total = data.pagination.total;
    pagination.page = data.pagination.page;
    pagination.pages = data.pagination.pages;
  } catch (err) {
    console.error('Errore:', err);
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
}

function handleFilterChange(filters) {
  // Aggiorna i filtri attivi
  Object.assign(activeFilters, filters);
  
  // Resetta la paginazione quando cambiano i filtri
  if (pagination.page !== 1) {
    changePage(1);
  } else {
    // Se siamo già alla prima pagina, ricarica i prodotti
    fetchProducts();
  }
}

function handleSortChange() {
  // Converti l'opzione di ordinamento in parametri di query
  let sortBy, sortOrder;
  
  switch (sortOption.value) {
    case 'price-asc':
      sortBy = 'price';
      sortOrder = 'asc';
      break;
    case 'price-desc':
      sortBy = 'price';
      sortOrder = 'desc';
      break;
    case 'name-asc':
      sortBy = 'name';
      sortOrder = 'asc';
      break;
    case 'name-desc':
      sortBy = 'name';
      sortOrder = 'desc';
      break;
    case 'rating-desc':
      sortBy = 'rating';
      sortOrder = 'desc';
      break;
    default:
      sortBy = 'id';
      sortOrder = 'desc'; // Più recenti
  }
  
  // Aggiorna la query con i parametri di ordinamento
  router.push({
    query: {
      ...route.query,
      sortBy,
      sortOrder
    }
  });
}

function changePage(page) {
  // Aggiorna la query con il nuovo numero di pagina
  router.push({
    query: {
      ...route.query,
      page
    }
  });
}

function resetFilters() {
  // Rimuovi tutti i parametri di filtro dalla query
  const { page, limit, sortBy, sortOrder } = route.query;
  router.push({
    query: {
      ...(page && { page }),
      ...(limit && { limit }),
      ...(sortBy && { sortBy }),
      ...(sortOrder && { sortOrder })
    }
  });
}

function navigateToProduct(productId) {
  router.push(`/product/${productId}`);
}
</script>