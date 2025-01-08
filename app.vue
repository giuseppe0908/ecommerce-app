<template>
  <div class="font-montserrat">
  
    <NuxtLayout>
      <NuxtPage />
      <Cart v-if="cartStore.flag_cart"/>
    </NuxtLayout>
  </div>
</template>
<script setup>
import Cart from '~/components/Cart.vue'
import { useCartStore } from '@/stores/cartStore';

const cartStore = useCartStore();
</script>
