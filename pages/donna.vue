<template>
  <div class="container">
    <!-- TOGGLE MENU -->
    <div v-if="open" class="menu bg-[#5D758B] min-h-screen min-w-[95vw]  text-white">
      <!-- Tabs -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex gap-6 text-black">
          <p class="font-semibold text-black border-b-2 border-white">DONNA</p>
          <p class="font-semibold text-gray-400 hover:text-black">UOMO</p>
          <p class="font-semibold text-gray-400 hover:text-black">BAMBINI</p>
        </div>
        <p @click="toggleMenu" class="text-gray-400 text-xl font-bold hover:text-white">X</p>
      </div>

      <!-- Search Bar -->
      <div class="input mb-6 w-full">
        <input
          type="text"
          placeholder="RICERCA"
          class="search-input"
          v-model="searchQuery"
          @input="debouncedFetchProducts"
        />
      </div>

      <!-- Categories Grid -->
      <div class="grid grid-cols-2 pt-5 gap-8 w-[95%] containerGrid">
        <div
          v-for="(category, index) in categories"
          :key="index"
          class="category-card"
        >
          <!-- Category Name -->
          <div class="square h-[140px] w-[135px] relative">
            <img class="w-full h-full rounded-xl lazyload" :data-src="category.image" alt="img">
            <div class="absolute bottom-[-20px] left-0 w-full">
              <Button 
                :name="category.name" 
                bgColor="white" 
                :colorText="colorPrimary" 
                :to="category.name" 
                :leftRadius="true" 
                width="100%" 
                :height="buttonHeight" 
              /> 
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!open" class="menu-toggle w-[95%] mx-auto my-0 flex gap-6 text-black items-center">
      <!-- Mobile menu button -->
      <div
        @click="toggleMenu"
        type="button"
        class="menu-button"
        aria-controls="mobile-menu"
        aria-expanded="false"
      >
        <span class="sr-only">Open main menu</span>
        <svg
          class="h-6 w-6"
          :class="{ 'hidden': open, 'block': !open }"
          :style="{ color: colorPrimary }"
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
          :class="{ 'block': open, 'hidden': !open }"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>

      <div class="buttons flex gap-2 text-xs ">
        <Button name="DONNA" :bgColor="colorPrimary" colorText="white" to="/donna" leftRadius="true" width="83px" height="30px"/>
        <Button name="UOMO" bgColor="white" :colorText="colorPrimary" to="/uomo" leftRadius="true" width="83px" height="30px"/>
        <Button name="BAMBINO" :bgColor="colorPrimary" colorText="white" to="/bambino" leftRadius="true" width="83px" height="30px"/>
      </div>
    </div>

    <div class="navBar hidden sm:flex w-[95%] mx-auto my-0">
      <div class="flex gap-4 hover:gap-6">
        <p
          v-for="category in categories"
          :key="category.id"
          @click="setCategoryFilter(category.id)"
          class="category-link hover:scale-125 "
          :style="{color:colorPrimary}" 
        >
          {{ category.name }}
        </p>
      </div>
    </div>

    <!-- Barra dei filtri attivi -->
    <div v-if="activeFilters.length" class="active-filters flex items-center gap-4 w-[95%] mx-auto my-0">
      <div class="flex flex-wrap gap-2">
        <p
          v-for="(filter, index) in activeFilters"
          :key="index"
          @click="removeFilter(filter.key)"
          class="filter-item"
        >
          {{ filter.label }} >
        </p>
      </div>
    </div>

    <div v-if="!open" class="w-[95%] mx-auto my-0 flex gap-10">
      <div class="left">
        <div class="filtri sottocategory">
          <div class="button items-center w-[74px] h-[31px] rounded-3xl flex justify-center cursor-pointer hover:scale-125"
           @click="filterAdd = !filterAdd"
           :style="{ backgroundColor: openfilters ? 'white' : colorPrimary, 
                    color: openfilters ? colorPrimary : 'white', 
                    border: openfilters ? `1px solid ${colorPrimary}` : 'none'}"
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
        <div class="flex relative items-center">
          <div class="button items-center w-[74px] h-[31px] rounded-3xl flex justify-center cursor-pointer hover:scale-125"
           @click="openModal"
           :style="{ backgroundColor: openfilters ? 'white' : colorPrimary, 
                    color: openfilters ? colorPrimary : 'white', 
                    border: openfilters ? `1px solid ${colorPrimary}` : 'none'}"
           > 
             <p>FILTRI</p>
          </div>
          <transition name="slide-in-right">
            <div
              v-if="openfilters"
              class="modal absolute left-[90px] h-auto rounded-xl flex gap-4 "
              :style="{ width: `${Math.min(300, containerWidth)}px` }"
            >
              <div v-for="(filter,index) in filtri" :key="index"
                class="button items-center w-[74px] h-[31px]  rounded-3xl flex justify-center cursor-pointer hover:scale-125"
                :style="{ backgroundColor: !openfilters ? 'white' : colorPrimary, 
                          color: !openfilters ? colorPrimary : 'white', 
                          border: !openfilters ? `1px solid ${colorPrimary}` : 'none'}"
              > 
                <p>{{filter.name}}</p>
              </div>
            </div>
          </transition>
        </div>
        <div class="productGrid grid grid-cols-2 pt-5 gap-8 w-[95%] containerGrid md:grid-cols-6 pt-2 gap-8">
            <Card v-for="product in products" :key="product.id"
              :id="product.id"
              :name="product.name"
              :img="product.photo"
              :promo="product.promo"
              :plus="product.plus"
              :price="product.price"
              :category="product.category"
              :colorPrimary="colorPrimary"
              colorSecondary="#00192F"
            /> 
          </div>
        </div>
      </div>  
    </div>

    
