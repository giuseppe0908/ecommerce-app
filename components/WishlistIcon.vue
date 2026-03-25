<script setup>
import { useWishlistStore } from '@/stores/wishlistStore';
import { watch, onMounted } from 'vue';

// Inizializzazione dello store
const wishlistStore = useWishlistStore();

// Caricamento dei dati quando il componente viene montato
onMounted(() => {
  wishlistStore.initWishlist();
  // Ensure the panel stays closed after initialization
  wishlistStore.isWishlistOpen = false;
});

// Watch per monitorare le modifiche ai preferiti
// watch(
//   () => wishlistStore.wishlist,
//   (newWishlist) => {
//     console.log('Numero di elementi nei preferiti:', newWishlist.length);
//   },
//   { deep: true }
// );

// Proprietà per il colore
const props = defineProps(['colorPrimary']);

// Funzione per aprire il pannello dei preferiti
function openWishlist() {
  wishlistStore.toggleWishlistSidebar();
}
</script>

<template>
  <div class="flex cursor-pointer mt-[-2px]" @click="openWishlist">
    <!-- Icona del cuore -->
    <div class="relative">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="22"
        height="22"
        :fill="wishlistStore.isInWishlist ? props.colorPrimary : 'none'"
        :stroke="props.colorPrimary"
        stroke-width="2"
        class="transition-all duration-300"
      >
        <path
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        />
      </svg>
      <!-- Badge Numerico -->
      <div 
        v-if="wishlistStore.wishlistCount > 0"
        class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
      >
        {{ wishlistStore.wishlistCount }}
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animazione per l'icona del cuore quando viene cliccata */
.heart-pulse {
  animation: pulse 0.5s ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
</style>