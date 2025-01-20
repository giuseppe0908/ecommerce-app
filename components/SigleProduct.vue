<template>
  <div class="w-[95%] mx-auto my-0">
    <div class="buttons flex gap-2 text-xs">
      <Button name="DONNA" :bgColor="colorPrimary" colorText="white" to="/donna" leftRadius="true" width="100px" height="30px" />
      <Button name="UOMO" bgColor="white" :colorText="colorPrimary" to="/uomo" leftRadius="true" width="100px" height="30px" />
      <Button name="BAMBINO" :bgColor="colorPrimary" colorText="white" to="/bambino" leftRadius="true" width="100px" height="30px" />
    </div>
    <div class="navBar"></div>
    <div class="cronologia"></div>
    <div class="container flex gap-12 mt-8">
      <div class="left flex gap-2">
        <!-- Colonna delle immagini -->
        <div class="imgVertical flex flex-col gap-4">
          <img
            v-for="(image, index) in currentOtherImages"
            :key="index"
            class="img square h-[138px] w-[136px] rounded-xl cursor-pointer"
            :src="image"
            :alt="'Immagine correlata ' + index"
            @click="changeMainImage(image)"
          />
        </div>

        <!-- Immagine principale -->
        <div class="card w-[412px] h-[626px]">
          <img class="w-full h-full rounded-xl cursor-pointer" :src="currentMainImage" alt="Immagine principale" @click="editMainImage" />
        </div>
      </div>

      <!-- Form di modifica del prodotto -->
      <div class="right flex-1">
        <h2>Modifica Prodotto</h2>
        <form @submit.prevent="updateProduct">
          <div class="form-group">
            <label for="name">Nome</label>
            <input type="text" id="name" v-model="product.name" required />
          </div>
          <div class="form-group">
            <label for="category">Categoria</label>
            <input type="text" id="category" v-model="product.category" required />
          </div>
          <div class="form-group">
            <label for="price">Prezzo</label>
            <input type="number" id="price" v-model="product.price" required />
          </div>
          <div class="form-group">
            <label for="promo">Promo</label>
            <input type="text" id="promo" v-model="product.promo" />
          </div>
          <div class="form-group">
            <label for="plus">Plus</label>
            <input type="text" id="plus" v-model="product.plus" />
          </div>
          <div class="form-group">
            <label for="mainImage">Immagine Principale</label>
            <input type="text" id="mainImage" v-model="product.images.main" />
            <button @click="updateMainImage">Aggiorna Immagine</button>
          </div>
          <div class="form-group">
            <label for="otherImages">Altre Immagini</label>
            <input type="text" id="otherImages" v-model="newOtherImage" />
            <button @click="addOtherImage">Aggiungi Immagine</button>
            <ul>
              <li v-for="(image, index) in product.images.others" :key="index">
                {{ image }}
                <button @click="removeOtherImage(index)">Rimuovi</button>
              </li>
            </ul>
          </div>
          <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Salva</button>
        </form>
      </div>
    </div>
  </div>

  <!-- Modale per la modifica dell'immagine principale -->
  <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-white p-6 rounded">
      <h2>Modifica Immagine Principale</h2>
      <form @submit.prevent="updateMainImage">
        <div class="form-group">
          <label for="mainImage">URL Immagine</label>
          <input type="text" id="mainImage" v-model="product.images.main" required />
        </div>
        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Salva</button>
        <button @click="closeEditModal" class="bg-gray-500 text-white px-4 py-2 rounded">Annulla</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from '../components/Button.vue';

const route = useRoute();
const router = useRouter();
const productId = route.params.id;

const product = ref({
  name: '',
  category: '',
  price: 0,
  promo: '',
  plus: '',
  images: {
    main: '',
    others: [],
  },
});

const newOtherImage = ref('');
const showEditModal = ref(false);

const fetchProduct = async () => {
  const response = await fetch(`/api/products/${productId}`);
  if (response.ok) {
    product.value = await response.json();
  }
};

const updateProduct = async () => {
  const response = await fetch(`/api/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product.value),
  });

  if (response.ok) {
    alert('Prodotto aggiornato con successo!');
    router.push('/all-products');
  }
};

const updateMainImage = async () => {
  const response = await fetch(`/api/products/${productId}/update-main-image`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mainImage: product.value.images.main }),
  });

  if (response.ok) {
    alert('Immagine principale aggiornata con successo!');
    closeEditModal();
  }
};

const addOtherImage = () => {
  if (newOtherImage.value) {
    product.value.images.others.push(newOtherImage.value);
    newOtherImage.value = '';
  }
};

const removeOtherImage = (index) => {
  product.value.images.others.splice(index, 1);
};

const editMainImage = () => {
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
};

onMounted(() => {
  fetchProduct();
});
</script>

<style scoped>
.edit-product-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
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

.bg-gray-500 {
  background-color: #a0aec0;
}

.text-white {
  color: white;
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