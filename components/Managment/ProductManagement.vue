<template>
    <div>
      <h2>Gestione Prodotti</h2>
      <button @click="showAddProductForm = true">Aggiungi Prodotto</button>
  
      <div v-if="showAddProductForm">
        <h3>Aggiungi Prodotto</h3>
        <form @submit.prevent="addProduct">
          <div class="form-group">
            <label for="name">Nome</label>
            <input type="text" id="name" v-model="newProduct.name" required />
          </div>
          <div class="form-group">
            <label for="price">Prezzo</label>
            <input type="number" id="price" v-model="newProduct.price" required />
          </div>
          <button type="submit">Aggiungi</button>
        </form>
      </div>
  
      <h3>Lista Prodotti</h3>
      <ul>
        <li v-for="product in products" :key="product.id">
          {{ product.name }} - {{ product.price }}€
          <button @click="editProduct(product)">Modifica</button>
          <button @click="deleteProduct(product.id)">Elimina</button>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const products = ref([
    { id: 1, name: 'Prodotto 1', price: 10 },
    { id: 2, name: 'Prodotto 2', price: 20 },
  ]);
  
  const newProduct = ref({
    name: 'ciao',
    categoryId: 3,
    brandId: 3,
    genderId: 1,
    favorite: true,
    promo: false,
    plus: true,
    newArrival: true,
    price: 29.99,
    photo: 'https://images.pexels.com/photos/4041689/pexels-photo-4041689.jpeg',
    codeItem: 'CXc233',
    percentualPromo: 10,
    rating: 4.5,
    available_quantity: 10,
    description: 'ciao'
  });
  const showAddProductForm = ref(false);
  
  const addProduct = async () => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProduct.value)
      });
  
      if (!response.ok) {
        throw new Error('Errore nella creazione del prodotto');
      }
  
      const result = await response.json();
      console.log('Prodotto creato:', result);
      showAddProductForm.value = false;
    } catch (error) {
      console.error('Errore:', error);
    }
  };
  
  const editProduct = (product) => {
    // Logica per modificare il prodotto
  };
  
  const deleteProduct = (id) => {
    products.value = products.value.filter(product => product.id !== id);
  };
  </script>
  
  <style scoped>
  .form-group {
    margin-bottom: 10px;
  }
  
  button {
    margin-right: 10px;
  }
  </style>