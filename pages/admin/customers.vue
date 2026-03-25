<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestione Clienti</h1>
        <p class="text-sm text-gray-600">
          Consulta anagrafica, spesa totale e attivita recente dei clienti registrati.
        </p>
      </div>

      <button
        type="button"
        class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="isLoading"
        @click="fetchCustomers"
      >
        {{ isLoading ? 'Aggiornamento...' : 'Aggiorna elenco' }}
      </button>
    </div>

    <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
      <div class="rounded-lg bg-white p-4 shadow">
        <p class="text-sm text-gray-500">Clienti totali</p>
        <p class="mt-2 text-2xl font-semibold text-gray-900">{{ customers.length }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow">
        <p class="text-sm text-gray-500">Sessioni attive</p>
        <p class="mt-2 text-2xl font-semibold text-emerald-600">{{ activeCustomersCount }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow">
        <p class="text-sm text-gray-500">Con almeno 1 ordine</p>
        <p class="mt-2 text-2xl font-semibold text-indigo-600">{{ customersWithOrdersCount }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow">
        <p class="text-sm text-gray-500">Spesa complessiva</p>
        <p class="mt-2 text-2xl font-semibold text-amber-600">{{ formatCurrency(totalRevenue) }}</p>
      </div>
    </div>

    <div v-if="errorMessage" class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ errorMessage }}
    </div>

    <div class="mb-6 rounded-lg bg-white p-4 shadow">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Cerca</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Nome, email o telefono"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Ordina per</label>
          <select
            v-model="sortBy"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="name">Nome</option>
            <option value="email">Email</option>
            <option value="registrationDate">Data registrazione</option>
            <option value="ordersCount">Numero ordini</option>
            <option value="totalSpent">Totale speso</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Stato attivita</label>
          <select
            v-model="filterStatus"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Tutti</option>
            <option value="active">Attivi</option>
            <option value="inactive">Inattivi</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Ordini</label>
          <select
            v-model="ordersFilter"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Tutti</option>
            <option value="with_orders">Con ordini</option>
            <option value="without_orders">Senza ordini</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="rounded-lg bg-white p-10 text-center shadow">
      <div class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"></div>
      <p class="mt-4 text-sm text-gray-600">Caricamento clienti in corso...</p>
    </div>

    <div v-else-if="filteredCustomers.length === 0" class="rounded-lg bg-white p-10 text-center shadow">
      <h2 class="text-lg font-semibold text-gray-900">Nessun cliente trovato</h2>
      <p class="mt-2 text-sm text-gray-600">Modifica i filtri oppure attendi nuove registrazioni.</p>
    </div>

    <div v-else class="overflow-hidden rounded-lg bg-white shadow">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Cliente</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Contatti</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Registrazione</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Ordini</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Spesa</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Stato</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Azioni</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="customer in filteredCustomers" :key="customer.id">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                    {{ getCustomerInitials(customer.name) }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ customer.name }}</p>
                    <p class="text-xs text-gray-500">ID {{ customer.id }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                <p class="text-gray-900">{{ customer.email }}</p>
                <p class="mt-1">{{ customer.phone || 'Telefono non disponibile' }}</p>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                <p>{{ formatDate(customer.registrationDate) }}</p>
                <p class="mt-1 text-xs text-gray-500">
                  Ultimo ordine:
                  {{ customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'Nessuno' }}
                </p>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                <p class="font-medium text-gray-900">{{ customer.ordersCount }}</p>
                <p class="mt-1 text-xs text-gray-500">
                  Pagati: {{ customer.paidOrdersCount }}
                </p>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ formatCurrency(customer.totalSpent) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                <span
                  class="inline-flex rounded-full px-2 py-1 text-xs font-semibold"
                  :class="getStatusClass(customer.status)"
                >
                  {{ customer.status === 'active' ? 'Attivo' : 'Inattivo' }}
                </span>
                <p class="mt-2 text-xs text-gray-500">
                  Sessioni attive: {{ customer.activeSessions }}
                </p>
              </td>
              <td class="px-6 py-4 text-sm font-medium">
                <button
                  type="button"
                  class="text-indigo-600 transition hover:text-indigo-900"
                  @click="viewCustomerDetails(customer)"
                >
                  Dettagli
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="selectedCustomer"
      class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 px-4"
    >
      <div class="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div class="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Dettagli Cliente</h2>
            <p class="mt-1 text-sm text-gray-500">Profilo e riepilogo commerciale del cliente selezionato.</p>
          </div>
          <button
            type="button"
            class="rounded-md p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            @click="selectedCustomer = null"
          >
            <span class="sr-only">Chiudi dettagli cliente</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="rounded-lg border border-gray-200 p-4">
            <h3 class="font-medium text-gray-900">Informazioni personali</h3>
            <p class="mt-2 text-sm text-gray-700">{{ selectedCustomer.name }}</p>
            <p class="mt-1 text-sm text-gray-600">{{ selectedCustomer.email }}</p>
            <p class="mt-1 text-sm text-gray-600">{{ selectedCustomer.phone || 'Telefono non disponibile' }}</p>
            <p class="mt-2 text-sm text-gray-500">
              Registrato il {{ formatDate(selectedCustomer.registrationDate) }}
            </p>
          </div>

          <div class="rounded-lg border border-gray-200 p-4">
            <h3 class="font-medium text-gray-900">Statistiche</h3>
            <p class="mt-2 text-sm text-gray-700">Ordini totali: {{ selectedCustomer.ordersCount }}</p>
            <p class="mt-1 text-sm text-gray-700">Ordini pagati: {{ selectedCustomer.paidOrdersCount }}</p>
            <p class="mt-1 text-sm text-gray-700">Totale speso: {{ formatCurrency(selectedCustomer.totalSpent) }}</p>
            <p class="mt-1 text-sm text-gray-700">
              Ultimo ordine:
              {{ selectedCustomer.lastOrderDate ? formatDate(selectedCustomer.lastOrderDate) : 'Nessuno' }}
            </p>
          </div>
        </div>

        <div class="mt-6 rounded-lg border border-gray-200 p-4">
          <div class="flex items-center justify-between gap-3">
            <h3 class="font-medium text-gray-900">Attivita sessione</h3>
            <span
              class="inline-flex rounded-full px-2 py-1 text-xs font-semibold"
              :class="getStatusClass(selectedCustomer.status)"
            >
              {{ selectedCustomer.status === 'active' ? 'Attivo' : 'Inattivo' }}
            </span>
          </div>
          <p class="mt-2 text-sm text-gray-700">
            Sessioni attive rilevate: {{ selectedCustomer.activeSessions }}
          </p>
        </div>

        <div class="mt-6 rounded-lg border border-gray-200 p-4">
          <h3 class="font-medium text-gray-900">Indirizzi noti</h3>
          <div v-if="selectedCustomer.addresses.length" class="mt-3 space-y-2">
            <p
              v-for="address in selectedCustomer.addresses"
              :key="address"
              class="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700"
            >
              {{ address }}
            </p>
          </div>
          <p v-else class="mt-3 text-sm text-gray-500">Nessun indirizzo disponibile.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '~/stores/authStore';

definePageMeta({
  middleware: ['auth'],
});

const authStore = useAuthStore();
const customers = ref([]);
const selectedCustomer = ref(null);
const searchQuery = ref('');
const sortBy = ref('name');
const filterStatus = ref('');
const ordersFilter = ref('');
const isLoading = ref(true);
const errorMessage = ref('');

const activeCustomersCount = computed(() =>
  customers.value.filter((customer) => customer.status === 'active').length
);

const customersWithOrdersCount = computed(() =>
  customers.value.filter((customer) => customer.ordersCount > 0).length
);

const totalRevenue = computed(() =>
  customers.value.reduce((sum, customer) => sum + (Number(customer.totalSpent) || 0), 0)
);

const filteredCustomers = computed(() => {
  const normalizedQuery = searchQuery.value.trim().toLowerCase();
  const filtered = customers.value.filter((customer) => {
    const matchesSearch =
      !normalizedQuery ||
      (customer.name || '').toLowerCase().includes(normalizedQuery) ||
      (customer.email || '').toLowerCase().includes(normalizedQuery) ||
      (customer.phone || '').toLowerCase().includes(normalizedQuery);

    const matchesStatus = !filterStatus.value || customer.status === filterStatus.value;
    const matchesOrders =
      !ordersFilter.value ||
      (ordersFilter.value === 'with_orders' && customer.ordersCount > 0) ||
      (ordersFilter.value === 'without_orders' && customer.ordersCount === 0);

    return matchesSearch && matchesStatus && matchesOrders;
  });

  filtered.sort((left, right) => {
    if (sortBy.value === 'registrationDate') {
      return new Date(right.registrationDate) - new Date(left.registrationDate);
    }

    if (sortBy.value === 'ordersCount') {
      return right.ordersCount - left.ordersCount;
    }

    if (sortBy.value === 'totalSpent') {
      return right.totalSpent - left.totalSpent;
    }

    return String(left[sortBy.value] || '').localeCompare(String(right[sortBy.value] || ''), 'it');
  });

  return filtered;
});

function formatDate(date) {
  if (!date) return '';

  return new Intl.DateTimeFormat('it-IT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

function formatCurrency(value) {
  const amount = Number(value) || 0;

  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

function getStatusClass(status) {
  return status === 'active'
    ? 'bg-emerald-100 text-emerald-800'
    : 'bg-gray-200 text-gray-700';
}

function getCustomerInitials(name) {
  const normalizedName = String(name || '').trim();
  if (!normalizedName) return '--';

  const initials = normalizedName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

  return initials || '--';
}

function viewCustomerDetails(customer) {
  selectedCustomer.value = customer;
}

async function fetchCustomers() {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    await authStore.initialize();
    const payload = await $fetch('/api/admin/customers');
    customers.value = Array.isArray(payload?.customers) ? payload.customers : [];
  } catch (error) {
    customers.value = [];
    errorMessage.value =
      error?.data?.message ||
      error?.message ||
      'Errore durante il recupero dei clienti.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchCustomers);
</script>
