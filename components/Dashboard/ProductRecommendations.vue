<template>
  <div class="product-recommendations bg-white rounded-lg shadow-md p-6 mb-6">
    <h3 class="text-xl font-bold mb-4">Consigliati per te</h3>
    
    <div v-if="isLoading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
    
    <div v-else-if="recommendations.length === 0" class="text-center py-8">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-gray-500 mb-2">Nessun prodotto consigliato al momento</p>
      <NuxtLink to="/catalog" class="text-blue-600 hover:underline">Esplora il catalogo</NuxtLink>
    </div>
    
    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Product Cards -->
        <div 
          v-for="product in recommendations" 
          :key="product.id"
          class="product-card border rounded-lg overflow-hidden hover:shadow-md transition-all"
        >
          <div class="relative">
            <!-- Product Image -->
            <img 
              :src="product.image" 
              :alt="product.name" 
              class="w-full h-48 object-cover"
            >
            
            <!-- Wishlist Button -->
            <button 
              @click="toggleWishlist(product)" 
              class="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:bg-red-50 transition-colors"
              :title="isInWishlist(product.id) ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :class="isInWishlist(product.id) ? 'text-red-500 fill-current' : 'text-gray-400'" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
          
          <!-- Product Info -->
          <div class="p-4">
            <p class="text-sm text-gray-500">{{ product.brand?.name || 'Brand' }}</p>
            <h4 class="font-medium mb-2 truncate">{{ product.name }}</h4>
            <div class="flex justify-between items-center">
              <p class="font-bold">{{ product.price }} €</p>
              <NuxtLink 
                :to="`/product/${product.id}`" 
                class="text-sm text-blue-600 hover:underline"
              >
                Visualizza
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useWishlistStore } from '~/stores/wishlistStore';
import { useToast } from 'vue-toastification';

const props = defineProps({
  userId: {
    type: Number,
    required: true
  }
});

const wishlistStore = useWishlistStore();
const toast = useToast();
const recommendations = ref([]);
const isLoading = ref(true);

// Initialize wishlist and fetch recommendations
onMounted(() => {
  wishlistStore.initWishlist();
  fetchRecommendations();
});

// Check if product is in wishlist
const isInWishlist = (productId) => {
  return wishlistStore.isInWishlist(productId);
};

// Toggle product in wishlist
const toggleWishlist = (product) => {
  const productToToggle = {
    id: product.id,
    name: product.name,
    price: product.price,
    brand: product.brand,
    img: product.image
  };
  
  wishlistStore.toggleWishlistItem(productToToggle);
  
  // Show feedback to user
  if (isInWishlist(product.id)) {
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
};

// Fetch product recommendations
const fetchRecommendations = async () => {
  try {
    // In a real implementation, you would fetch recommendations from an API
    // const { data } = await useFetch(`/api/recommendations/${props.userId}`);
    // recommendations.value = data.value || [];
    
    // For now, we'll use mock data
    setTimeout(() => {
      recommendations.value = [
        {
          id: 101,
          name: 'Sneakers Nike Air Max',
          price: 129.99,
          image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg',
          brand: { name: 'Nike' }
        },
        {
          id: 102,
          name: 'T-Shirt Premium',
          price: 39.95,
          image: 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg',
          brand: { name: 'Adidas' }
        },
        {
          id: 103,
          name: 'Jeans Slim Fit',
          price: 50.00,
          image: 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg',
          brand: { name: 'Levi\'s' }
        }
      ];
      isLoading.value = false;
    }, 1000);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    isLoading.value = false;
  }
};
</script>

<style scoped>
.product-card {
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-2px);
}
</style>