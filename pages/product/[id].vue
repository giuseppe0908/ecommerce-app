<template>
    <div v-for="item in itemStore.item" :key="fav.id>
      <h1>{{ item.name }}</h1>
      <p>{{ item.description }}</p>
      <p>Prezzo: {{ item.price }}€</p>
    </div>
  </template>
  
  <script setup>
  import { useRoute } from 'vue-router'
  import { ref, onMounted } from 'vue'
  import { useItemStore } from '@/stores/itemStore'
  const itemStore = useItemStore()
  
  // Definisci il prodotto come un ref
  const item = ref([null])
  const route = useRoute()
  
  
  // Recupera l'ID dalla route e chiama fetchItemById
  onMounted(async () => {
    const itemId = route.params.id
    itemStore.fetchItemById(itemId)
    
  })
  </script>
  