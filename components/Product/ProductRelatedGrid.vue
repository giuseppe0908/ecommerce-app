<template>
  <div class="related-products mt-12 border-t pt-6" v-if="visibleProducts.length > 0">
    <div class="products-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:grid-cols-4 gap-10">
      <Card
        v-for="(product, index) in visibleProducts"
        :key="index"
        :id="product.id"
        :category="product.category"
        :brand="product.brand"
        :name="product.name"
        :img="product.photo"
        :description="product.description"
        :price="product.price"
        :plus="product.plus"
        :promo="product.promo"
        :codeItem="product.codeItem"
        :colorPrimary="colorPrimary"
        :colorSecondary="colorSecondary"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  relatedProducts: {
    type: Array,
    default: () => [],
  },
  colorPrimary: {
    type: String,
    required: true,
  },
  colorSecondary: {
    type: String,
    required: true,
  },
})

const visibleProducts = computed(() => {
  return Array.isArray(props.relatedProducts) ? props.relatedProducts.slice(0, 4) : []
})
</script>
