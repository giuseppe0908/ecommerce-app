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
  
  const newProduct = ref({ name: '', price: 0 });
  const showAddProductForm = ref(false);
  
  const addProduct = () => {
    const newId = products.value.length ? products.value[products.value.length - 1].id + 1 : 1;
    products.value.push({ ...newProduct.value, id: newId });
    newProduct.value = { name: '', price: 0 };
    showAddProductForm.value = false;
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