</template>

<script setup>
import { useCategoryStore } from '@/stores/categoryStore'
import { useFetch } from '#app';
import Button from '../components/Button.vue'
import Card from '../components/Card.vue'
import { useResponsiveButton } from '~/composables/useResponsiveButton';
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router'
import _ from 'lodash';
definePageMeta({
  layout: false, // Disabilita completamente il layout
});
const { screenWidth, buttonStyle, buttonWidth, buttonHeight, colorPrimary } = useResponsiveButton();

const { data: categories, pending, error } = await useFetch('/api/categories');
const { data: genders } = await useFetch('/api/genders');

const openfilters = ref(false);
const open = ref(false);
const products = ref([]);
const searchQuery = ref('');
const filters = ref({
  category: '',
  brand: '',
  gender: '',
  priceMin: '',
  priceMax: '',
});
const filterAdd = ref(false);
const route = useRoute();

const toggleMenu = () => {
  open.value = !open.value;
};
const openModal = () => {
  openfilters.value = !openfilters.value;
};
const filtri = ref([
      {
        name: "Ordina",
        selected:false,
        list: [
          { name: "Proposte", href: "/Proposte" },
          { name: "Iniziative Commerciali", href: "/Proposte/iniziativeCommerciali" },
          { name: "Macrorami", href: "/Macrorami" },
          { name: "Prodotti", href: "/Prodotti" },
        ],
      },
      {
        name: "Consegna",
        selected:false,
        list: [
          { name: "Proposte", href: "/Proposte" },
          { name: "Iniziative Commerciali", href: "/Proposte/iniziativeCommerciali" },
          { name: "Macrorami", href: "/Macrorami" },
          { name: "Prodotti", href: "/Prodotti" },
        ],
      },
      {
        name: "Taglia",
        selected:false,
        list: [
          { name: "Proposte", href: "/Proposte" },
          { name: "Iniziative Commerciali", href: "/Proposte/iniziativeCommerciali" },
          { name: "Macrorami", href: "/Macrorami" },
          { name: "Prodotti", href: "/Prodotti" },
        ],
      },
      {
        name: "Vestibilità",
        selected:false,
        list: [
          { name: "Proposte", href: "/Proposte" },
          { name: "Iniziative Commerciali", href: "/Proposte/iniziativeCommerciali" },
          { name: "Macrorami", href: "/Macrorami" },
          { name: "Prodotti", href: "/Prodotti" },
        ],
      },
      {
        name: "Materiale",
        selected:false,
        list: [
          { name: "Proposte", href: "/Proposte" },
          { name: "Iniziative Commerciali", href: "/Proposte/iniziativeCommerciali" },
          { name: "Macrorami", href: "/Macrorami" },
          { name: "Prodotti", href: "/Prodotti" },
        ],
      },
      {
        name: "Prezzo",
        selected:false,
        list: [
          { name: "Proposte", href: "/Proposte" },
          { name: "Iniziative Commerciali", href: "/Proposte/iniziativeCommerciali" },
          { name: "Macrorami", href: "/Macrorami" },
          { name: "Prodotti", href: "/Prodotti" },
        ],
      },
      {
        name: "Colore",
        selected:false,
        list: [
          { name: "Proposte", href: "/Proposte" },
          { name: "Iniziative Commerciali", href: "/Proposte/iniziativeCommerciali" },
          { name: "Macrorami", href: "/Macrorami" },
          { name: "Prodotti", href: "/Prodotti" },
        ],
      },
      {
        name: "Brand",
        selected:false,
        list: [
          { name: "Proposte", href: "/Proposte" },
          { name: "Iniziative Commerciali", href: "/Proposte/iniziativeCommerciali" },
          { name: "Macrorami", href: "/Macrorami" },
          { name: "Prodotti", href: "/Prodotti" },
        ],
      },
      {
        name: "Novità",
        selected:false,
        list: [
          { name: "Proposte", href: "/Proposte" },
          { name: "Iniziative Commerciali", href: "/Proposte/iniziativeCommerciali" },
          { name: "Macrorami", href: "/Macrorami" },
          { name: "Prodotti", href: "/Prodotti" },
        ],
      },
])


const setGenderFilter = computed(() => {
  const gender = route.name;
  if (gender) {
    const genderItem = genders.value.find(item => item.name.toLowerCase() === gender.toLowerCase());
    filters.value.gender = genderItem ? genderItem.id : '';
  } else {
    filters.value.gender = '';
  }
  fetchProducts(); 
});

const fetchProducts = async () => {
  const queryParams = new URLSearchParams(filters.value).toString();    
  const { data } = await useFetch(`/api/products?${queryParams}`);
  products.value = data.value || [];    
};

const debouncedFetchProducts = _.debounce(fetchProducts, 300);

const setCategoryFilter = (categoryId) => {
  filters.value.category = categoryId;
  fetchProducts();
};

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

const removeFilter = (key) => {
  filters.value[key] = '';
  fetchProducts();
};

watch(filters, fetchProducts, { deep: true });

onMounted(() => {
  setGenderFilter.value;
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
.menu-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 0.375rem;
  color: #1f2937;
  hover-color: #111827;
  focus-outline: none;
  focus-ring: 2px solid #6366f1;
}
.category-link {
  font-size: 18px;
  cursor: pointer;
  font-weight: bold;
  /* scale: 1.25; */
  padding-left: 0.25rem;
}
.active-filters {
  /* Styles for active filters */
}
.filter-item {
  color: #3b82f6;
  font-size: 1.125rem;
  cursor: pointer;
  padding: 0.25rem 0.75rem;
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
</style>