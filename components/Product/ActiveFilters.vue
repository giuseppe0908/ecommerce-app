<template>
  <div v-if="activeFilters.length" class="active-filters flex items-center gap-4 w-[95%] mx-auto my-0">
    <div class="flex flex-wrap gap-2">
      <p
        v-for="(filter, index) in activeFilters"
        :key="index"
        @click="$emit('removeFilter', filter.key)"
        class="filter-item cursor-pointer"
      >
        {{ filter.label }} &gt;
      </p>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  activeFilters: Array
})
const emit = defineEmits(['removeFilter'])
</script>