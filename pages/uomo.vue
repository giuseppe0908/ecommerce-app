<template>
    <div>
      <!-- Barra dei filtri attivi -->
      <div v-if="activeFilters.length" class="flex items-center gap-4 p-4 bg-gray-100 rounded-md mb-6">
        <span class="text-sm font-medium text-gray-700">Filtri attivi:</span>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="(filter, index) in activeFilters"
            :key="index"
            @click="removeFilter(filter.key)"
            class="bg-blue-500 text-white text-xs px-3 py-1 rounded-full hover:bg-blue-600 transition"
          >
            {{ filter.label }} ✕
          </button>
        </div>
      </div>
  
      <!-- Filtri -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <!-- Selezione Categoria -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Categoria:</label>
          <select
            v-model="filters.category"
            @change="fetchProducts"
            class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tutte</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
  
        <!-- Selezione Brand -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Brand:</label>
          <select
            v-model="filters.brand"
            @change="fetchProducts"
            class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tutti</option>
            <option v-for="brand in brands" :key="brand.id" :value="brand.id">{{ brand.name }}</option>
          </select>
        </div>
  
        <!-- Selezione Genere -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Genere:</label>
          <select
            v-model="filters.gender"
            @change="fetchProducts"
            class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <!-- <option value="">Tutti</option>
            <option value="Uomo">Uomo</option>
            <option value="Donna">Donna</option>
            <option value="Bambini">Bambini</option> -->
            <option value="">Tutti</option>
            <option v-for="gender in genders" :key="gender.id" :value="gender.id">{{ gender.name }}</option>
          </select>
        </div>
  
        <!-- Prezzo Minimo -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Prezzo Minimo:</label>
          <input
            type="number"
            v-model="filters.priceMin"
            @input="fetchProducts"
            class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
  
        <!-- Prezzo Massimo -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Prezzo Massimo:</label>
          <input
            type="number"
            v-model="filters.priceMax"
            @input="fetchProducts"
            class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
  
      <!-- Griglia Prodotti -->
      <div class="productGrid grid grid-cols-2 pt-5 gap-8 w-[95%] containerGrid md:grid-cols-6 pt-2 gap-8">
        <Card
          v-for="product in products"
          :key="product.id"
          :id="product.id"
          :name="product.name"
          :img="product.photo"
          :promo="product.promo"
          :plus="product.plus"
          :price="product.price"
          :category="product.category.name"
          :brand="product.brand.name"
          :colorPrimary="colorPrimary"
          colorSecondary="#00192F"
        />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { useFetch } from '#app';
  import Card from '../components/Card.vue';
  const colorPrimary = "#5D758B";
  const products = ref([]);
  const categories = ref([]);
  const brands = ref([]);
  const genders = ref([]);
  const filters = ref({
    category: '',
    brand: '',
    gender: '',
    priceMin: '',
    priceMax: '',
  });
  
  // Caricamento iniziale di categorie e brand
  const { data: categoryData } = await useFetch('/api/categories');
  const { data: brandData } = await useFetch('/api/brands');
  const { data: genderData } = await useFetch('/api/genders');
  categories.value = categoryData.value || [];
  brands.value = brandData.value || [];
  genders.value = genderData.value || [];
  
  // Funzione per recuperare i prodotti con filtri
  const fetchProducts = async () => {
    const queryParams = new URLSearchParams(filters.value).toString();
    const { data } = await useFetch(`/api/products?${queryParams}`);
    products.value = data.value || [];
    console.log(products.value);
    
  };
  
  // Filtri attivi (computati)
  const activeFilters = computed(() => {
    const active = [];
    if (filters.value.category) {
      const category = categories.value.find(cat => cat.id === parseInt(filters.value.category, 10));
      if (category) active.push({ key: 'category', label: `Categoria: ${category.name}` });
    }
    if (filters.value.brand) {
      const brand = brands.value.find(b => b.id === parseInt(filters.value.brand, 10));
      if (brand) active.push({ key: 'brand', label: `Brand: ${brand.name}` });
    }
    if (filters.value.gender) {
      //const genderLabel = filters.value.gender === 'male' ? 'Uomo' : 'Donna';
      const gender = genders.value.find(g=> g.id === parseInt(filters.value.gender, 10))
      if (gender) active.push({ key: 'gender', label: `Gender: ${gender.name}` });
    }
    if (filters.value.priceMin) {
      active.push({ key: 'priceMin', label: `Prezzo Min: €${filters.value.priceMin}` });
    }
    if (filters.value.priceMax) {
      active.push({ key: 'priceMax', label: `Prezzo Max: €${filters.value.priceMax}` });
    }
    return active;
  });
  
  // Rimuove un filtro
  const removeFilter = (key) => {
    filters.value[key] = '';
    fetchProducts();
  };
  
  // Caricamento iniziale prodotti
  await fetchProducts();
  </script>
  
  <style scoped>
  .filters {
    margin-bottom: 20px;
    display: flex;
    gap: 15px;
  }
  </style>
  