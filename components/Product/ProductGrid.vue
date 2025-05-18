<template>
  <div class="product-grid grid grid-cols-2 md:grid-cols-6 gap-4 ">
    <Card
      v-for="product in products"
      :key="product.id"
      :id="product.id"
      :name="product.name"
      :img="product.photo || product.image"
      :codeItem="product.codeItem || product.code || ''"
      :promo="product.promo || false"
      :plus="product.plus || false"
      :price="product.price"
      :category="product.category || {}"
      :brand="product.brand || {}"
      :colorPrimary="colorPrimary"
      :colorSecondary="'#00192F'"
    />
  </div>
</template>
<script setup>
import Card from '../Card.vue'
const props = defineProps({
  products: Array,
  colorPrimary: String
})
</script>