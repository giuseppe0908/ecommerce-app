<template>
  <div class="w-[95%] mx-auto my-0">
   
    <div class="buttons flex gap-2 text-xs">
      <div class="undo bg-white w-[60px] h-[30px] flex items-center justify-center">
        <p @click="emit('close');" class="text-xl">X</p>
      </div>
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
        <div class=" w-[412px] h-[626px]">
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
            <select id="category" v-model="product.category.id" required>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="price">Prezzo</label>
            <input type="number" id="price" v-model="product.price"  />
          </div>
          <div class="flex gap-2">
            <div class="form-group flex">
              <label for="promo">Promo</label>
              <input type="checkbox" id="promo" v-model="product.promo" />
            </div>
            <div class="form-group flex">
              <label for="plus">Plus</label>
              <input type="checkbox" id="plus" v-model="product.plus" />
            </div>
         </div>
          <div class="form-group">
            <label for="mainImage">Immagine Principale</label>
            <!-- <input type="text" id="mainImage" v-model="product.images.main" /> -->
            <button @click="updateMainImage">Aggiorna Immagine</button>
          </div>
          <div class="form-group">
            <label for="otherImages">Altre Immagini</label>
            <!-- <input type="text" id="otherImages" v-model="newOtherImage" /> -->
            <button @click="addOtherImage">Aggiungi Immagine</button>
            <ul>
              <!-- <li v-for="(image, index) in product.images.others" :key="index">
                {{ image }}
                <button @click="removeOtherImage(index)">Rimuovi</button>
              </li> -->
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
          <!-- <input type="text" id="mainImage" v-model="product.images.main" required /> -->
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

const emit = defineEmits(['close']); // Definiamo l'emit
const route = useRoute();
const router = useRouter();

const props = defineProps({

  productprops: { type: Object, required: true },

});
const productId = props.productprops.id;

const product = ref({...props.productprops})
const categories = ref([]);

watch(() => props.product, (newProduct) => {
  product.value = { ...newProduct };
});
const fetchCategories = async () => {
  try{
    const response = await fetch('/api/categories');
    if (response.ok) {
      categories.value = await response.json();
    }
  } catch (error) {
    console.error(error);
  }
}
//product.value = props.product;
const img = ref([
  {
    id: 0,
    color: "Rosso",
    images: {
      main: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg", // Immagine principale
      others: [
        "https://imgs.search.brave.com/9lz0DyLBFYJy2tZ8T-nuqLvIEuW2kqDdzwSVzLNJPFM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Ym9yc2FpdGFsaWFu/YS5pdC9ob21lcGFn/ZS9pdGVtLXN0cmlw/cy9wYXJ0bmVyc2hp/cC1maW5hbnphLXNv/c3RlbmliaWxlLndl/YnA","https://imgs.search.brave.com/Hf8WRja9rNLInDTJi98CxnGkaw3FNxTK60_mA1-LP8w/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Ym9yc2FpdGFsaWFu/YS5pdC9ob21lcGFn/ZS9pdGVtLXN0cmlw/cy9pbnZlc3RpbWVu/dGktZmluYW56YS1z/b3N0ZW5pYmlsZS53/ZWJw",
        "https://imgs.search.brave.com/FY4jzaJKU2JGJbnQKBW7c_6pi8tB4eNybSxOC_l8IZ4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Ym9yc2FpdGFsaWFu/YS5pdC9ob21lcGFn/ZS9pdGVtLXN0cmlw/cy9pbnZlc2NvZGlj/ZW1icmUud2VicA",
        "https://imgs.search.brave.com/o1rkiH8BTrsy1dYXh9e5XSwg7NaNvsQvSe4BAWOr9bw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Ym9yc2FpdGFsaWFu/YS5pdC9ob21lcGFn/ZS9pdGVtLXN0cmlw/cy9ldmVudGktZmlu/YW56YS1zb3N0ZW5p/YmlsZS53ZWJw"
      ],
    },
  },
  {
    id: 1,
    color: "Blu",
    images: {
      main: "https://imgs.search.brave.com/rPdVLd8LhZ-b_HmtxgmpQR21h2o4wvWQdZFTs0_B-DA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/c29sZGlvbmxpbmUu/aXQvcGljdHVyZXMv/MjAxOS8wOC8xMi9w/aWF6emEtYWZmYXJp/LW1pbGFuby5qcGVn", // Immagine principale
      others: [
        "https://imgs.search.brave.com/UVvPo40DWHz3xepCyKKkvzYDWqNA2ybh_PQ7y_zvwJI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Ym9yc2FpdGFsaWFu/YS5pdC9ob21lcGFn/ZS9pdGVtLWdhbGxl/cnkvYm9yc2Etdmly/dHVhbGUuanBn",
        "https://imgs.search.brave.com/HCpl-EqzXYvzK1IBM4G-WYMMhGOY-65WhMgttEIupZU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZXJj/YXRpLmlsc29sZTI0/b3JlLmNvbS9zdGF0/aWMvaW1nL2Vjb21t/ZXJjZS9tZXJjYXRp/LXN1YnNjcmliZS5w/bmc",
        "https://imgs.search.brave.com/NhqBwszAM2MatONDXJUsdSnack5aVsvOZqfkiWsdeqs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/c29sZGlvbmxpbmUu/aXQvcGljdHVyZXMv/MjAyNC8wMS8xNi9k/aXZpZGVuZGlfOS5w/bmc",
        "https://imgs.search.brave.com/ssFduhO2tceVJyFXSDelg0NAVO7DxYIIPiC4v_oBUow/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Ym9yc2FpdGFsaWFu/YS5pdC9ob21lcGFn/ZS9pdGVtLXN0cmlw/cy9hY2Nlc3NvLWNh/cGl0YWxpLWZpbmFu/emEtc29zdGVuaWJp/bGUud2VicA" 
      ],
    },
  },
  {
    id: 2,
    color: "Verde",
    images: {
      main: "https://imgs.search.brave.com/nYQn-I6ZcecFyog0kkNR3C_f9gw5FXopetNtwY-4QBA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/c29sZGlvbmxpbmUu/aXQvcGljdHVyZXMv/MjAyMC8wNi8wMi9i/dHBfNS5qcGVn", // Immagine principale
      others: [
        "https://example.com/green1.jpg",
        "https://example.com/green2.jpg",
      ],
    },
  },
]);

