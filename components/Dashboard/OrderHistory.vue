<template>
  <div class="order-history bg-white rounded-lg shadow-md p-6 mb-6">
    <h3 class="text-xl font-bold mb-4">I miei ordini</h3>
    
    <div v-if="isLoading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
    
    <div v-else-if="orders.length === 0" class="text-center py-8">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      <p class="text-gray-500 mb-2">Non hai ancora effettuato ordini</p>
      <NuxtLink to="/catalog" class="text-blue-600 hover:underline">Inizia a fare acquisti</NuxtLink>
    </div>
    
    <div v-else class="space-y-6">
      <!-- Order List -->
      <div v-for="order in orders" :key="order.id" class="order-item border rounded-lg overflow-hidden">
        <div class="order-header bg-gray-50 p-4 flex justify-between items-center">
          <div>
            <span class="text-sm text-gray-500">Ordine #{{ order.id }}</span>
            <p class="text-sm">{{ formatDate(order.createdAt) }}</p>
          </div>
          <div class="text-right">
            <p class="font-bold">{{ order.price.toFixed(2) }} €</p>
            <span class="inline-block px-2 py-1 text-xs rounded-full" 
                  :class="getStatusClass(order.status)">
              {{ getStatusText(order.status) }}
            </span>
          </div>
        </div>
        
        <div class="order-products p-4 border-t">
          <div v-for="product in order.products" :key="product.id" class="product-item flex py-2">
            <div class="product-image w-16 h-16 flex-shrink-0 mr-4">
              <img :src="product.product.image || 'https://via.placeholder.com/64'" :alt="product.product.name" class="w-full h-full object-cover rounded">
            </div>
            <div class="product-info flex-grow">
              <p class="font-medium">{{ product.product.name }}</p>
              <div class="flex justify-between text-sm text-gray-500">
                <span>Quantità: {{ product.quantity }}</span>
                <span>{{ product.product.price.toFixed(2) }} €</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="order-footer p-4 border-t flex justify-between items-center">
          <button 
            @click="toggleOrderDetails(order.id)" 
            class="text-sm text-blue-600 hover:underline flex items-center"
          >
            {{ expandedOrders.includes(order.id) ? 'Nascondi dettagli' : 'Mostra dettagli' }}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" :class="{ 'transform rotate-180': expandedOrders.includes(order.id) }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <NuxtLink 
            :to="`/product/${order.products[0]?.productId}`" 
            class="text-sm text-blue-600 hover:underline"
          >
            Acquista di nuovo
          </NuxtLink>
        </div>
        
        <!-- Order Details (expanded) -->
        <div v-if="expandedOrders.includes(order.id)" class="order-details p-4 bg-gray-50 border-t">
          <h4 class="font-medium mb-2">Dettagli di spedizione</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <span class="text-gray-500">Indirizzo:</span>
              <p>{{ user.address || 'Non specificato' }}</p>
            </div>
            <div>
              <span class="text-gray-500">Contatto:</span>
              <p>{{ user.number || 'Non specificato' }}</p>
            </div>
          </div>
          
          <h4 class="font-medium mt-4 mb-2">Riepilogo ordine</h4>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span>Subtotale:</span>
              <span>{{ order.price.toFixed(2) }} €</span>
            </div>
            <div class="flex justify-between">
              <span>Spedizione:</span>
              <span>0.00 €</span>
            </div>
            <div class="flex justify-between font-bold pt-1 border-t">
              <span>Totale:</span>
              <span>{{ order.price.toFixed(2) }} €</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

const props = defineProps({
  userId: {
    type: Number,
    required: true
  },
  userData: {
    type: Object,
    required: true
  }
});

const user = computed(() => props.userData);
const orders = ref([]);
const isLoading = ref(true);
const expandedOrders = ref([]);

// Fetch user orders
onMounted(async () => {
  try {
    // In a real implementation, you would fetch orders from an API
    // const { data } = await useFetch(`/api/orders/user/${props.userId}`);
    // orders.value = data.value || [];
    
    // For now, we'll use mock data
    setTimeout(() => {
      orders.value = [
        {
          id: 1001,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          price: 129.99,
          status: 'delivered',
          products: [
            {
              id: 1,
              productId: 101,
              quantity: 1,
              product: {
                id: 101,
                name: 'Sneakers Nike Air Max',
                price: 129.99,
                image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg'
              }
            }
          ]
        },
        {
          id: 1002,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          price: 89.95,
          status: 'shipped',
          products: [
            {
              id: 2,
              productId: 102,
              quantity: 1,
              product: {
                id: 102,
                name: 'T-Shirt Premium',
                price: 39.95,
                image: 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg'
              }
            },
            {
              id: 3,
              productId: 103,
              quantity: 1,
              product: {
                id: 103,
                name: 'Jeans Slim Fit',
                price: 50.00,
                image: 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg'
              }
            }
          ]
        }
      ];
      isLoading.value = false;
    }, 1000);
  } catch (error) {
    console.error('Error fetching orders:', error);
    isLoading.value = false;
  }
});

// Format date
const formatDate = (date) => {
  if (!date) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('it-IT', options);
};

// Toggle order details
const toggleOrderDetails = (orderId) => {
  const index = expandedOrders.value.indexOf(orderId);
  if (index === -1) {
    expandedOrders.value.push(orderId);
  } else {
    expandedOrders.value.splice(index, 1);
  }
};

// Get status text
const getStatusText = (status) => {
  const statusMap = {
    'pending': 'In attesa',
    'processing': 'In lavorazione',
    'shipped': 'Spedito',
    'delivered': 'Consegnato',
    'cancelled': 'Annullato'
  };
  return statusMap[status] || status;
};

// Get status class
const getStatusClass = (status) => {
  const classMap = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'processing': 'bg-blue-100 text-blue-800',
    'shipped': 'bg-purple-100 text-purple-800',
    'delivered': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800'
  };
  return classMap[status] || 'bg-gray-100 text-gray-800';
};
</script>

<style scoped>
.order-item {
  transition: all 0.3s ease;
}

.order-item:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>