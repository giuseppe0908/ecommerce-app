<script setup>
import { ref } from 'vue';
import { useFetch } from '#app';
import { useCategoryStore } from '@/stores/categoryStore';
import CardCategory from './CardCategory.vue';

const categoryStore = useCategoryStore();
const isLoading = ref(true);
const error = ref(null);

const { data: categories, pending, error: fetchError } = await useFetch('/api/categories', {
  key: 'categories', // Chiave univoca per la cache
  initialCache: false, // Disabilita la cache iniziale (opzionale)
});

if (fetchError.value) {
  error.value = fetchError.value;
} else {
  categoryStore.categories = categories.value;
}

isLoading.value = false;
</script>

<template>
  <div v-if="pending">Caricamento...</div>
  <div v-else-if="error">Errore: {{ error }}</div>
  <section v-else
    class="Category flex items-center overflow-x-scroll whitespace-nowrap mt-[9px] pr-4 md:overflow-x-hidden md:flex-wrap md:w-[85%] md:mx-auto"
  >
    <CardCategory v-for="(category) in categories"
      :key="category.id"
      :id="category.id"
      :name="category.name"
      :img="category.images[0]?.imageUrl"
      :colorPrimary="category.colorPrimary"
    /> 
  </section>
</template>
<style scoped>
.Category::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
}
.Category{
    margin-top: 30px;
    padding-bottom: 57px;
    padding-left: 10px;
    /* margin: 0 auto; */

}
</style>