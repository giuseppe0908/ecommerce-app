<template>
    <div class="w-[95%] mx-auto md:my-0 ">    
      <div class="buttons flex justify-center md:justify-start gap-4 text-xs">
        <Button name="DONNA" :bgColor="colorPrimary" textColor="white" to="/product?gender=donna"  width="100px" height="30px" fontSize="15px"/>
        <Button name="UOMO" bgColor="white" :textColor="colorPrimary" to="/product?gender=uomo" width="100px" height="30px" fontSize="15px"/>
        <Button name="BAMBINO" :bgColor="colorPrimary" textColor="white" to="/product?gender=bambini"  width="100px" height="30px" fontSize="15px"/>
      </div>
      <div class="navBar">

      </div>
      <div class="cronologia"></div>
     <div class="container flex flex-col md:flex-row gap-12 mt-8">
    <!-- Sezione sinistra: immagini (responsive) -->
    <div class="left flex flex-1 md:max-w-[500px] flex-col md:flex-row md:gap-2">
      <!-- Colonna verticale delle miniature (solo desktop) -->
      <div class="imgVertical hidden md:flex flex-col gap-4">
        <img
          v-for="(image, index) in currentOtherImages"
          :key="index"
          class="img square h-[138px] w-[136px] rounded-xl cursor-pointer"
          :src="image"
          :alt="'Immagine correlata ' + index"
          @click="changeMainImage(image)"
        />
      </div>

      <!-- Immagine principale (con carousel su mobile) -->
      <div class="image-container relative w-full md:w-[412px] md:h-[605px] max-w-[500px] mx-auto">
        <img
          ref="mainImageRef"
          class="w-full h-auto md:h-full aspect-square md:aspect-auto rounded-xl select-none object-cover"
          :src="currentMainImage"
          alt="Immagine principale"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
          @dragstart.prevent
        />
        
        <!-- Frecce di navigazione (solo mobile) -->
        <button
          v-if="currentImageIndex > 0"
          @click="previousImage"
          class="nav-arrow nav-arrow-left flex absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 md:hidden"
        >
          <svg class="w-6 h-6 text-[#5D758B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        
        <button
          v-if="currentImageIndex < allImages.length - 1"
          @click="nextImage"
          class="nav-arrow nav-arrow-right flex absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 md:hidden"
        >
          <svg class="w-6 h-6 text-[#5D758B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
      
      <!-- Indicatori (solo mobile) -->
      <div class="image-indicators flex justify-center mt-4 gap-2 md:hidden">
        <button
          v-for="(image, index) in allImages"
          :key="index"
          class="indicator-dot w-3 h-3 rounded-full transition-all duration-200"
          :class="currentImageIndex === index ? 'bg-[#5D758B]' : 'bg-gray-300'"
          @click="goToImage(index)"
        ></button>
      </div>
    </div>

    <!-- Sezione destra: descrizioni, colori, disponibilità, bottoni -->
    <div class="right flex-1">
      <div class="descriptions">
        <div class="brand font-bold text-black text-3xl">
          <p>{{ product.brand.name }}</p>
        </div>
        <div class="name text-[#5D758B] text-2xl">
          <p>{{ product.name }}</p>
        </div>
        <div class="price text-2xl">
          <span class="flex items-center">
            {{ product.price }} <p class="text-[#5D758B]">€ IVA inclusa</p>
          </span>
        </div>
        <div class="color">
          colore: {{ img[currentColorIndex].color }}
        </div>
      </div>
      
      <!-- Miniature delle colorazioni -->
      <div class="color-thumbnails flex gap-2 items-center mt-4 overflow-x-auto">
        <img
          v-for="(item, id) in img"
          :key="item.id"
          :src="item.images.main"
          :alt="'Colorazione ' + item.color"
          class="thumbnail cursor-pointer square h-[138px] w-[103px] md:w-[136px] rounded-xl cursor-pointer border"
          :class="{ active: id === currentColorIndex }"
          @click="changeColor(id)"
        />
      </div>
      
      <div class="disponibility mt-4 p-3 bg-gray-100 rounded-lg">
        <p v-if="stockQuantity > 5" class="text-green-600">Disponibile - Spedizione in 24/48h</p>
        <p v-else-if="stockQuantity > 0" class="text-orange-500">Solo {{ stockQuantity }} disponibili!</p>
        <p v-else class="text-red-500">Prodotto esaurito</p>
      </div>
      
      <div class="buttons flex gap-4 mt-4">
        <Button name="Acquista" bgColor="white" textColor="#5D758B" width="200px" height="50px" @click="addCart" to="/checkout"/>
        <Button name="Aggiungi al carrello" :bgColor="colorPrimary" textColor="white" width="200px" height="50px" @click="addCart"/>
        <button 
          @click="toggleWishlist"
          class="wishlist-button flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 hover:border-red-500 transition-colors"
          :class="{ 'bg-red-50': isInWishlist }"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 wishlist-heart-icon" :fill="isInWishlist ? colorPrimary : 'none'" viewBox="0 0 24 24" :stroke="colorPrimary">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
      
      <!-- Specifiche tecniche -->
      <div class="technical-specs mt-8 border-t pt-4">
        <h3 class="text-xl font-semibold mb-3">Specifiche tecniche</h3>
        <div class="specs-grid grid grid-cols-2 gap-3">
          <div v-for="(spec, index) in productSpecs" :key="index" class="spec-item">
            <span class="font-medium">{{ spec.name }}:</span> {{ spec.value }}
          </div>
        </div>
      </div>
    </div>
  </div>
      
  <!-- Recensioni -->
  <div class="reviews-section mt-12 border-t pt-6">
    <ReviewComponent :productId="productId" :reviews="productReviews" :averageRating="averageRating" />
  </div>
  
  <!-- Prodotti correlati -->
  <div class="related-products mt-12 border-t pt-6" v-if="relatedProducts && relatedProducts.length > 0">
    <div class="products-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:grid-cols-4 gap-10">
      <Card 
        v-for="(product, index) in relatedProducts.slice(0, 4)"
        :key="index"
        :id="product.id" 
        :category="product.category" 
        :brand="product.brand"
        :name="product.name"
        :photo="product.photo"
        :description="product.description"
        :price="product.price"
        :plus="product.plus"
        :promo="product.promo"
        :codeItem="product.codeItem"
        :colorPrimary="colorPrimary"
        :colorSecondary="colorSecondary"
      />
    </div>
  </div>
