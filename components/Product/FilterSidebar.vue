<template>
  <aside class="filter-sidebar">
    <div class="flex gap-2">
      <FilterButton
        v-for="(filter, index) in filtri"
        :key="index"
        :active="filter.selected"
        :colorPrimary="colorPrimary"
        @click="selectFilter(filter)"
      >
        {{ filter.name }}
      </FilterButton>
    </div>
    <div v-if="isPriceFilterSelected" class="price-filter-container mt-4 bg-white p-4 rounded-xl shadow-lg">
      <h3 class="font-semibold mb-2" :style="{ color: colorPrimary }">Prezzo</h3>
      <div class="flex justify-between mb-2">
        <span>€{{ priceRange.min }}</span>
        <span>€{{ priceRange.max }}</span>
      </div>
      <div class="relative mb-6 pt-5">
        <div class="slider-track h-1 absolute w-full bg-gray-300 rounded"></div>
        <div 
          class="slider-range h-1 absolute bg-blue-500 rounded" 
          :style="{ 
            left: `${((priceRange.min - minPrice) / (maxPrice - minPrice)) * 100}%`, 
            width: `${((priceRange.max - priceRange.min) / (maxPrice - minPrice)) * 100}%`,
            backgroundColor: colorPrimary
          }"
        ></div>
        <input 
          type="range" 
          class="slider absolute w-full" 
          :min="minPrice" 
          :max="maxPrice" 
          v-model.number="priceRange.min" 
          @input="updatePriceFilter"
        />
        <input 
          type="range" 
          class="slider absolute w-full" 
          :min="minPrice" 
          :max="maxPrice" 
          v-model.number="priceRange.max" 
          @input="updatePriceFilter"
        />
      </div>
      <div class="flex items-center space-x-2">
        <input 
          type="number" 
          v-model.number="priceRange.min" 
          @change="updatePriceFilter"
          class="w-1/2 p-2 border rounded text-center"
          :min="minPrice"
          :max="priceRange.max - 1"
        />
        <span>-</span>
        <input 
          type="number" 
          v-model.number="priceRange.max" 
          @change="updatePriceFilter"
          class="w-1/2 p-2 border rounded text-center"
          :min="priceRange.min + 1"
          :max="maxPrice"
        />
      </div>
      <div class="flex justify-between mt-4">
        <button 
          @click="resetPriceFilter" 
          class="px-3 py-1 border rounded hover:bg-gray-100"
        >
          Reset
        </button>
        <button 
          @click="applyPriceFilter" 
          class="px-3 py-1 rounded text-white"
          :style="{ backgroundColor: colorPrimary }"
        >
          Applica
        </button>
      </div>
    </div>
  </aside>
</template>
<script setup>
import { ref, computed } from 'vue'
import FilterButton from './FilterButton.vue'
const props = defineProps({
  filtri: Array,
  colorPrimary: String,
  priceRange: Object,
  minPrice: Number,
  maxPrice: Number,
  isPriceFilterSelected: Boolean
})
const emit = defineEmits(['selectFilter', 'updatePriceFilter', 'resetPriceFilter', 'applyPriceFilter'])
const selectFilter = (filter) => emit('selectFilter', filter)
const updatePriceFilter = () => emit('updatePriceFilter')
const resetPriceFilter = () => emit('resetPriceFilter')
const applyPriceFilter = () => emit('applyPriceFilter')
</script>