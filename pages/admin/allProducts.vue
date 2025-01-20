<template>
  <div class="bg-orange-600">
    <div class="w-[95%] mx-auto">
      <h1>Lista di tutti i prodotti</h1>
      <div class="productGrid grid grid-cols-2 gap-8 containerGrid md:grid-cols-6">
        <div v-for="product in products" :key="product.id" class="relative">
          <Card
            :id="product.id"
            :name="product.name"
            :img="product.photo"
            :promo="product.promo"
            :plus="product.plus"
            :price="product.price"
            :category="product.category"
            colorPrimary="#5D758B"
            colorSecondary="#00192F"
          />
          <div class="absolute top-2 right-2 flex gap-2">
            <button @click="editProduct(product)" class="bg-blue-500 text-white px-2 py-1 rounded">Modifica</button>
            <button @click="confirmDeleteProduct(product.id)" class="bg-red-500 text-white px-2 py-1 rounded">Elimina</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modale per la modifica del prodotto -->
  <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <!-- <div class="bg-white p-6 rounded">
      <h2>Modifica Prodotto</h2>
      <form @submit.prevent="updateProduct">
        <div class="form-group">
          <label for="name">Nome</label>
          <input type="text" id="name" v-model="selectedProduct.name" required />
        </div>
        <div class="form-group">
          <label for="price">Prezzo</label>
          <input type="number" id="price" v-model="selectedProduct.price" required />
        </div>
        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Salva</button>
        <button @click="closeEditModal" class="bg-gray-500 text-white px-4 py-2 rounded">Annulla</button>
      </form>
    </div> -->
    <SigleProduct :product="selectedProduct" @close="closeEditModal" />
  </div>

  <!-- Modale per la conferma dell'eliminazione -->
  <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-white p-6 rounded">
      <h2>Sei sicuro di voler eliminare questo prodotto?</h2>
      <button @click="deleteProduct" class="bg-red-500 text-white px-4 py-2 rounded">Elimina</button>
      <button @click="closeDeleteModal" class="bg-gray-500 text-white px-4 py-2 rounded">Annulla</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useFetch } from 'nuxt/app';
import Card from '../components/Card.vue';

const response = await useFetch('/api/products');
const products = response.data.value;

const showEditModal = ref(false);
const showDeleteModal = ref(false);
const selectedProduct = ref(null);
const productIdToDelete = ref(null);

const editProduct = (product) => {
  selectedProduct.value = { ...product };
  showEditModal.value = true;
};

const updateProduct = async () => {
  // Logica per aggiornare il prodotto
  const response = await fetch(`/api/products/${selectedProduct.value.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(selectedProduct.value),
  });

  if (response.ok) {
    const updatedProduct = await response.json();
    const index = products.value.findIndex(p => p.id === updatedProduct.id);
    products.value[index] = updatedProduct;
    closeEditModal();
  }
};

const confirmDeleteProduct = (id) => {
  productIdToDelete.value = id;
  showDeleteModal.value = true;
};

const deleteProduct = async () => {
  // Logica per eliminare il prodotto
  const response = await fetch(`/api/products/${productIdToDelete.value}`, {
    method: 'DELETE',
  });

  if (response.ok) {
    products.value = products.value.filter(p => p.id !== productIdToDelete.value);
    closeDeleteModal();
  }
};

const closeEditModal = () => {
  showEditModal.value = false;
  selectedProduct.value = null;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  productIdToDelete.value = null;
};
</script>

<style scoped>
.productGrid {
  position: relative;
}

button {
  cursor: pointer;
}

.form-group {
  margin-bottom: 10px;
}

.fixed {
  position: fixed;
}

.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.bg-black {
  background-color: black;
}

.bg-opacity-50 {
  opacity: 0.5;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.bg-white {
  background-color: white;
}

.p-6 {
  padding: 1.5rem;
}

.rounded {
  border-radius: 0.375rem;
}

.bg-blue-500 {
  background-color: #4299e1;
}

.bg-red-500 {
  background-color: #f56565;
}

.bg-gray-500 {
  background-color: #a0aec0;
}

.text-white {
  color: white;
}

.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.py-1 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.rounded {
  border-radius: 0.375rem;
}
</style>