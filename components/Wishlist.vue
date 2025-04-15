<script setup>
import { useWishlistStore } from '~/stores/wishlistStore';
import { useCartStore } from '~/stores/cartStore';
import { onMounted, ref } from 'vue';
import { useToast } from 'vue-toastification';

const wishlistStore = useWishlistStore();
const cartStore = useCartStore();
const toast = useToast();

const loading = ref(false);
const error = ref(null);

// Initialize wishlist from API or localStorage on component mount
onMounted(async () => {
  loading.value = true;
  try {
    // Assicurati che il pannello sia chiuso PRIMA dell'inizializzazione
    wishlistStore.isWishlistOpen = false;
    await wishlistStore.initWishlist();
    // Assicurati che il pannello rimanga chiuso anche DOPO l'inizializzazione
    wishlistStore.isWishlistOpen = false;
    error.value = null;
  } catch (err) {
    console.error('Errore durante il caricamento dei preferiti:', err);
    error.value = 'Si è verificato un errore durante il caricamento dei preferiti';
  } finally {
    loading.value = false;
  }
});

// Method to remove item from wishlist
const removeFromWishlist = async (productId) => {
  try {
    await wishlistStore.removeFromWishlist(productId);
    toast.success('Prodotto rimosso dai preferiti');
  } catch (err) {
    console.error('Errore durante la rimozione dai preferiti:', err);
    toast.error('Impossibile rimuovere il prodotto dai preferiti');
  }
};

// Method to close wishlist sidebar
const closeWishlist = () => {
  wishlistStore.toggleWishlistSidebar();
};

// Method to add product to cart
const addToCart = (product) => {
  const selectedProduct = {
    codeItem: product.id,
    name: product.name,
    price: product.price,
    brand: product.brand?.name,
    image: product.photo || product.img
  };
  
  cartStore.addtocart(selectedProduct);
  toast.success('Prodotto aggiunto al carrello!');
};

// Retry loading wishlist in case of error
const retryLoading = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    await wishlistStore.initWishlist();
  } catch (err) {
    console.error('Errore durante il caricamento dei preferiti:', err);
    error.value = 'Si è verificato un errore durante il caricamento dei preferiti';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div
    v-if="wishlistStore.isWishlistOpen" 
    class="wishlist-sidebar fixed top-0 right-0 h-full bg-white shadow-lg z-50 transition-transform duration-300 overflow-y-auto"
    :class="{ 'translate-x-0': wishlistStore.isWishlistOpen, 'translate-x-full': !wishlistStore.isWishlistOpen }"
    style="width: 400px; max-width: 90vw;"
  >
    <!-- Wishlist Header -->
    <div class="wishlist-header p-4 border-b flex justify-between items-center">
      <h2 class="text-xl font-bold">I miei preferiti ({{ wishlistStore.wishlistCount }})</h2>
      <button @click="closeWishlist" class="text-gray-500 hover:text-gray-700">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <!-- Wishlist Content -->
    <div class="wishlist-content p-4">
      <div v-if="wishlistStore.wishlist.length === 0" class="empty-wishlist text-center py-8">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <p class="text-gray-500 mb-4">La tua lista dei preferiti è vuota</p>
        <p class="text-sm text-gray-400">Aggiungi prodotti che ti piacciono cliccando sull'icona del cuore</p>
      </div>
      
      <div v-else class="wishlist-items space-y-4">
        <div 
          v-for="item in wishlistStore.wishlist" 
          :key="item.id"
          class="wishlist-item flex border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
        >
          <!-- Product Image -->
          <div class="wishlist-item-image w-24 h-24 flex-shrink-0">
            <img :src="item.img || 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg'" :alt="item.name" class="w-full h-full object-cover">
          </div>
          
          <!-- Product Info -->
          <div class="wishlist-item-info flex-grow p-3">
            <div class="flex justify-between">
              <div>
                <p class="font-bold text-sm">{{ item.brand?.name || 'Brand' }}</p>
                <p class="text-sm">{{ item.name }}</p>
                <p class="text-sm font-semibold mt-1">{{ item.price }} €</p>
              </div>
              
              <!-- Actions -->
              <div class="flex flex-col space-y-2">
                <button 
                  @click="removeFromWishlist(item.id)"
                  class="text-gray-400 hover:text-red-500 transition-colors"
                  title="Rimuovi dai preferiti"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button 
                  @click="addToCart(item)"
                  class="text-gray-400 hover:text-green-500 transition-colors mt-2"
                  title="Aggiungi al carrello"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- View Product Button -->
            <NuxtLink 
              :to="`/product/${item.id}`" 
              class="mt-2 inline-block text-sm text-blue-600 hover:underline"
            >
              Visualizza prodotto
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Wishlist Footer -->
    <div v-if="wishlistStore.wishlist.length > 0" class="wishlist-footer p-4 border-t">
      <button 
        @click="wishlistStore.clearWishlist()"
        class="w-full py-2 text-sm text-red-600 hover:text-red-800 transition-colors"
      >
        Svuota lista preferiti
      </button>
    </div>
  </div>
  
  <!-- Overlay -->
  <div 
    v-if="wishlistStore.isWishlistOpen"
    class="fixed inset-0 bg-black bg-opacity-50 z-40"
    @click="closeWishlist"
  ></div>
</template>

<style scoped>
.wishlist-sidebar {
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
}
</style>