<template>
    <div>
        <!-- <div class="product" v-for="product in productStore.product" :key="product.id">
            <h1>{{ product.name }}</h1>
           
           <p>Prezzo: {{ product.price }}€</p>
        </div> -->
       

      <h1>{{productStore.product.name}}</h1>
      <p>{{productStore.product.price}}€</p>
    </div>
  </template>
  
  <script setup>
  import { useRoute } from 'vue-router'
  import { ref, onMounted } from 'vue'
  import { useProductStore } from '@/stores/productStore'
  const productStore = useProductStore()
  
  // Definisci il prodotto come un ref
  const product = ref([null])
  const route = useRoute()
  
  
  // Recupera l'ID dalla route e chiama fetchItemById
  onMounted(async () => {
    const productId = route.params.id
    productStore.fetchProductById(productId)
    
  })
  </script>
  