const currentColorIndex = ref(0); // Indice della colorazione selezionata
const currentMainImage = ref(img.value[0].images.main); // Immagine principale iniziale
const currentOtherImages = ref(img.value[0].images.others); // Immagini correlate iniziali

const changeColor = (index) => {
  currentColorIndex.value = index;
  const selectedColor = img.value[index];
  currentMainImage.value = selectedColor.images.main;
  currentOtherImages.value = selectedColor.images.others;
};

const changeMainImage = (image) => {
  currentMainImage.value = image;
};

const newOtherImage = ref('');
const showEditModal = ref(false);

const updateProduct = async () => {
  const productDataToUpdate = {
    name: product.value.name,
    price: Number(product.value.price), // Assicurati che il prezzo sia un numero
    categoryId: product.value.category.id, // Invia solo l'ID della categoria
    brandId: product.value.brand.id, // Invia solo l'ID del brand
    genderId: product.value.gender.id, // Invia solo l'ID del genere
    favorite: product.value.favorite === null ? false : Boolean(product.value.favorite), // Converti null in false o usa il valore booleano
    promo: Boolean(product.value.promo),
    plus: Boolean(product.value.plus),
    newArrival: Boolean(product.value.newArrival),
    photo: product.value.photo ? product.value.photo.replace(/[`']/g, '').trim() : undefined, // Pulisci l'URL e invia undefined se vuoto/null
    codeItem: product.value.codeItem,
    percentualPromo: product.value.percentualPromo === null ? undefined : Number(product.value.percentualPromo),
    rating: product.value.rating === null ? undefined : Number(product.value.rating),
    description: product.value.description,
    available_quantity: product.value.available_quantity === null ? undefined : Number(product.value.available_quantity),
    subCategoryId: product.value.subCategoryId,
  };

  // Rimuovi le chiavi con valore undefined per evitare problemi con Zod .optional()
  Object.keys(productDataToUpdate).forEach(key => {
    if (productDataToUpdate[key] === undefined) {
      delete productDataToUpdate[key];
    }
  });


  const response = await fetch(`/api/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productDataToUpdate),
  });

  if (response.ok) {
    alert('Prodotto aggiornato con successo!');
    //router.push('/admin/allproducts');
    emit('close'); // Emettiamo l'evento close dopo il successo
  } else {
    const errorData = await response.json();
    console.error("Errore durante l'aggiornamento:", errorData);
    alert(`Errore durante l'aggiornamento del prodotto: ${errorData.message || response.statusText}`);
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
  //fetchProduct();
  fetchCategories();
});
</script>

<style scoped>
.undo{
  border-radius: 50px;
}
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