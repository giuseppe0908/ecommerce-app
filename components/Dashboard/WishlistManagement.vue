<template>
  <div class="wishlist-management bg-white rounded-lg shadow-md p-6 mb-6">
    <h3 class="text-xl font-bold mb-4">I miei preferiti</h3>
    
    <div v-if="isLoading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
    
    <div v-else-if="wishlistStore.wishlist.length === 0" class="text-center py-8">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <p class="text-gray-500 mb-2">La tua lista dei preferiti è vuota</p>
      <NuxtLink to="/catalog" class="text-blue-600 hover:underline">Esplora il catalogo</NuxtLink>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Wishlist Items -->
      <div 
        v-for="item in wishlistStore.wishlist" 
        :key="item.id"
        class="wishlist-item border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
      >
        <div class="relative">
          <!-- Product Image -->
          <img 
            :src="item.img || 'https://via.placeholder.com/300x200'" 
            :alt="item.name" 
            class="w-full h-48 object-cover"
          >
          
          <!-- Remove Button -->
          <button 
            @click="removeFromWishlist(item.id)" 
            class="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:bg-red-50 transition-colors"
            title="Rimuovi dai preferiti"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Product Info -->
        <div class="p-4">
          <p class="text-sm text-gray-500">{{ item.brand?.name || 'Brand' }}</p>
          <h4 class="font-medium mb-2 truncate">{{ item.name }}</h4>
          <div class="flex justify-between items-center">
            <p class="font-bold">{{ item.price }} €</p>
            <NuxtLink 
              :to="`/product/${item.id}`" 
              class="text-sm text-blue-600 hover:underline"
            >
              Visualizza
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Clear Wishlist Button -->
    <div v-if="wishlistStore.wishlist.length > 0" class="mt-6 text-center">
      <button 
        @click="confirmClearWishlist" 
        class="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
      >
        Svuota lista preferiti
      </button>
    </div>
    
    <!-- Confirmation Modal -->
    <div v-if="showConfirmation" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md mx-4">
        <h4 class="text-lg font-bold mb-4">Conferma eliminazione</h4>
        <p class="mb-6">Sei sicuro di voler svuotare la tua lista dei preferiti? Questa azione non può essere annullata.</p>
        <div class="flex justify-end space-x-3">
          <button 
            @click="showConfirmation = false" 
            class="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Annulla
          </button>
          <button 
            @click="clearWishlist" 
            class="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
          >
            Conferma
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useWishlistStore } from '~/stores/wishlistStore';
import { useToast } from 'vue-toastification';

const wishlistStore = useWishlistStore();
const toast = useToast();
const isLoading = ref(true);
const showConfirmation = ref(false);

// Initialize wishlist from localStorage on component mount
onMounted(() => {
  wishlistStore.initWishlist();
  // Simulate loading
  setTimeout(() => {
    isLoading.value = false;
  }, 500);
});

// Method to remove item from wishlist
const removeFromWishlist = (productId) => {
  wishlistStore.removeFromWishlist(productId);
  toast.info('Prodotto rimosso dai preferiti', {
    position: 'top-right',
    duration: 2000
  });
};

// Show confirmation before clearing wishlist
const confirmClearWishlist = () => {
  showConfirmation.value = true;
};

// Clear entire wishlist
const clearWishlist = () => {
  wishlistStore.clearWishlist();
  showConfirmation.value = false;
  toast.info('Lista preferiti svuotata', {
    position: 'top-right',
    duration: 2000
  });
};
</script>

<style scoped>
.wishlist-item {
  transition: all 0.3s ease;
}

.wishlist-item:hover {
  transform: translateY(-2px);
}
</style>