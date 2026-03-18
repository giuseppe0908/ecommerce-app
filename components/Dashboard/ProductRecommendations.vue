<template>
  <div class="product-recommendations rounded-lg bg-white p-6 shadow-md">
    <h3 class="mb-4 text-xl font-bold">Consigliati per te</h3>

    <div v-if="isLoading" class="flex justify-center py-8">
      <div class="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <div v-else-if="errorMessage" class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ errorMessage }}
    </div>

    <div v-else-if="recommendations.length === 0" class="py-8 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto mb-4 h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="mb-2 text-gray-500">Nessun prodotto consigliato al momento</p>
      <NuxtLink to="/product" class="text-blue-600 hover:underline">Esplora il catalogo</NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="product in recommendations"
        :key="product.id"
        class="product-card overflow-hidden rounded-lg border transition-all hover:shadow-md"
      >
        <div class="relative">
          <img
            :src="product.image || fallbackImage"
            :alt="product.name"
            class="h-48 w-full object-cover"
          >

          <button
            type="button"
            class="absolute top-2 right-2 rounded-full bg-white p-1.5 shadow-md transition-colors hover:bg-red-50"
            :title="isInWishlist(product.id) ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'"
            @click="toggleWishlist(product)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :class="isInWishlist(product.id) ? 'fill-current text-red-500' : 'text-gray-400'" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        <div class="p-4">
          <p class="text-sm text-gray-500">{{ product.brand?.name || 'Brand' }}</p>
          <h4 class="mb-2 truncate font-medium">{{ product.name }}</h4>
          <div class="flex items-center justify-between">
            <p class="font-bold">{{ formatCurrency(product.price) }}</p>
            <NuxtLink :to="`/product/${product.id}`" class="text-sm text-blue-600 hover:underline">
              Visualizza
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useWishlistStore } from '~/stores/wishlistStore';
import { useAppToast } from '~/composables/useAppToast';

const props = defineProps({
  userId: {
    type: Number,
    required: true,
  },
});

const wishlistStore = useWishlistStore();
const toast = useAppToast();
const fallbackImage = 'https://via.placeholder.com/320x320?text=Prodotto';
const recommendations = ref([]);
const isLoading = ref(true);
const errorMessage = ref('');

function formatCurrency(value) {
  const amount = Number(value) || 0;

  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

function isInWishlist(productId) {
  return wishlistStore.isInWishlist(productId);
}

async function toggleWishlist(product) {
  const wasInWishlist = isInWishlist(product.id);

  await wishlistStore.toggleWishlistItem({
    id: product.id,
    name: product.name,
    price: product.price,
    brand: product.brand,
    img: product.image,
  });

  if (wishlistStore.error) {
    toast.error(wishlistStore.error, {
      position: 'top-right',
      timeout: 2000,
    });
    return;
  }

  if (wasInWishlist) {
    toast.info('Prodotto rimosso dai preferiti', {
      position: 'top-right',
      timeout: 2000,
    });
    return;
  }

  toast.success('Prodotto aggiunto ai preferiti', {
    position: 'top-right',
    timeout: 2000,
  });
}

async function fetchRecommendations() {
  if (!props.userId) return;

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const payload = await $fetch('/api/recommendations/me');
    recommendations.value = Array.isArray(payload?.recommendations)
      ? payload.recommendations
      : [];
  } catch (error) {
    recommendations.value = [];
    errorMessage.value =
      error?.data?.message ||
      error?.message ||
      'Errore durante il recupero delle raccomandazioni.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  await wishlistStore.initWishlist();
  await fetchRecommendations();
});

watch(
  () => props.userId,
  async (nextUserId, previousUserId) => {
    if (nextUserId && nextUserId !== previousUserId) {
      await wishlistStore.initWishlist();
      await fetchRecommendations();
    }
  }
);
</script>

<style scoped>
.product-card {
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-2px);
}
</style>
