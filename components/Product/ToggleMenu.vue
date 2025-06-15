<template>
  <div v-if="open" class="menu bg-[#5D758B] min-h-screen min-w-[95vw] ml-0 text-white">
    <div class="flex justify-between items-center mb-6">
      <div class="flex gap-6 text-black">
        <p class="font-semibold text-black border-b-2 border-white">DONNA</p>
        <p class="font-semibold text-gray-400 hover:text-black">UOMO</p>
        <p class="font-semibold text-gray-400 hover:text-black">BAMBINI</p>
      </div>
      <p @click="$emit('toggleMenu')" class="text-gray-400 text-xl font-bold hover:text-white cursor-pointer">X</p>
    </div>
    <div class="input mb-6 w-full">
      <input
        type="text"
        placeholder="RICERCA"
        class="search-input"
        v-model="searchQuery"
        @input="debouncedFetchProducts"
      />
    </div>
    <div class="grid grid-cols-2 pt-5 gap-8 w-[95%] containerGrid">
      <div
        v-for="(category, index) in categories"
        :key="index"
        class="category-card"
      >
        <div class="square h-[140px] w-[135px] relative">
          <img 
            class="w-full h-full rounded-xl lazyload" 
            :data-src="category.image" 
            :alt="category.name"
          >
          <div class="absolute bottom-[-20px] left-0 w-full">
            <Button 
              :name="category.name" 
              bgColor="white" 
              :textColor="colorPrimary" 
              :to="`/product?category=${category.name.toLowerCase()}`"
              width="100%" 
              :height="buttonHeight" 
            /> 
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import Button from '../Button.vue'
import { useDebounced } from '@/composables/useDebounced'

const props = defineProps({
  open: Boolean,
  categories: Array,
  colorPrimary: String,
  buttonHeight: String
})
const emit = defineEmits(['toggleMenu', 'search'])
const searchQuery = ref('')
const debouncedFetchProducts = useDebounced(() => {
  emit('search', searchQuery.value)
}, 300)
</script>