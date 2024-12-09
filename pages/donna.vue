<template>
 <div class="">
    <!-- TOGLE MENU -->
    <div v-if="open" class="bg-[#5D758B] min-h-screen px-4  py-6 text-white ">
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
          <!-- Overlay 
          <div class="absolute inset-0 bg-black bg-opacity-40"></div>  -->
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

    


    <div v-if="!open" class="flex gap-6 text-black items-center">
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

          <p class="font-semibold text-black border-b-2 border-white">DONNA</p>
          <p class="font-semibold text-gray-400 hover:text-black">UOMO</p>
          <p class="font-semibold text-gray-400 hover:text-black">BAMBINI</p>
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

const { screenWidth, buttonStyle, buttonWidth, buttonHeight, colorPrimary } = useResponsiveButton();

const { data: categories, pending, error } = await useFetch('/api/categories');
const { data: products, pending2, error2 } = await useFetch('/api/products/donna')
const open = ref(false);


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