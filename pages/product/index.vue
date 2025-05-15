<template>
    <div class="w-[95%]">
      <!-- TOGGLE MENU -->
      <div v-if="open" class="menu bg-[#5D758B] min-h-screen min-w-[95vw] text-white">
        <div class="flex justify-between items-center mb-6">
          <div class="flex gap-6 text-black">
            <p class="font-semibold text-black border-b-2 border-white">DONNA</p>
            <p class="font-semibold text-gray-400 hover:text-black">UOMO</p>
            <p class="font-semibold text-gray-400 hover:text-black">BAMBINI</p>
          </div>
          <p @click="toggleMenu" class="text-gray-400 text-xl font-bold hover:text-white cursor-pointer">X</p>
        </div>
  
        <div class="input mb-6 w-full">
          <input
            type="text"
            placeholder="RICERCA"
            class="search-input"
            v-model="searchQuery"
            @input="debouncedFetchProducts"
          />
        </div>
  
        <div class="grid grid-cols-2 pt-5 gap-8 w-[95%] containerGrid">
          <div
            v-for="(category, index) in categories"
            :key="index"
            class="category-card"
          >
            <div class="square h-[140px] w-[135px] relative">
              <img 
                class="w-full h-full rounded-xl lazyload" 
                :data-src="category.image" 
                :alt="category.name"
              >
              <div class="absolute bottom-[-20px] left-0 w-full">
                <Button 
                  :name="category.name" 
                  bgColor="white" 
                  :textColor="colorPrimary" 
                  :to="`/product?category=${category.name.toLowerCase()}`"
                  width="100%" 
                  :height="buttonHeight" 
                /> 
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <div v-if="!open" class="menu-toggle w-[95%] mx-auto my-0  flex gap-6 text-black items-center">
        <div
          @click="toggleMenu"
          class="md:hidden inline-flex items-center justify-center pr-2 rounded-md text-gray-800 hover:text-gray-900 cursor-pointer"
        >
          <svg
            class="h-6 w-6"
            :style="{ color: colorPrimary }"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <div class="buttons flex gap-4">
          <Button name="DONNA" :bgColor="colorPrimary" textColor="white" :to="getGenderQuery('donna')" width="83px" height="30px" fontSize="12px"/>
          <Button name="UOMO" bgColor="white" :textColor="colorPrimary" :to="getGenderQuery('uomo')" width="83px" height="30px" fontSize="12px"/>
          <Button name="BAMBINO" :bgColor="colorPrimary" textColor="white" :to="getGenderQuery('bambini')" width="83px" height="30px" fontSize="12px" />
        </div>
      </div>
  
      <div class="navBar hidden sm:flex w-[95%] mx-auto my-0">
        <div class="flex gap-4 hover:gap-6">
          <p
            v-for="category in categories"
            :key="category.id"
            @click="setCategory(category)"
            class="category-link hover:scale-125 cursor-pointer"
            :style="{color: colorPrimary}" 
          >
            {{ category.name }}
          </p>
        </div>
      </div>
  
      <div v-if="activeFilters.length" class="active-filters flex items-center gap-4 w-[95%] mx-auto my-0">
        <div class="flex flex-wrap gap-2">
          <p
            v-for="(filter, index) in activeFilters"
            :key="index"
            @click="removeFilter(filter.key)"
            class="filter-item cursor-pointer"
          >
            {{ filter.label }} >
          </p>
        </div>
      </div>
  
      <div v-if="!open" class="w-[95%] mx-auto my-0 flex gap-10 pl-2">
        <div class="left">
          <div class="filtri sottocategory">
            <div 
              class="button items-center w-[74px] h-[31px] rounded-3xl flex justify-center cursor-pointer hover:scale-125"
              @click="filterAdd = !filterAdd"
              :style="{ 
                backgroundColor: openfilters ? 'white' : colorPrimary, 
                color: openfilters ? colorPrimary : 'white', 
                border: openfilters ? `1px solid ${colorPrimary}` : 'none'
              }"
            > 
              <p>FILTRI</p>
            </div>
            <ul v-if="filterAdd" class="list-none pl-0">
              <li>pippo</li>
              <li>pluto</li>
              <li>tipo</li>
              <li>olindo</li>
              <li>nettuno</li>
              <li>ulisse</li>
              <li>nessuno</li>
            </ul>  
          </div>  
        </div>
  
        <div class="right">
          <div class="flex relative">
            <div 
              class="button items-center w-[74px] h-[31px] rounded-3xl flex justify-center cursor-pointer hover:scale-125"
              @click="openModal"
              :style="{ 
                backgroundColor: openfilters ? 'white' : colorPrimary, 
                color: openfilters ? colorPrimary : 'white', 
                border: openfilters ? `1px solid ${colorPrimary}` : 'none'
              }"
            > 
              <p>FILTRI</p>
            </div>
  
            <transition name="slide-in-right">
              <div v-if="openfilters" class="filter-container">
                <div class="flex gap-2" >
                  <div 
                    v-for="(filter, index) in filtri"
                    :key="index"
                    class="button items-center w-[74px] h-[31px] rounded-3xl flex justify-center cursor-pointer hover:scale-125"
                    :style="{ 
                      backgroundColor: !openfilters ? 'white' : colorPrimary, 
                      color: !openfilters ? colorPrimary : 'white', 
                      border: !openfilters ? `1px solid ${colorPrimary}` : 'none'
                    }"
                  > 
                    <p @click="openModalFilter(filter.name)">{{ filter.name }}</p>
                  </div>
                </div>
  
                <div v-if="prezzo" class="price-filter-container left-[90px] top-[50px] bg-white p-4 rounded-xl shadow-lg">
                  <div class="price-filter mb-6">
                    <h3 class="font-semibold mb-2">Prezzo</h3>
                    <div class="price-range-container">
                      <div class="values-display flex justify-between mb-2">
                        <span>€{{ priceMin || minPrice }}</span>
                        <span>€{{ priceMax || maxPrice }}</span>
                      </div>
                      <div class="range-slider">
                        <div class="range-slider-track"></div>
                        <div class="range-slider-progress" :style="{
                          left: `${((priceMin - minPrice) / (maxPrice - minPrice)) * 100}%`,
                          width: `${((priceMax - priceMin) / (maxPrice - minPrice)) * 100}%`
                        }"></div>
                        <input 
                          type="range" 
                          v-model.number="priceMin" 
                          :min="minPrice" 
                          :max="maxPrice"
                          class="range-slider-min"
                          @input="validatePriceRange"
                        >
                        <input 
                          type="range" 
                          v-model.number="priceMax" 
                          :min="minPrice" 
                          :max="maxPrice"
                          class="range-slider-max"
                          @input="validatePriceRange"
                        >
                      </div>
                      <div class="flex justify-center mt-4">
                        <button 
                          @click="applyPriceFilter"
                          class="apply-filter-btn px-4 py-2 rounded-lg text-white"
                          :style="{ backgroundColor: colorPrimary }"
                        >
                          Applica Filtro
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
  
          <div class="productGrid grid grid-cols-2 pt-2 gap-8 w-[95%] containerGrid md:grid-cols-6">
            <Card 
              v-for="product in products" 
              :key="product.id"
              :id="product.id"
              :name="product.name"
              :img="product.photo"
              :codeItem="product.codeItem"
              :promo="product.promo"
              :plus="product.plus"
              :price="product.price"
              :category="product.category"
              :brand="product.brand"
              :colorPrimary="colorPrimary"
              colorSecondary="#00192F"
            /> 
          </div>
        </div>
      </div>
    </div>
