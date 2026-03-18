<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestione Ordini</h1>
        <p class="text-sm text-gray-600">
          Monitora ordini, stati di fulfillment e conferme pagamento.
        </p>
      </div>

      <button
        type="button"
        class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="isLoading"
        @click="fetchOrders"
      >
        {{ isLoading ? 'Aggiornamento...' : 'Aggiorna elenco' }}
      </button>
    </div>

    <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
      <div class="rounded-lg bg-white p-4 shadow">
        <p class="text-sm text-gray-500">Ordini totali</p>
        <p class="mt-2 text-2xl font-semibold text-gray-900">{{ orders.length }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow">
        <p class="text-sm text-gray-500">Da evadere</p>
        <p class="mt-2 text-2xl font-semibold text-amber-600">{{ pendingOrdersCount }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow">
        <p class="text-sm text-gray-500">Spediti</p>
        <p class="mt-2 text-2xl font-semibold text-indigo-600">{{ shippedOrdersCount }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow">
        <p class="text-sm text-gray-500">Incassato</p>
        <p class="mt-2 text-2xl font-semibold text-emerald-600">{{ formatCurrency(totalRevenue) }}</p>
      </div>
    </div>

    <div v-if="successMessage" class="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      {{ successMessage }}
    </div>

    <div v-if="errorMessage" class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ errorMessage }}
    </div>

    <div class="mb-6 rounded-lg bg-white p-4 shadow">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-5">
        <div>
          <label class="block text-sm font-medium text-gray-700">Stato Ordine</label>
          <select
            v-model="filterStatus"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Tutti</option>
            <option v-for="statusOption in statusOptions" :key="statusOption.value" :value="statusOption.value">
              {{ statusOption.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Pagamento</label>
          <select
            v-model="filterPaymentStatus"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Tutti</option>
            <option v-for="paymentOption in paymentStatusOptions" :key="paymentOption.value" :value="paymentOption.value">
              {{ paymentOption.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Data Da</label>
          <input
            v-model="filterDateFrom"
            type="date"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Data A</label>
          <input
            v-model="filterDateTo"
            type="date"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Cerca</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ID, email o cliente"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="rounded-lg bg-white p-10 text-center shadow">
      <div class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"></div>
      <p class="mt-4 text-sm text-gray-600">Caricamento ordini in corso...</p>
    </div>

    <div v-else-if="filteredOrders.length === 0" class="rounded-lg bg-white p-10 text-center shadow">
      <h2 class="text-lg font-semibold text-gray-900">Nessun ordine trovato</h2>
      <p class="mt-2 text-sm text-gray-600">
        Modifica i filtri oppure attendi nuovi ordini dal checkout.
      </p>
    </div>

    <div v-else class="overflow-hidden rounded-lg bg-white shadow">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Ordine</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Cliente</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Data</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Pagamento</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Totale</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Stato</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Azioni</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="order in filteredOrders" :key="order.id" class="align-top">
              <td class="px-6 py-4 text-sm text-gray-900">
                <p class="font-semibold">#{{ order.id }}</p>
                <p class="mt-1 text-xs text-gray-500">{{ order.itemsCount }} articoli</p>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                <p class="font-medium text-gray-900">{{ order.customerName }}</p>
                <p class="mt-1">{{ order.customerEmail || 'Email non disponibile' }}</p>
                <p class="mt-1 text-xs text-gray-500">{{ order.customerPhone || 'Telefono non disponibile' }}</p>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                <p>{{ formatDate(order.createdAt) }}</p>
                <p class="mt-1 text-xs text-gray-500">{{ formatTime(order.createdAt) }}</p>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                <span
                  class="inline-flex rounded-full px-2 py-1 text-xs font-semibold"
                  :class="getPaymentStatusClass(order.paymentStatus)"
                >
                  {{ getPaymentStatusText(order.paymentStatus) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                <p class="font-medium">{{ formatCurrency(order.total, order.currency) }}</p>
                <p class="mt-1 text-xs text-gray-500">
                  Subtotale {{ formatCurrency(order.subtotal, order.currency) }} + Spedizione
                  {{ formatCurrency(order.shippingAmount, order.currency) }}
                </p>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                <span
                  class="inline-flex rounded-full px-2 py-1 text-xs font-semibold"
                  :class="getStatusClass(order.status)"
                >
                  {{ getStatusText(order.status) }}
                </span>

                <div class="mt-3 flex items-center gap-2">
                  <select
                    v-model="statusDrafts[order.id]"
                    class="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option v-for="statusOption in statusOptions" :key="statusOption.value" :value="statusOption.value">
                      {{ statusOption.label }}
                    </option>
                  </select>
                  <button
                    type="button"
                    class="rounded-md bg-indigo-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="updatingOrderId === order.id || statusDrafts[order.id] === order.status"
                    @click="updateOrderStatus(order)"
                  >
                    {{ updatingOrderId === order.id ? 'Salvataggio...' : 'Salva' }}
                  </button>
                </div>
              </td>
              <td class="px-6 py-4 text-sm font-medium">
                <button
                  type="button"
                  class="text-indigo-600 transition hover:text-indigo-900"
                  @click="viewOrderDetails(order)"
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
      v-if="selectedOrder"
      class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 px-4"
    >
      <div class="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div class="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Dettagli Ordine #{{ selectedOrder.id }}</h2>
            <p class="mt-1 text-sm text-gray-500">
              Creato il {{ formatDate(selectedOrder.createdAt) }} alle {{ formatTime(selectedOrder.createdAt) }}
            </p>
          </div>
          <button
            type="button"
            class="rounded-md p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            @click="selectedOrder = null"
          >
            <span class="sr-only">Chiudi dettagli ordine</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="rounded-lg border border-gray-200 p-4">
            <h3 class="font-medium text-gray-900">Cliente</h3>
            <p class="mt-2 text-sm text-gray-700">{{ selectedOrder.customerName }}</p>
            <p class="mt-1 text-sm text-gray-600">{{ selectedOrder.customerEmail || 'Email non disponibile' }}</p>
            <p class="mt-1 text-sm text-gray-600">{{ selectedOrder.customerPhone || 'Telefono non disponibile' }}</p>
          </div>

          <div class="rounded-lg border border-gray-200 p-4">
            <h3 class="font-medium text-gray-900">Spedizione</h3>
            <p class="mt-2 text-sm text-gray-700">{{ selectedOrder.shippingAddress || 'Indirizzo non disponibile' }}</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <span
                class="inline-flex rounded-full px-2 py-1 text-xs font-semibold"
                :class="getStatusClass(selectedOrder.status)"
              >
                {{ getStatusText(selectedOrder.status) }}
              </span>
              <span
                class="inline-flex rounded-full px-2 py-1 text-xs font-semibold"
                :class="getPaymentStatusClass(selectedOrder.paymentStatus)"
              >
                {{ getPaymentStatusText(selectedOrder.paymentStatus) }}
              </span>
            </div>
          </div>
        </div>

        <div class="mt-6 rounded-lg border border-gray-200">
          <div class="border-b border-gray-200 px-4 py-3">
            <h3 class="font-medium text-gray-900">Prodotti</h3>
          </div>

          <div class="divide-y divide-gray-200">
            <div
              v-for="item in selectedOrder.items"
              :key="item.id"
              class="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div class="flex items-center gap-3">
                <img
                  :src="item.imageUrl || fallbackImage"
                  :alt="item.name"
                  class="h-12 w-12 rounded object-cover"
                >
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ item.name }}</p>
                  <p class="text-xs text-gray-500">Quantita {{ item.quantity }}</p>
                </div>
              </div>
              <p class="text-sm font-medium text-gray-900">
                {{ formatCurrency(item.lineTotal, selectedOrder.currency) }}
              </p>
            </div>
          </div>
        </div>

        <div class="mt-6 rounded-lg border border-gray-200 p-4">
          <h3 class="font-medium text-gray-900">Riepilogo economico</h3>
          <div class="mt-3 space-y-2 text-sm text-gray-700">
            <div class="flex justify-between">
              <span>Subtotale</span>
              <span>{{ formatCurrency(selectedOrder.subtotal, selectedOrder.currency) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Spedizione</span>
              <span>{{ formatCurrency(selectedOrder.shippingAmount, selectedOrder.currency) }}</span>
            </div>
            <div class="flex justify-between border-t border-gray-200 pt-2 font-semibold text-gray-900">
              <span>Totale</span>
              <span>{{ formatCurrency(selectedOrder.total, selectedOrder.currency) }}</span>
            </div>
          </div>
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
const fallbackImage = 'https://via.placeholder.com/64?text=Prodotto';

const statusOptions = [
  { value: 'pending', label: 'In attesa' },
  { value: 'processing', label: 'In lavorazione' },
  { value: 'shipped', label: 'Spedito' },
  { value: 'delivered', label: 'Consegnato' },
  { value: 'cancelled', label: 'Annullato' },
];

const paymentStatusOptions = [
  { value: 'pending', label: 'In attesa' },
  { value: 'requires_action', label: 'Richiede azione' },
  { value: 'processing', label: 'In elaborazione' },
  { value: 'succeeded', label: 'Pagato' },
  { value: 'failed', label: 'Fallito' },
  { value: 'cancelled', label: 'Annullato' },
];

const orders = ref([]);
const selectedOrder = ref(null);
const filterStatus = ref('');
const filterPaymentStatus = ref('');
const filterDateFrom = ref('');
const filterDateTo = ref('');
const searchQuery = ref('');
const isLoading = ref(true);
const errorMessage = ref('');
const successMessage = ref('');
const updatingOrderId = ref(null);
const statusDrafts = ref({});

const pendingOrdersCount = computed(() =>
  orders.value.filter((order) => order.status === 'pending' || order.status === 'processing').length
);

const shippedOrdersCount = computed(() =>
  orders.value.filter((order) => order.status === 'shipped' || order.status === 'delivered').length
);

const totalRevenue = computed(() =>
  orders.value.reduce((sum, order) => {
    if (order.paymentStatus !== 'succeeded') {
      return sum;
    }

    return sum + (Number(order.total) || 0);
  }, 0)
);

const filteredOrders = computed(() => {
  const normalizedQuery = searchQuery.value.trim().toLowerCase();

  return orders.value.filter((order) => {
    const matchesStatus = !filterStatus.value || order.status === filterStatus.value;
    const matchesPaymentStatus =
      !filterPaymentStatus.value || order.paymentStatus === filterPaymentStatus.value;
    const matchesSearch =
      !normalizedQuery ||
      String(order.id).includes(normalizedQuery) ||
      (order.customerName || '').toLowerCase().includes(normalizedQuery) ||
      (order.customerEmail || '').toLowerCase().includes(normalizedQuery);

    let matchesDate = true;
    if (filterDateFrom.value) {
      matchesDate = matchesDate && new Date(order.createdAt) >= new Date(filterDateFrom.value);
    }

    if (filterDateTo.value) {
      const dateTo = new Date(filterDateTo.value);
      dateTo.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && new Date(order.createdAt) <= dateTo;
    }

    return matchesStatus && matchesPaymentStatus && matchesSearch && matchesDate;
  });
});

function normalizeOrders(payload) {
  const orderList = Array.isArray(payload?.orders) ? payload.orders : [];
  statusDrafts.value = orderList.reduce((drafts, order) => {
    drafts[order.id] = order.status;
    return drafts;
  }, {});
  return orderList;
}

function formatCurrency(value, currency = 'eur') {
  const amount = Number(value) || 0;

  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: String(currency || 'eur').toUpperCase(),
  }).format(amount);
}

function formatDate(date) {
  if (!date) return '';

  return new Intl.DateTimeFormat('it-IT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

function formatTime(date) {
  if (!date) return '';

  return new Intl.DateTimeFormat('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

function getStatusClass(status) {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return classes[status] || 'bg-gray-100 text-gray-800';
}

function getPaymentStatusClass(status) {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    requires_action: 'bg-amber-100 text-amber-800',
    processing: 'bg-blue-100 text-blue-800',
    succeeded: 'bg-emerald-100 text-emerald-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-200 text-gray-700',
  };

  return classes[status] || 'bg-gray-100 text-gray-800';
}

function getStatusText(status) {
  return statusOptions.find((option) => option.value === status)?.label || status;
}

function getPaymentStatusText(status) {
  return paymentStatusOptions.find((option) => option.value === status)?.label || status;
}

function viewOrderDetails(order) {
  selectedOrder.value = order;
}

function replaceOrderInCollection(nextOrder) {
  const orderIndex = orders.value.findIndex((order) => order.id === nextOrder.id);
  if (orderIndex === -1) return;

  orders.value.splice(orderIndex, 1, nextOrder);
  statusDrafts.value[nextOrder.id] = nextOrder.status;

  if (selectedOrder.value?.id === nextOrder.id) {
    selectedOrder.value = nextOrder;
  }
}

async function fetchOrders() {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    await authStore.initialize();
    const payload = await $fetch('/api/admin/orders');
    orders.value = normalizeOrders(payload);
  } catch (error) {
    orders.value = [];
    errorMessage.value =
      error?.data?.message ||
      error?.message ||
      'Errore durante il recupero degli ordini.';
  } finally {
    isLoading.value = false;
  }
}

async function updateOrderStatus(order) {
  const nextStatus = statusDrafts.value[order.id];
  if (!nextStatus || nextStatus === order.status) {
    return;
  }

  updatingOrderId.value = order.id;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const payload = await $fetch(`/api/admin/orders/${order.id}/status`, {
      method: 'PUT',
      body: {
        status: nextStatus,
      },
    });

    if (payload?.order) {
      replaceOrderInCollection(payload.order);
      successMessage.value = `Stato ordine #${order.id} aggiornato a "${getStatusText(payload.order.status)}".`;
      return;
    }

    throw new Error('Risposta aggiornamento ordine non valida');
  } catch (error) {
    statusDrafts.value[order.id] = order.status;
    errorMessage.value =
      error?.data?.message ||
      error?.message ||
      'Errore durante l\'aggiornamento dello stato ordine.';
  } finally {
    updatingOrderId.value = null;
  }
}

onMounted(fetchOrders);
</script>
