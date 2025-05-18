<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Gestione Ordini</h1>

    <!-- Filtri -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Stato Ordine</label>
          <select v-model="filterStatus" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            <option value="">Tutti</option>
            <option value="pending">In Attesa</option>
            <option value="processing">In Lavorazione</option>
            <option value="shipped">Spedito</option>
            <option value="delivered">Consegnato</option>
            <option value="cancelled">Annullato</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Data Da</label>
          <input type="date" v-model="filterDateFrom" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Data A</label>
          <input type="date" v-model="filterDateTo" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Cerca</label>
          <input type="text" v-model="searchQuery" placeholder="ID ordine o cliente" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
        </div>
      </div>
    </div>

    <!-- Tabella Ordini -->
    <div class="bg-white shadow overflow-hidden rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Ordine</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Totale</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="order in filteredOrders" :key="order.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{{ order.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ order.customerName }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(order.date) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">€{{ order.total.toFixed(2) }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getStatusClass(order.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                {{ getStatusText(order.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button @click="viewOrderDetails(order)" class="text-indigo-600 hover:text-indigo-900 mr-3">Dettagli</button>
              <button @click="updateOrderStatus(order)" class="text-green-600 hover:text-green-900">Aggiorna Stato</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modale Dettagli Ordine -->
    <div v-if="selectedOrder" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Dettagli Ordine #{{ selectedOrder.id }}</h2>
          <button @click="selectedOrder = null" class="text-gray-500 hover:text-gray-700">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <h3 class="font-medium">Informazioni Cliente</h3>
              <p>{{ selectedOrder.customerName }}</p>
              <p>{{ selectedOrder.customerEmail }}</p>
              <p>{{ selectedOrder.customerPhone }}</p>
            </div>
            <div>
              <h3 class="font-medium">Indirizzo di Spedizione</h3>
              <p>{{ selectedOrder.shippingAddress }}</p>
            </div>
          </div>

          <div>
            <h3 class="font-medium mb-2">Prodotti</h3>
            <div class="space-y-2">
              <div v-for="item in selectedOrder.items" :key="item.id" class="flex justify-between">
                <span>{{ item.name }} x{{ item.quantity }}</span>
                <span>€{{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <div class="border-t pt-4">
            <div class="flex justify-between">
              <span class="font-medium">Totale</span>
              <span class="font-medium">€{{ selectedOrder.total.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '~/stores/authStore';

definePageMeta({
  middleware: ['auth']
});

const authStore = useAuthStore();
const orders = ref([]);
const selectedOrder = ref(null);
const filterStatus = ref('');
const filterDateFrom = ref('');
const filterDateTo = ref('');
const searchQuery = ref('');

// Fetch orders
const fetchOrders = async () => {
  try {
    const response = await fetch('/api/admin/orders');
    const data = await response.json();
    orders.value = data;
  } catch (error) {
    console.error('Errore nel caricamento degli ordini:', error);
  }
};

// Computed filtered orders
const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    const matchesStatus = !filterStatus.value || order.status === filterStatus.value;
    const matchesSearch = !searchQuery.value || 
      order.id.toString().includes(searchQuery.value) || 
      order.customerName.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    let matchesDate = true;
    if (filterDateFrom.value) {
      matchesDate = matchesDate && new Date(order.date) >= new Date(filterDateFrom.value);
    }
    if (filterDateTo.value) {
      matchesDate = matchesDate && new Date(order.date) <= new Date(filterDateTo.value);
    }

    return matchesStatus && matchesSearch && matchesDate;
  });
});

// Format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Get status class for styling
const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

// Get status text
const getStatusText = (status) => {
  const texts = {
    pending: 'In Attesa',
    processing: 'In Lavorazione',
    shipped: 'Spedito',
    delivered: 'Consegnato',
    cancelled: 'Annullato'
  };
  return texts[status] || status;
};

// View order details
const viewOrderDetails = (order) => {
  selectedOrder.value = order;
};

// Update order status
const updateOrderStatus = async (order) => {
  try {
    const newStatus = prompt('Inserisci il nuovo stato dell\'ordine:', order.status);
    if (newStatus && newStatus !== order.status) {
      const response = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        order.status = newStatus;
      }
    }
  } catch (error) {
    console.error('Errore nell\'aggiornamento dello stato:', error);
  }
};

// Fetch orders on mount
onMounted(async () => {
  authStore.initialize();
  await fetchOrders();
});
</script>