</template>
  
<script setup>
  import { useRoute, useRouter } from 'vue-router';
  import { ref, computed, onMounted, watch } from 'vue';
  
  // Route & Router
  const route = useRoute();
  const router = useRouter();
  
  // Composables
  const { screenWidth, buttonHeight, colorPrimary } = useResponsiveButton();
  
  const { data: categories } = await useFetch('/api/categories');
  const { data: genders } = await useFetch('/api/genders');
  const { data: brands } = await useFetch('/api/brands');
  // Stato prodotti e ricerca
  const products = ref([]);
  const prezzo = ref(false);
  const searchQuery = ref('');
  const priceMin = ref(null);
  const priceMax = ref(null);
  const filters = ref({
    category: '',
    brand: '',
    gender: '',
    priceMin: '',
    priceMax: '',
  });


  
  // Fetch prodotti
  const fetchProducts = async () => {
    const { category, brand, gender } = route.query;
    const qPriceMin = route.query.priceMin;
    const qPriceMax = route.query.priceMax;  
    const params = {};

    // Validazione parametri
    setFilter(categories, 'category');
    setFilter(brands, 'brand');
    setFilter(genders, 'gender');

    // Validazione prezzo minimo
    if (priceMin.value && !isNaN(parseFloat(priceMin.value))) {
        params.priceMin = parseFloat(priceMin.value);
    } else if (qPriceMin && !isNaN(parseFloat(qPriceMin))) {
        params.priceMin = parseFloat(qPriceMin);
    }

    // Validazione prezzo massimo
    if (priceMax.value && !isNaN(parseFloat(priceMax.value))) {
        params.priceMax = parseFloat(priceMax.value);
    } else if (qPriceMax && !isNaN(parseFloat(qPriceMax))) {
        params.priceMax = parseFloat(qPriceMax);
    }


    // Solo se ci sono parametri validi, fai la chiamata API
    try {
        const res = await fetch(`/api/products?${new URLSearchParams(filters.value).toString()}`);
        if (!res.ok) {
            console.error('Errore HTTP:', res.status, res.statusText);
            throw new Error('Errore nella risposta del server');
        }
        const data = await res.json();
        products.value = data|| [];
    } catch (err) {
        console.error('Fetch fallito:', err.message);
        products.value = [];
    }
 }
    // Debounce per la ricerca
    const debounce = (func, delay) => {
        let timeout;
        return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };
    
    const debouncedFetchProducts = debounce(() => {
        fetchProducts();
    }, 300);
    
    // Filtri attivi

