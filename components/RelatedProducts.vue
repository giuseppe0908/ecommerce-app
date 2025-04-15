<script setup>
import { ref, onMounted } from 'vue';
import Card from './Card.vue';

const props = defineProps({
  productId: { type: Number, required: true },
  categoryId: { type: Number, required: true },
  brandId: { type: Number, required: true },
  colorPrimary: { type: String, required: true },
  colorSecondary: { type: String, required: true },
  limit: { type: Number, default: 4 }
});

const relatedProducts = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    // Fetch related products based on same category or brand, excluding current product
    const response = await fetch(`/api/products/related?productId=${props.productId}&categoryId=${props.categoryId}&brandId=${props.brandId}&limit=${props.limit}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch related products');
    }
    
    const data = await response.json();
    relatedProducts.value = data;
  } catch (err) {
    error.value = err.message;
    console.error('Error fetching related products:', err);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="related-products-container">
    <h3 class="text-2xl font-semibold mb-6">Prodotti correlati</h3>
    
    <div v-if="loading" class="loading-indicator flex justify-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" :style="{ borderColor: colorPrimary }"></div>
    </div>
    
    <div v-else-if="error" class="error-message text-red-500 text-center py-4">
      {{ error }}
    </div>
    
    <div v-else-if="relatedProducts.length === 0" class="no-products text-gray-500 text-center py-4">
      Nessun prodotto correlato disponibile
    </div>
    
    <div v-else class="products-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <Card 
        v-for="product in relatedProducts" 
        :key="product.id"
        :id="product.id"
        :name="product.name"
        :img="product.img"
        :price="product.price"
        :promo="product.promo"
        :plus="product.plus"
        :category="product.category"
        :brand="product.brand"
        :colorPrimary="colorPrimary"
        :colorSecondary="colorSecondary"
        :codeItem="product.codeItem"
      />
    </div>
  </div>
</template>

<style scoped>
.products-grid {
  overflow-x: auto;
  scrollbar-width: thin;
  padding-bottom: 1rem;
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
}
</style>