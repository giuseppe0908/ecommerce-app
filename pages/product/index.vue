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
          <Button 
            name="NUOVI ARRIVI" 
            :bgColor="route.query.newArrivals === 'true' ? colorPrimary : 'white'" 
            :textColor="route.query.newArrivals === 'true' ? 'white' : colorPrimary" 
            @click="toggleNewArrivals" 
            width="110px" 
            height="30px" 
            fontSize="12px" 
          />
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
  
      <div v-if="!open" class="w-[95%] mx-auto my-0  gap-10 pl-2 md:flex">
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
               @click="openfilters = !openfilters"
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
                <div class="flex gap-2">
                  <div 
                    v-for="(filter, index) in filtri"
                    :key="index"
                    class="button items-center w-[74px] h-[31px] rounded-3xl flex justify-center cursor-pointer hover:scale-125"
                    :style="{ 
                      backgroundColor: filter.selected ? colorPrimary : 'white', 
                      color: filter.selected ? 'white' : colorPrimary, 
                      border: !filter.selected ? `1px solid ${colorPrimary}` : 'none'
                    }"
                    @click="selectFilter(filter)"
                  > 
                    <p>{{filter.name}}</p>
                  </div>
                </div>
                
                <!-- Filtro per prezzo migliorato -->
                <div v-if="isPriceFilterSelected" class="price-filter-container mt-4 bg-white p-4 rounded-xl shadow-lg">
                  <h3 class="font-semibold mb-2" :style="{ color: colorPrimary }">Prezzo</h3>
                  
                  <!-- Range display -->
                  <div class="flex justify-between mb-2">
                    <span>€{{ priceRange.min }}</span>
                    <span>€{{ priceRange.max }}</span>
                  </div>
                  
                  <!-- Double slider -->
                  <div class="relative mb-6 pt-5">
                    <div class="slider-track h-1 absolute w-full bg-gray-300 rounded"></div>
                    <div 
                      class="slider-range h-1 absolute bg-blue-500 rounded" 
                      :style="{ 
                        left: `${((priceRange.min - minPrice) / (maxPrice - minPrice)) * 100}%`, 
                        width: `${((priceRange.max - priceRange.min) / (maxPrice - minPrice)) * 100}%`,
                        backgroundColor: colorPrimary
                      }"
                    ></div>
                    
                    <input 
                      type="range" 
                      class="slider absolute w-full" 
                      :min="minPrice" 
                      :max="maxPrice" 
                      v-model.number="priceRange.min" 
                      @input="updatePriceFilter"
                    />
                    
                    <input 
                      type="range" 
                      class="slider absolute w-full" 
                      :min="minPrice" 
                      :max="maxPrice" 
                      v-model.number="priceRange.max" 
                      @input="updatePriceFilter"
                    />
                  </div>
                  
                  <!-- Input fields -->
                  <div class="flex items-center space-x-2">
                    <input 
                      type="number" 
                      v-model.number="priceRange.min" 
                      @change="updatePriceFilter"
                      class="w-1/2 p-2 border rounded text-center"
                      :min="minPrice"
                      :max="priceRange.max - 1"
                    />
                    <span>-</span>
                    <input 
                      type="number" 
                      v-model.number="priceRange.max" 
                      @change="updatePriceFilter"
                      class="w-1/2 p-2 border rounded text-center"
                      :min="priceRange.min + 1"
                      :max="maxPrice"
                    />
                  </div>
                  
                  <!-- Pulsanti di azione -->
                  <div class="flex justify-between mt-4">
                    <button 
                      @click="resetPriceFilter" 
                      class="px-3 py-1 border rounded hover:bg-gray-100"
                    >
                      Reset
                    </button>
                    <button 
                      @click="applyPriceFilter" 
                      class="px-3 py-1 rounded text-white"
                      :style="{ backgroundColor: colorPrimary }"
                    >
                      Applica
                    </button>
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
    promo: '',
    plus: '',
    newArrivals: '',
  });
  const lastQueryString = ref('');

  
  // Fetch prodotti
  const fetchProducts = async () => {
    // Aggiorna i filtri in base ai parametri dell'URL
    setFilter(categories, 'category');
    setFilter(brands, 'brand');
    setFilter(genders, 'gender');
    
    // Aggiorna i valori di prezzo in base ai parametri dell'URL
    const qPriceMin = route.query.priceMin;
    const qPriceMax = route.query.priceMax;
    const qNewArrivals = route.query.newArrivals;
    const qpromo = route.query.promo;
    const qplus = route.query.plus;
    
    if (qPriceMin && !isNaN(parseFloat(qPriceMin))) {
      priceMin.value = parseFloat(qPriceMin);
      filters.value.priceMin = qPriceMin;
    } else if (qPriceMin === undefined) {
      // Reset quando il parametro viene rimosso
      priceMin.value = null;
      filters.value.priceMin = '';
    }
    
    if (qPriceMax && !isNaN(parseFloat(qPriceMax))) {
      priceMax.value = parseFloat(qPriceMax);
      filters.value.priceMax = qPriceMax;
    } else if (qPriceMax === undefined) {
      // Reset quando il parametro viene rimosso
      priceMax.value = null;
      filters.value.priceMax = '';
    }
    
    // Aggiorna il filtro nuovi arrivi in base ai parametri dell'URL
    if (qNewArrivals === 'true') {
      filters.value.newArrivals = 'true';
    } else {
      filters.value.newArrivals = '';
    }

     // Aggiorna il filtro promoi in base ai parametri dell'URL
     if (qpromo === 'true') {
      filters.value.promo = 'true';
    } else {
      filters.value.promo = '';
    }

     // Aggiorna il filtro plus in base ai parametri dell'URL
     if (qplus === 'true') {
      filters.value.plus = 'true';  
     }else {
      filters.value.plus = '';
    }

    // Memorizza i parametri di filtro correnti per evitare chiamate API non necessarie
    const queryString = new URLSearchParams(filters.value).toString();
    if (queryString === lastQueryString.value) return;
    lastQueryString.value = queryString;

    // Solo se ci sono parametri validi, fai la chiamata API
    try {
        const res = await fetch(`/api/products?${queryString}`);
        if (!res.ok) {
            console.error('Errore HTTP:', res.status, res.statusText);
            throw new Error('Errore nella risposta del server');
        }
        const data = await res.json();
        products.value = data || [];
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
    }, 500); // Aumentato da 300ms a 500ms
    
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
          filters.value.newArrivals
            ? { key: 'newArrivals', label: 'Nuovi Arrivi' }
            : null,
          filters.value.promo
           ? { key: 'promo', label: 'Promo' }
            : null,
          filters.value.plus
           ? { key: 'plus', label: 'Spedizione Plus' }
            : null,
        ];
        return active.filter(filter => filter !== null);
    });

    const setFilter = ((array, param) => {
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
        
        // Aggiorna anche i valori locali quando rimuovi i filtri di prezzo
        if (key === 'priceMin') {
          priceMin.value = null;
          filters.value.priceMin = '';
        }
        
        if (key === 'priceMax') {
          priceMax.value = null;
          filters.value.priceMax = '';
        }
        
        // Gestione del filtro prezzo personalizzato
        if (key === 'price') {
          resetPriceFilter();
        }
        
        // Gestione del filtro nuovi arrivi
        if (key === 'newArrivals') {
          filters.value.newArrivals = '';
        }
        
        router.replace({ query: newQuery });
    }
    
    // Toggle nuovi arrivi
    function toggleNewArrivals() {
        const newQuery = { ...route.query };
        
        if (newQuery.newArrivals === 'true') {
          delete newQuery.newArrivals;
          filters.value.newArrivals = '';
        } else {
          newQuery.newArrivals = 'true';
          filters.value.newArrivals = 'true';
        }
        
        router.replace({ query: newQuery });
    }

    const openModalFilter = (name) => {
        if(name.toLowerCase() === "prezzo"){ 
          prezzo.value = !prezzo.value;
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
        { name: "Colore", value: "", selected: false },
        { name: "Taglia", value: "", selected: false },
        { name: "Prezzo", value: "", selected: false }
    ]);
  
    function openModal() {
        openfilters.value = !openfilters.value;
        selected.value = openfilters.value;
    }

    // Calcolo prezzo minimo e massimo con memorizzazione
    const minPrice = ref(0);
    const maxPrice = ref(1000);
    
    // Aggiorna i valori min e max in base ai prodotti disponibili
    const updatePriceRange = () => {
      if (!products.value || products.value.length === 0) return;
      
      const min = Math.floor(products.value.reduce((min, product) => 
        product.price < min ? product.price : min, Infinity));
      
      const max = Math.ceil(products.value.reduce((max, product) => 
        product.price > max ? product.price : max, -Infinity));
      
      if (min !== Infinity) minPrice.value = min;
      if (max !== -Infinity) maxPrice.value = max;
      
      // Inizializza il range se non è già stato impostato
      if (!priceRange.value.min) priceRange.value.min = minPrice.value;
      if (!priceRange.value.max) priceRange.value.max = maxPrice.value;
    };

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
      
      // Aggiorna i filtri locali prima di aggiornare l'URL
      filters.value.priceMin = priceRange.value.min.toString();
      filters.value.priceMax = priceRange.value.max.toString();
      
      // Aggiungi i parametri di prezzo solo se sono stati impostati
      if (priceRange.value.min !== minPrice.value) {
        newQuery.priceMin = priceRange.value.min.toString();
      } else {
        delete newQuery.priceMin;
        filters.value.priceMin = '';
      }
      
      if (priceRange.value.max !== maxPrice.value) {
        newQuery.priceMax = priceRange.value.max.toString();
      } else {
        delete newQuery.priceMax;
        filters.value.priceMax = '';
      }
      
      // Aggiorna l'URL con i nuovi parametri
      router.replace({ query: newQuery });
      
      // Chiudi il filtro prezzo
      openfilters.value = false;
      
      // Forza il recupero dei prodotti con i nuovi filtri
      fetchProducts();
    };

    // Reset filtro prezzo
    const resetPriceFilter = () => {
      priceRange.value.min = minPrice.value;
      priceRange.value.max = maxPrice.value;
      
      // Rimuovi i parametri dall'URL
      const newQuery = { ...route.query };
      delete newQuery.priceMin;
      delete newQuery.priceMax;
      router.replace({ query: newQuery });
      
      // Aggiorna i filtri locali
      filters.value.priceMin = '';
      filters.value.priceMax = '';
    };

    // Watch per triggerare fetch al cambio di query
    watch(() => route.query, () => {
      fetchProducts();
    }, { deep: true });

    // Watch per aggiornare il range di prezzi quando arrivano i prodotti
    watch(products, () => {
      updatePriceRange();
    }, { immediate: true });

    // Inizializza il range di prezzi
    const priceRange = ref({
      min: minPrice.value,
      max: maxPrice.value
    });
    
    const isPriceFilterSelected = ref(false);

    // Funzione per selezionare un filtro
    const selectFilter = (filter) => {
      // Resetta tutti i filtri
      filtri.value.forEach(f => f.selected = false);
      
      // Seleziona il filtro corrente
      filter.selected = true;
      
      // Imposta il flag per il filtro prezzo
      isPriceFilterSelected.value = filter.name === 'Prezzo';
    };

    // Funzione per aggiornare il filtro prezzo durante l'interazione con gli slider
    const updatePriceFilter = () => {
      // Assicurati che min non superi max - 1
      if (priceRange.value.min >= priceRange.value.max) {
        priceRange.value.min = priceRange.value.max - 1;
      }
      
      // Assicurati che max non sia inferiore a min + 1
      if (priceRange.value.max <= priceRange.value.min) {
        priceRange.value.max = priceRange.value.min + 1;
      }
    };

    // Inizializza i prodotti al caricamento della pagina
    onMounted(() => {
      fetchProducts();
    });
</script>
<style scoped>
  /* Stili per il filtro prezzo */
  .slider {
    -webkit-appearance: none;
    height: 1px;
    background: transparent;
    outline: none;
    margin: 0;
    padding: 0;
    z-index: 2;
  }
  
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: v-bind(colorPrimary);
    cursor: pointer;
    z-index: 3;
  }
  
  .slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: v-bind(colorPrimary);
    cursor: pointer;
    z-index: 3;
  }
  
  /* Animazione per il filtro */
  .slide-in-right-enter-active {
    transition: all 0.3s ease-out;
  }
  
  .slide-in-right-leave-active {
    transition: all 0.3s ease-in;
  }
  
  .slide-in-right-enter-from,
  .slide-in-right-leave-to {
    transform: translateX(20px);
    opacity: 0;
  }
  
  /* Stili per i filtri attivi */
  .filter-item {
    background-color: #f0f0f0;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    transition: all 0.2s;
  }
  
  .filter-item:hover {
    background-color: #e0e0e0;
  }
  
  /* Stili per il contenitore dei filtri */
  .filter-container {
    position: absolute;
    top: 40px;
    left: 0;
    background-color: white;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 10;
    min-width: 250px;
  }
</style>