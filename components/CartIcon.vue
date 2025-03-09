<script setup>
import { useCartStore } from '@/stores/cartStore';
import { watch, onMounted } from 'vue';

// Inizializzazione dello store
const cartStore = useCartStore();

// Caricamento dei dati da localStorage quando il componente viene montato
onMounted(() => {
  cartStore.loadCartFromLocalStorage();
});

// Watch per monitorare le modifiche al carrello
watch(
  () => cartStore.cart,
  (newCart) => {
    console.log('Numero di elementi nel carrello:', newCart.length);
  },
  { deep: true }
);

// Proprietà per il colore
const props = defineProps(['colorPrimary']);


</script>

<template>
  <div class="flex cursor-pointer">
    <!-- Icona della borsa -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width="35"
      height="35"
      :fill="props.colorPrimary"
      class="text-black"
    >
      <!-- Corpo della borsa  -->
      <rect
        x="8"
        y="10"
        width="16"
        height="12"
        rx="3"
        ry="3"
        :fill="props.colorPrimary"
      />
      <!-- Manico della borsa -->
      <path
        d="M11 12V9a5 5 0 0 1 10 0v3"
        :stroke="props.colorPrimary"
        stroke-width="2"
        fill="none"
      />
      <!-- Badge Numerico -->
      <text
        x="16"
        y="17"
        text-anchor="middle"
        alignment-baseline="middle"
        font-size="7"
        fill="white"
        font-weight="bold"
      >
      {{ cartStore.cart.length }}
      </text>
    </svg>
  </div>
</template>

<style scoped>
/* Stile aggiuntivo se necessario */
</style>
