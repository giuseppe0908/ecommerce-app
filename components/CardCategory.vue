<script setup>
import Button from './Button.vue';
import { ref, onMounted, computed } from 'vue';

// Props
const props = defineProps(['id', 'name', 'img', 'colorPrimary']);
const { id, name, img, colorPrimary } = props;
const windowWidth = ref(null);
// Variabili reattive
const buttonWidth = ref('106px'); // Impostazione predefinita per mobile
const buttonHeight = ref('42px');

const screenWidth = ref(windowWidth); // Monitora la larghezza dello schermo
const buttonStyle = ref({}); // Stile dinamico per il bottone

// Funzione per aggiornare lo stile in base alla larghezza dello schermo
const updateButtonStyle = () => {
  if (screenWidth.value >= 1024) {
    // Stile per schermi grandi
    buttonStyle.value = {
      left: '50%',
      width: '95%', // Aggiunge il width
    };
  } else {
    // Stile per schermi piccoli
    buttonStyle.value = {
      left: '50%', // Mantiene solo il "left"
    };
  }
};

// Funzione per aggiornare la larghezza dello schermo
const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth;
};

// Watcher: Ricalcola lo stile ogni volta che cambia la larghezza dello schermo
watch(screenWidth, updateButtonStyle);

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth);
});

// Aggiorna la larghezza al montaggio
onMounted(() => {
  windowWidth.value = window.innerWidth;
  updateButtonStyle();
  window.addEventListener('resize', updateScreenWidth);
  if (process.client) {
    buttonWidth.value = window.innerWidth >= 1024 ? '100%' : '106px';
    buttonHeight.value = window.innerWidth >= 1024 ? '64px' : '42px';

    // Aggiorna dinamicamente durante il ridimensionamento
    window.addEventListener('resize', () => {
      buttonWidth.value = window.innerWidth >= 1024 ? '100%' : '106px';
      buttonHeight.value = window.innerWidth >= 1024 ? '64px' : '42px';
    });
  }
});
// src="https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg" 

</script>

<template>
  <div class="categories min-w-[134px] md:max-w-[300px]">
    <div class="w-full relative">
      <div class="img h-[193px] md:h-[321px]">
        <img 
          class="w-full h-full" 
          src="../assets/img/sportswear.png"
          :alt="name" 
          loading="lazy" 
        />
      </div>
      <div 
        class="absolute bottom-[-20px] btn-center" 
        :style="buttonStyle"
      >
        <Button 
          :name="name" 
          bgColor="white" 
          :textColor="colorPrimary" 
          :to="`/product?category=${encodeURIComponent(name)}`"
          :applyNegativeMargin="false" 
          :width="buttonWidth" 
          :height="buttonHeight" 
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.categories {
  /* width: calc(25% - 40px); */
  padding: 30px 10px;
}
.card {}
.img img {
  border-radius: 13px;
}
.btn-center {
  transform: translateX(-50%);
}



</style>