const activeFilters = computed(() => {
    const active = [
      filters.value.gender
        ? { key: 'gender', label: ` ${genders.value.find(g => g.id === parseInt(filters.value.gender, 10))?.name || ''}` }
        : null,
      filters.value.category
        ? { key: 'category', label: ` ${categories.value.find(cat => cat.id === parseInt(filters.value.category, 10))?.name || ''}` }
        : null,
      filters.value.brand
        ? { key: 'brand', label: `${brands.value.find(b => b.id === parseInt(filters.value.brand, 10))?.name || ''}` }
        : null,
      filters.value.priceMin
        ? { key: 'priceMin', label: `Prezzo Min: €${filters.value.priceMin}` }
        : null,
      filters.value.priceMax
        ? { key: 'priceMax', label: `Prezzo Max: €${filters.value.priceMax}` }
        : null,
    ];
    return active.filter(filter => filter !== null);
  });

  const setFilter = ((array,param) => {
    const queryValue = route.query[param]; // Ottieni il valore dal query param
    if (queryValue) {
        const item = array.value.find(
            item => item.name.toLowerCase() === queryValue.toLowerCase()
        );
        filters.value[param] = item ? item.id : ''; // Assegna dinamicamente al filtro
    } else {
        filters.value[param] = '';
    }
 });
  
  // Rimuovi filtro
  function removeFilter(key) {
    const newQuery = { ...route.query };
    delete newQuery[key];
    router.replace({ query: newQuery });
    priceMin.value = null;
    priceMax.value = null;
  }


  const openModalFilter = (name) => {
    if(name.toLowerCase() === "prezzo"){ 
      prezzo.value =!prezzo.value;
    }
  }
  
  // Cambia categoria
  function setCategory(category) {
    router.push({
    path: '/product',
    query: {
      ...route.query, // Mantiene tutti i query params esistenti
      category: category?.name?.toLowerCase() || undefined // Resetta il parametro se category è null/undefined    }
    }
    });
  }

  // Update the getGenderQuery function to return a string URL
  const getGenderQuery = (gender) => {
    const queryParams = new URLSearchParams();
    
    // Add gender parameter
    queryParams.append('gender', gender.toLowerCase());
    
    // Preserve other query parameters
    for (const [key, value] of Object.entries(route.query)) {
      if (key !== 'gender') {
        queryParams.append(key, value);
      }
    }
    
    return `/product?${queryParams.toString()}`;
  }
  
  // Toggle menu
  const open = ref(false);
  function toggleMenu() {
    open.value = !open.value;
  }
  
  // Modal
  const openfilters = ref(false);
  const filterAdd = ref(false);
  const selected = ref(false);
  const filtri = ref([
    { name: "Colore", value: "" },
    { name: "Taglia", value: "" },
    { name: "Prezzo", value: "" }
  ]);
  
  function openModal() {
    openfilters.value = !openfilters.value;
    selected.value = openfilters.value;
  }

  // Calcolo prezzo minimo e massimo
  const minPrice = computed(() => {
  if (!products.value || products.value.length === 0) return 0;
  return products.value.reduce((min, product) => 
    product.price < min ? product.price : min, Infinity);
  });

  const maxPrice = computed(() => {
  if (!products.value || products.value.length === 0) return 1000; // valore predefinito
  return products.value.reduce((max, product) => 
    product.price > max ? product.price : max, -Infinity);
  });

  // Validazione range prezzi
  const validatePriceRange = () => {
    // Assicurati che priceMin non sia maggiore di priceMax
    if (priceMin.value > priceMax.value) {
      priceMin.value = priceMax.value;
    }
    
    // Assicurati che priceMax non sia minore di priceMin
    if (priceMax.value < priceMin.value) {
      priceMax.value = priceMin.value;
    }
  };
  
  // Applica filtro prezzo all'URL
  const applyPriceFilter = () => {
    const newQuery = { ...route.query };
    
    // Aggiungi i parametri di prezzo solo se sono stati impostati
    if (priceMin.value !== null && priceMin.value !== minPrice.value) {
      newQuery.priceMin = priceMin.value.toString();
    } else {
      delete newQuery.priceMin;
    }
    
    if (priceMax.value !== null && priceMax.value !== maxPrice.value) {
      newQuery.priceMax = priceMax.value.toString();
    } else {
      delete newQuery.priceMax;
    }
    
    // Aggiorna l'URL con i nuovi parametri
    router.replace({ query: newQuery });
    
    // Chiudi il filtro prezzo
    prezzo.value = false;
  };

  

  // Watch per triggerare fetch al cambio di query