</div>
</template>
  
  
  <script setup>
  import { useRoute } from 'vue-router'
  import { ref, onMounted, computed } from 'vue'
  import { useWishlistStore } from '~/stores/wishlistStore'
  import { useToast } from 'vue-toastification'

  // Definisci il prodotto come un ref
  const product = ref([])
  const route = useRoute()
  const colorPrimary = "#5D758B";
  const colorSecondary = "#00192F";
  
  // Initialize wishlist store
  const wishlistStore = useWishlistStore();
  
  const productId = route.params.id
  const { data } = await useFetch(`/api/products/${productId}`);
  product.value = data.value || [];
  
  // Immagini e colori del prodotto
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

  // Stato per la gestione delle immagini e colori
  const currentColorIndex = ref(0); // Indice della colorazione selezionata
  const currentMainImage = ref(img.value[0].images.main); // Immagine principale iniziale
  const currentOtherImages = ref(img.value[0].images.others); // Immagini correlate iniziali

  // Disponibilità del prodotto (simulata)
  const stockQuantity = ref(3);

  // Specifiche tecniche del prodotto
  const productSpecs = ref([
    { name: 'Materiale', value: 'Cotone 100%' },
    { name: 'Paese di produzione', value: 'Italia' },
    { name: 'Istruzioni di lavaggio', value: 'Lavabile in lavatrice a 30°' },
    { name: 'Codice articolo', value: product.value.id || 'N/A' }
  ]);

  // Recensioni del prodotto
  const productReviews = ref([]);
  const averageRating = ref(0);

  // Prodotti correlati
  const relatedProducts = ref([]);

  // Funzioni per la gestione delle immagini e colori
  function changeMainImage(image) {
    currentMainImage.value = image;
    // Sincronizza l'indice con il carousel
    const imageIndex = allImages.value.findIndex(img => img === image);
    if (imageIndex !== -1) {
      currentImageIndex.value = imageIndex;
    }
  }

  function changeColor(index) {
    currentColorIndex.value = index;
    currentMainImage.value = img.value[index].images.main;
    currentOtherImages.value = img.value[index].images.others;
    // Reset dell'indice dell'immagine quando si cambia colore
    currentImageIndex.value = 0;
  }

  // Funzione per aggiungere al carrello
  const cartStore = useCartStore();
  
  function addCart() {
    const selectedProduct = {
      codeItem: product.value.id,
      name: product.value.name,
      price: product.value.price,
      brand: product.value.brand,
      color: img.value[currentColorIndex.value].color,
      image: currentMainImage.value
    };
    
    cartStore.addtocart(selectedProduct);
    // Feedback visivo per l'utente
     // Feedback visivo per l'utente - sostituiamo l'alert con una notifica più elegante
    const toast = useToast();
    toast.success('Prodotto aggiunto al carrello!', {
      position: 'top-right',
      duration: 3000
    });
  }

  // Check if product is in wishlist
  const isInWishlist = computed(() => {
    return wishlistStore.isInWishlist(product.value.id);
  });

  // Toggle product in wishlist
  function toggleWishlist() {
    const productToToggle = {
      id: product.value.id,
      name: product.value.name,
      price: product.value.price,
      brand: product.value.brand,
      img: currentMainImage.value
    };
    
    // Aggiungi una classe per l'animazione all'icona del cuore
    const heartIcon = document.querySelector('.wishlist-heart-icon');
    if (heartIcon) {
      heartIcon.classList.add('heart-pulse');
      setTimeout(() => {
        heartIcon.classList.remove('heart-pulse');
      }, 500);
    }
    
    wishlistStore.toggleWishlistItem(productToToggle);
    
    // Show feedback to user
    const toast = useToast();
    if (isInWishlist.value) {
      toast.info('Prodotto rimosso dai preferiti', {
        position: 'top-right',
        duration: 2000
      });
    } else {
      toast.success('Prodotto aggiunto ai preferiti', {
        position: 'top-right',
        duration: 2000
      });
    }
  }

  // Touch/Swipe handling per tutti i dispositivi
  const touchStartX = ref(0);
  const touchEndX = ref(0);
  const minSwipeDistance = 50;
  const isTouchDevice = ref(false);

  function handleTouchStart(e) {
    // Attiva su tutti i dispositivi
    touchStartX.value = e.touches[0].clientX;
    isTouchDevice.value = true;
  }

  function handleTouchMove(e) {
    // Previene lo scroll durante il swipe su tutti i dispositivi
    if (isTouchDevice.value) {
      e.preventDefault();
    }
  }

  function handleTouchEnd(e) {
    // Gestisce il swipe su tutti i dispositivi
    if (isTouchDevice.value) {
      touchEndX.value = e.changedTouches[0].clientX;
      handleSwipe();
    }
    isTouchDevice.value = false;
  }

  function handleSwipe() {
    const swipeDistance = touchStartX.value - touchEndX.value;
    
    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swipe left - next image
        nextImage();
      } else {
        // Swipe right - previous image
        previousImage();
      }
    }
  }

  // Computed per tutte le immagini (principale + altre)
  const allImages = computed(() => {
    const current = img.value[currentColorIndex.value];
    return [current.images.main, ...current.images.others];
  });

  // Indice dell'immagine corrente
  const currentImageIndex = ref(0);

  // Funzioni di navigazione per tablet/mobile
  function nextImage() {
    if (currentImageIndex.value < allImages.value.length - 1) {
      currentImageIndex.value++;
      currentMainImage.value = allImages.value[currentImageIndex.value];
    }
  }

  function previousImage() {
    if (currentImageIndex.value > 0) {
      currentImageIndex.value--;
      currentMainImage.value = allImages.value[currentImageIndex.value];
    }
  }

  function goToImage(index) {
    currentImageIndex.value = index;
    currentMainImage.value = allImages.value[index];
  }

  // Caricamento delle recensioni
  onMounted(async () => {
    // Initialize wishlist
    wishlistStore.initWishlist();
    
    try {
      // Carica recensioni
      const { data: reviewsData } = await useFetch(`/api/reviews/${productId}`);
      if (reviewsData.value) {
        productReviews.value = reviewsData.value;
        
        // Calcola la media delle valutazioni
        if (productReviews.value.length > 0) {
          const sum = productReviews.value.reduce((total, review) => total + review.rating, 0);
          averageRating.value = sum / productReviews.value.length;
        }
      }
      
      // Carica prodotti correlati
      const { data: relatedData } = await useFetch(`/api/products/related/${productId}`);
      if (relatedData.value) {
       // relatedProducts.value = relatedData.value.slice(0, 4); // Limita a 4 prodotti correlati  
       console.log(relatedData.value);
        relatedProducts.value = relatedData.value;
        console.log(relatedProducts.value);
              
      } else {
        // Prodotti correlati di fallback se l'API non restituisce dati
        relatedProducts.value = [
          {
            id: '1',
            name: 'Prodotto correlato 1',
            price: 59.99,
            brand: { name: 'Brand A' },
            photo: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg'
          },
          {
            id: '2',
            name: 'Prodotto correlato 2',
            price: 79.99,
            brand: { name: 'Brand B' },
            photo: 'https://imgs.search.brave.com/rPdVLd8LhZ-b_HmtxgmpQR21h2o4wvWQdZFTs0_B-DA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/c29sZGlvbmxpbmUu/aXQvcGljdHVyZXMv/MjAxOS8wOC8xMi9w/aWF6emEtYWZmYXJp/LW1pbGFuby5qcGVn'
          }
        ];
      }
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
    }
  });
</script>

<style scoped>
.thumbnail.active {
  border: 2px solid #5D758B;
  box-shadow: 0 0 5px rgba(93, 117, 139, 0.5);
}

.spec-item {
  padding: 8px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.product-card {
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

/* Animazione per l'icona del cuore quando viene cliccata */
.heart-pulse {
  animation: pulse 0.5s ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
</style>
  
