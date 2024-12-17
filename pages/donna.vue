<template>
  <div class="">
     <!-- TOGLE MENU -->
     <div v-if="open" class="bg-[#5D758B] min-h-screen min-w-[95vw] px-4  py-6 text-white ">
       <!-- Tabs -->
       <div class="flex justify-between items-center mb-6">
         <div class="flex gap-6 text-black">
           <p class="font-semibold text-black border-b-2 border-white">DONNA</p>
           <p class="font-semibold text-gray-400 hover:text-black">UOMO</p>
           <p class="font-semibold text-gray-400 hover:text-black">BAMBINI</p>
         </div>
         <p @click="open = !open" class="text-gray-400 text-xl font-bold hover:text-white">X</p>
       </div>
   
       <!-- Search Bar -->
       <div class="input mb-6 w-full" >
         <input
           type="text"
           placeholder="RICERCA"
           class="w-[90%]  py-3 px-4 rounded-full bg-gray-700 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
         />
       </div>
   
       <!-- Categories Grid -->
       <div class="grid grid-cols-2 pt-5 gap-8 w-[95%] containerGrid">
         <div
           v-for="(category, index) in categories"
           :key="index"
           class=" bg-cover bg-center rounded-xl  h-[140px] w-[135px]   shadow-lg"
           
         >
           <!-- Category Name -->
            <div class="square h-[140px] w-[135px] relative ">
                 <img class="w-full h-full rounded-xl" src="https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg" alt="img">
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
 
     
 
 
     <div v-if="!open" class=" w-[95%] mx-auto my-0 flex gap-6 text-black items-center">
     <!-- Mobile menu button -->
         <div
             @click="open = !open"
             type="button"
             class="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-800 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
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
 
           <div class="buttons flex gap-2 text-xs">
             <Button name="DONNA" :bgColor="colorPrimary" colorText="white"  to="/donna" leftRadius="true" width="100px" height="30px"/>
             <Button name="UOMO" bgColor="white" :colorText="colorPrimary" to="/uomo" leftRadius="true" width="100px" height="30px"/>
             <Button name="BAMBINO" :bgColor="colorPrimary" colorText="white" to="/bambino" leftRadius="true" width="100px" height="30px"/>
           </div>
           
     </div>
     <div class="navBar hidden sm:flex  w-[95%] mx-auto my-0">
             <div class="flex gap-4 ">
                <p
                  v-for="category in categories"
                    :key="category.id"
                    @click="setCategoryFilter(category.id)"
                    class="text-[18px] hover:cursor-pointer hover:font-extrabold hover:scale-125 hover:px-1"
                    :style="{color:colorPrimary}" 
                  >
                    {{ category.name }}
                </p>
             </div>

     </div>

            <!-- Barra dei filtri attivi -->
      <div v-if="activeFilters.length" class="flex items-center gap-4 p-4  mb-6">
        <div class="flex flex-wrap gap-2">
          <p
            v-for="(filter, index) in activeFilters"
            :key="index"
            @click="removeFilter(filter.key)"
            class="text-blue-500 text-lg hover:cursor-pointer px-3 py-1  hover:text-gray-600 transition"
          >
            {{ filter.label }} >
        </p>
        </div>
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
     
     
   </template>
   
 <script setup>
 import { useCategoryStore } from '@/stores/categoryStore'
 import { useFetch } from '#app';
 import Button from '../components/Button.vue'
 import Card from '../components/Card.vue'
 import { useResponsiveButton } from '~/composables/useResponsiveButton';
 import { computed, ref } from 'vue';
 import { useRoute } from 'vue-router'

 const { screenWidth, buttonStyle, buttonWidth, buttonHeight, colorPrimary } = useResponsiveButton();
 
 const { data: categories, pending, error } = await useFetch('/api/categories');
//  const { data: products, pending2, error2 } = await useFetch('/api/products/donna')
const { data: genders } = await useFetch('/api/genders');
 

const open = ref(false);
 const products = ref([]);
 const filters = ref({
    category: '',
    brand: '',
    gender: '',
    priceMin: '',
    priceMax: '',
  });
  const route = useRoute()

  const setGenderFilter = computed(() => {
  // Recupero il parametro 'gender' dall'URL (che può essere in query o params)
  // const gender = route.query.gender || route.params.gender;
   const gender = route.name;

  // Se esiste il parametro 'gender', cerco di trovarlo nell'array 'genders'
  if (gender) {
    const genderItem = genders.value.find(item => item.name.toLowerCase() === gender.toLowerCase());
    
    if (genderItem) {
      // Se trovo il genere, imposto il filtro con il suo ID
      filters.value.gender = genderItem.id;
    } else {
      // Se non trovo il genere, posso gestire il caso (ad esempio, impostando un filtro di default o un messaggio di errore)
      filters.value.gender = ''; // Oppure puoi usare un valore di default se necessario
    }

  } else {
    // Se non c'è il parametro 'gender', resetto il filtro (o imposto un valore di default)
    filters.value.gender = '';
  }
   fetchProducts(); 
});

  // Funzione per recuperare i prodotti con filtri
  const fetchProducts = async () => {
    const queryParams = new URLSearchParams(filters.value).toString();    
    const { data } = await useFetch(`/api/products?${queryParams}`);
    products.value = data.value || [];    
    console.log(products.value);
    
  };

    // Imposta il filtro per la categoria
    const setCategoryFilter = (categoryId) => {
      filters.value.category = categoryId;
      fetchProducts();
    };

    const activeFilters = computed(() => {
  // Struttura base con chiavi fisse nell'ordine desiderato
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

  // Rimuove i valori nulli lasciando l'ordine intatto
  return active.filter(filter => filter !== null);
});

  
  // Rimuove un filtro
  const removeFilter = (key) => {
    filters.value[key] = '';
    fetchProducts();
  };

    // Caricamento iniziale prodotti
    onMounted(() => {
      setGenderFilter.value; // Questo forza la computazione del computed appena il componente è montato
      fetchProducts(); 
    });
 
 
 </script>
 
 <style scoped>
 .container{
     margin: 0 auto 
 }
 .input{
     margin: 0 auto
 }
 .containerGrid{
     margin: 0 auto
 }
 .mainContainer{
     width: 90%;
     margin: 0 auto;
 }
 </style>