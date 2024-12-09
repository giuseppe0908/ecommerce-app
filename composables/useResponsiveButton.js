import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useCategoryStore } from '@/stores/categoryStore';

export function useResponsiveButton() {
  const screenWidth = ref(0); // inizializzo con 0 per evitare problemi
  const buttonStyle = ref({});
  const buttonWidth = ref('');
  const buttonHeight = ref('');
  const categoryStore = useCategoryStore();
  const colorPrimary = categoryStore.colorPrimary;

  const updateButtonDimensions = () => {
    buttonWidth.value = screenWidth.value >= 1024 ? '100%' : '106px';
    buttonHeight.value = screenWidth.value >= 1024 ? '64px' : '42px';
  };

  const updateButtonStyle = () => {
    if (screenWidth.value >= 1024) {
      buttonStyle.value = {
        left: '50%',
        width: '95%',
      };
    } else {
      buttonStyle.value = {
        left: '50%',
      };
    }
    updateButtonDimensions();
  };

  const updateScreenWidth = () => {
    screenWidth.value = window.innerWidth;
    updateButtonStyle();
  };

  onMounted(() => {
    if (process.client) { // Verifica che sia lato client
      screenWidth.value = window.innerWidth;  // Inizializzo con la larghezza della finestra
      updateButtonStyle();
      window.addEventListener('resize', updateScreenWidth);
    }
  });

  onUnmounted(() => {
    if (process.client) { // Verifica che sia lato client
      window.removeEventListener('resize', updateScreenWidth);
    }
  });

  watch(screenWidth, updateButtonStyle);

  return {
    screenWidth,
    buttonStyle,
    buttonWidth,
    buttonHeight,
    colorPrimary
  };
}
