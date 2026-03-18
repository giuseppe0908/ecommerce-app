<template>
  <div>
    <div class="buttons flex justify-center md:justify-start gap-4 text-xs">
      <Button name="DONNA" :bgColor="colorPrimary" textColor="white" to="/product?gender=donna" width="100px" height="30px" fontSize="15px" />
      <Button name="UOMO" bgColor="white" :textColor="colorPrimary" to="/product?gender=uomo" width="100px" height="30px" fontSize="15px" />
      <Button name="BAMBINO" :bgColor="colorPrimary" textColor="white" to="/product?gender=bambini" width="100px" height="30px" fontSize="15px" />
    </div>

    <div class="container flex flex-col md:flex-row gap-12 mt-8">
      <div class="left flex flex-1 md:max-w-[500px] flex-col md:flex-row md:gap-2">
        <div class="imgVertical hidden md:flex flex-col gap-4">
          <img
            v-for="(image, index) in safeOtherImages"
            :key="index"
            class="img square h-[138px] w-[136px] rounded-xl cursor-pointer"
            :src="image"
            :alt="`Immagine correlata ${index}`"
            @click="emit('change-main-image', image)"
          />
        </div>

        <div class="image-container relative w-full md:w-[412px] md:h-[605px] max-w-[500px] mx-auto">
          <img
            class="w-full h-auto md:h-full aspect-square md:aspect-auto rounded-xl select-none object-cover"
            :src="currentMainImage"
            alt="Immagine principale"
            @touchstart="emit('touch-start', $event)"
            @touchmove="emit('touch-move', $event)"
            @touchend="emit('touch-end', $event)"
            @dragstart.prevent
          />

          <button
            v-if="currentImageIndex > 0"
            @click="emit('previous-image')"
            class="nav-arrow nav-arrow-left flex absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 md:hidden"
          >
            <svg class="w-6 h-6 text-[#5D758B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>

          <button
            v-if="currentImageIndex < safeAllImages.length - 1"
            @click="emit('next-image')"
            class="nav-arrow nav-arrow-right flex absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 md:hidden"
          >
            <svg class="w-6 h-6 text-[#5D758B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>

        <div class="image-indicators flex justify-center mt-4 gap-2 md:hidden">
          <button
            v-for="(image, index) in safeAllImages"
            :key="index"
            class="indicator-dot w-3 h-3 rounded-full transition-all duration-200"
            :class="currentImageIndex === index ? 'bg-[#5D758B]' : 'bg-gray-300'"
            @click="emit('go-to-image', index)"
          ></button>
        </div>
      </div>

      <div class="right flex-1">
        <div class="descriptions">
          <div class="brand font-bold text-black text-3xl">
            <p>{{ product?.brand?.name || '' }}</p>
          </div>
          <div class="name text-[#5D758B] text-2xl">
            <p>{{ product?.name || '' }}</p>
          </div>
          <div class="price text-2xl">
            <span class="flex items-center">
              {{ product?.price || 0 }}
              <p class="text-[#5D758B]">€ IVA inclusa</p>
            </span>
          </div>
          <div class="color">
            colore: {{ selectedColor }}
          </div>
        </div>

        <div class="color-thumbnails flex gap-2 items-center mt-4 overflow-x-auto">
          <img
            v-for="(item, index) in safeGalleryItems"
            :key="item.id ?? index"
            :src="item.images.main"
            :alt="`Colorazione ${item.color}`"
            class="thumbnail cursor-pointer square h-[138px] w-[103px] md:w-[136px] rounded-xl cursor-pointer border"
            :class="{ active: index === currentColorIndex }"
            @click="emit('change-color', index)"
          />
        </div>

        <div class="disponibility mt-4 p-3 bg-gray-100 rounded-lg">
          <p v-if="stockQuantity > 5" class="text-green-600">Disponibile - Spedizione in 24/48h</p>
          <p v-else-if="stockQuantity > 0" class="text-orange-500">Solo {{ stockQuantity }} disponibili!</p>
          <p v-else class="text-red-500">Prodotto esaurito</p>
        </div>

        <div class="buttons flex gap-4 mt-4">
          <Button name="Acquista" bgColor="white" textColor="#5D758B" width="200px" height="50px" @click="emit('add-cart')" to="/order" />
          <Button name="Aggiungi al carrello" :bgColor="colorPrimary" textColor="white" width="200px" height="50px" @click="emit('add-cart')" />
          <button
            @click="emit('toggle-wishlist')"
            class="wishlist-button flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 hover:border-red-500 transition-colors"
            :class="{ 'bg-red-50': isInWishlist }"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 wishlist-heart-icon" :fill="isInWishlist ? colorPrimary : 'none'" viewBox="0 0 24 24" :stroke="colorPrimary">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        <div class="technical-specs mt-8 border-t pt-4">
          <h3 class="text-xl font-semibold mb-3">Specifiche tecniche</h3>
          <div class="specs-grid grid grid-cols-2 gap-3">
            <div v-for="(spec, index) in safeSpecs" :key="index" class="spec-item">
              <span class="font-medium">{{ spec.name }}:</span> {{ spec.value }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    default: () => ({}),
  },
  colorPrimary: {
    type: String,
    required: true,
  },
  galleryItems: {
    type: Array,
    default: () => [],
  },
  currentColorIndex: {
    type: Number,
    default: 0,
  },
  currentMainImage: {
    type: String,
    default: '',
  },
  currentOtherImages: {
    type: Array,
    default: () => [],
  },
  allImages: {
    type: Array,
    default: () => [],
  },
  currentImageIndex: {
    type: Number,
    default: 0,
  },
  stockQuantity: {
    type: Number,
    default: 0,
  },
  productSpecs: {
    type: Array,
    default: () => [],
  },
  isInWishlist: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'change-main-image',
  'change-color',
  'touch-start',
  'touch-move',
  'touch-end',
  'previous-image',
  'next-image',
  'go-to-image',
  'add-cart',
  'toggle-wishlist',
])

const safeGalleryItems = computed(() => (Array.isArray(props.galleryItems) ? props.galleryItems : []))
const safeOtherImages = computed(() => (Array.isArray(props.currentOtherImages) ? props.currentOtherImages : []))
const safeAllImages = computed(() => (Array.isArray(props.allImages) ? props.allImages : []))
const safeSpecs = computed(() => (Array.isArray(props.productSpecs) ? props.productSpecs : []))

const selectedColor = computed(() => {
  return safeGalleryItems.value[props.currentColorIndex]?.color || 'N/A'
})
</script>

<style scoped>
.thumbnail.active {
  border: 2px solid #5D758B;
  box-shadow: 0 0 5px rgba(93, 117, 139, 0.5);
}

.spec-item {
  padding: 8px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.heart-pulse {
  animation: pulse 0.5s ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
</style>
