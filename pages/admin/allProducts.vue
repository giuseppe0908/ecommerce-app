<template>
  <div class="bg-orange-600" :class="{ 'opacity-50': showEditModal }">
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
            :codeItem="product.codeItem"
            :brand="product.brand"
            :onCardClick="handleCardClick"
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
  <div v-if="showEditModal" class="fixed fixed-overlay inset-0 flex items-center justify-center">
    <SingleProduct :productprops="selectedProduct" @close="closeEditModal" />
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
import SingleProduct from '../components/Product/SingleProduct.vue';
import { useAuthStore } from '~/stores/authStore'

definePageMeta({
  middleware: [
    'auth',   // Controlla autenticazione
  ]
})
const authStore = useAuthStore()

// Verifica l'autenticazione all'avvio dell'app
onMounted(() => {  
  authStore.initialize()
  console.log('authStore', authStore.token);
  
})
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

const closeEditModal = () => {
  showEditModal.value = false;
};

const confirmDeleteProduct = (productId) => {
  productIdToDelete.value = productId;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
};

const deleteProduct = async () => {
  // Logica per eliminare il prodotto
  await fetch(`/api/products/${productIdToDelete.value}`, {
    method: 'DELETE',
  });
  products.value = products.value.filter(product => product.id !== productIdToDelete.value);
  closeDeleteModal();
};

const handleCardClick = (event) => {
  // Blocca l'evento se necessario
  event.preventDefault();
  event.stopPropagation();
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
  const updatedProduct = await response.json();
  const index = products.value.findIndex(product => product.id === updatedProduct.id);
  products.value[index] = updatedProduct;
  closeEditModal();
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

.fixed-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10;
}
</style>