watch(() => route.query, () => {
  fetchProducts();
}, { deep: true });

// Watch per triggerare fetch al cambio di prezzo
watch([priceMin, priceMax], () => {
  fetchProducts();
});

onMounted(() => {
  fetchProducts();
});
  
</script>

  
  <style scoped>
  .menu {
    /* Styles for the menu */
  }
  .search-input {
    width: 90%;
    padding: 0.75rem 1rem;
    border-radius: 9999px;
    background-color: #4b5563;
    color: #d1d5db;
    placeholder-color: #6b7280;
    focus-outline: none;
    focus-ring: 2px solid #6b7280;
  }
  .category-card {
    background-size: cover;
    background-position: center;
    border-radius: 1rem;
    height: 140px;
    width: 135px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  .menu-toggle {
    /* Styles for the menu toggle */
  }
  .filter-container {
    margin-left: 10px;
  }
  
  .category-link {
    font-size: 18px;
    cursor: pointer;
    font-weight: bold;
    /* scale: 1.25; */
    padding-left: 0.5rem;
  }
  .active-filters {
    /* Styles for active filters */
  }
  .filter-item {
    color: #3b82f6;
    font-size: 1.125rem;
    cursor: pointer;
    padding-left: 0.5rem ;
    transition: color 0.2s;
    hover-color: #4b5563;
  }
  @keyframes slide-in-right {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }
  
  .slide-in-right-enter-active {
    animation: slide-in-right 0.5s ease-out forwards;
  }
  
  .slide-in-right-leave-active {
    animation: slide-in-right 0.5s ease-out reverse;
  }
  
  /* Stili per gli slider */
  .slider {
    -webkit-appearance: none;
    height: 4px;
    background: #d3d3d3;
    outline: none;
    opacity: 0.7;
    transition: opacity 0.2s;
    border-radius: 2px;
  }
  
  .slider:hover {
    opacity: 1;
  }
  
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #5D758B;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 0 5px rgba(0,0,0,0.2);
  }
  
  .slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #5D758B;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 0 5px rgba(0,0,0,0.2);
  }
  
  .min-slider {
    z-index: 2;
  }
  
  .max-slider {
    z-index: 1;
  }
  
  .apply-filter-btn:hover {
    opacity: 0.9;
  }
  </style>