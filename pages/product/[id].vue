<template>
    <div>
        <div class="product">
            <h1>{{ itemStore.item }}</h1>
            <p>{{ itemStore.item }}</p>
            <p>Prezzo: {{ itemStore.item }}€</p>
        </div>
      
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
  