<template>
    <div>
      <h1>Products</h1>
      <div v-if="pending">Loading...</div>
      <div v-else>
        <div v-for="product in products" :key="product.id">
          <h3>{{ product.name }}</h3>
          <p>{{ product.category.name }}</p>
          <!-- Mostra altre informazioni del prodotto -->
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
import { useAsyncData } from '#app';
import { useProductStore } from '@/stores/productStore'
  const productStore = useProductStore()

  
  // Carica i prodotti dal server prima del rendering
  const { data: products, pending, error } = await useAsyncData('products', async () => {
    const response = await fetch('/api/products');

    return response.json();
  });
  
  // Popola Pinia con i dati ottenuti
  productStore.products = products;
  </script>
  