<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Gestione Clienti</h1>

    <!-- Filtri e Ricerca -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Cerca</label>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Nome, email o telefono" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Ordina Per</label>
          <select 
            v-model="sortBy" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="name">Nome</option>
            <option value="email">Email</option>
            <option value="registrationDate">Data Registrazione</option>
            <option value="ordersCount">Numero Ordini</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Stato</label>
          <select 
            v-model="filterStatus" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Tutti</option>
            <option value="active">Attivi</option>
            <option value="inactive">Inattivi</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tabella Clienti -->
    <div class="bg-white shadow overflow-hidden rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contatti</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrazione</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordini</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="customer in filteredCustomers" :key="customer.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <img 
                    class="h-10 w-10 rounded-full" 
                    :src="customer.avatar || 'https://via.placeholder.com/40'" 
                    alt=""
                  >
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ customer.name }}</div>
                  <div class="text-sm text-gray-500">ID: {{ customer.id }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ customer.email }}</div>
              <div class="text-sm text-gray-500">{{ customer.phone }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(customer.registrationDate) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ customer.ordersCount }} ordini
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                :class="getStatusClass(customer.status)" 
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
              >
                {{ customer.status === 'active' ? 'Attivo' : 'Inattivo' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button 
                @click="viewCustomerDetails(customer)" 
                class="text-indigo-600 hover:text-indigo-900 mr-3"
              >
                Dettagli
              </button>
              <button 
                @click="toggleCustomerStatus(customer)" 
                class="text-red-600 hover:text-red-900"
              >
                {{ customer.status === 'active' ? 'Disattiva' : 'Attiva' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modale Dettagli Cliente -->
    <div v-if="selectedCustomer" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Dettagli Cliente</h2>
          <button @click="selectedCustomer = null" class="text-gray-500 hover:text-gray-700">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <h3 class="font-medium mb-2">Informazioni Personali</h3>
            <p><span class="font-medium">Nome:</span> {{ selectedCustomer.name }}</p>
            <p><span class="font-medium">Email:</span> {{ selectedCustomer.email }}</p>
            <p><span class="font-medium">Telefono:</span> {{ selectedCustomer.phone }}</p>
            <p><span class="font-medium">Registrato il:</span> {{ formatDate(selectedCustomer.registrationDate) }}</p>
          </div>

          <div>
            <h3 class="font-medium mb-2">Statistiche</h3>
            <p><span class="font-medium">Totale Ordini:</span> {{ selectedCustomer.ordersCount }}</p>
            <p><span class="font-medium">Totale Speso:</span> €{{ selectedCustomer.totalSpent?.toFixed(2) }}</p>
            <p><span class="font-medium">Ultimo Ordine:</span> {{ formatDate(selectedCustomer.lastOrderDate) }}</p>
          </div>

          <div class="col-span-2">
            <h3 class="font-medium mb-2">Indirizzi di Spedizione</h3>
            <div v-for="(address, index) in selectedCustomer.addresses" :key="index" class="mb-2">
              <p>{{ address.street }}, {{ address.city }}</p>
              <p>{{ address.postalCode }}, {{ address.country }}</p>
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
const customers = ref([]);
const selectedCustomer = ref(null);
const searchQuery = ref('');
const sortBy = ref('name');
const filterStatus = ref('');

// Fetch customers
const fetchCustomers = async () => {
  try {
    const response = await fetch('/api/admin/customers');
    const data = await response.json();
    customers.value = data;
  } catch (error) {
    console.error('Errore nel caricamento dei clienti:', error);
  }
};

// Computed filtered and sorted customers
const filteredCustomers = computed(() => {
  let filtered = customers.value.filter(customer => {
    const matchesSearch = !searchQuery.value || 
      customer.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      customer.phone.includes(searchQuery.value);
    
    const matchesStatus = !filterStatus.value || customer.status === filterStatus.value;

    return matchesSearch && matchesStatus;
  });

  // Sort customers
  filtered.sort((a, b) => {
    if (sortBy.value === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy.value === 'email') {
      return a.email.localeCompare(b.email);
    } else if (sortBy.value === 'registrationDate') {
      return new Date(b.registrationDate) - new Date(a.registrationDate);
    } else if (sortBy.value === 'ordersCount') {
      return b.ordersCount - a.ordersCount;
    }
    return 0;
  });

  return filtered;
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
  return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
};

// View customer details
const viewCustomerDetails = (customer) => {
  selectedCustomer.value = customer;
};

// Toggle customer status
const toggleCustomerStatus = async (customer) => {
  try {
    const newStatus = customer.status === 'active' ? 'inactive' : 'active';
    const response = await fetch(`/api/admin/customers/${customer.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });
    
    if (response.ok) {
      customer.status = newStatus;
    }
  } catch (error) {
    console.error('Errore nell\'aggiornamento dello stato del cliente:', error);
  }
};

// Fetch customers on mount
onMounted(async () => {
  authStore.initialize();
  await fetchCustomers();
});
</script>