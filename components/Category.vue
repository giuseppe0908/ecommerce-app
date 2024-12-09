<script setup>
    import CardCategory from './CardCategory.vue'
    import { useCategoryStore } from '@/stores/categoryStore'
    import { useAsyncData } from '#app';
    import { useFetch } from '#app';
  const categoryStore = useCategoryStore()
  const { data: categories, pending, error } = await useFetch('/api/categories');
// //3) Carica le categorie dal server prima del rendering
//   const { data: categories, pending, error } = await useAsyncData('categories', async () => {
//     const response = await fetch('/api/categories');

//     return response.json();
//   });
  categoryStore.categories = categories
 //1) Usa useAsyncData per caricare i dati lato server
// await useAsyncData('categories', async () => {
//   await categoryStore.fetchCategories()
  
//   return categoryStore.categories
// })
//2) onMounted(async () => {
//     await categoryStore.fetchCategories()
//     isLoading.value = false
// })
</script>

<template>
    <div v-if="pending">Caricamento...</div>
    <div v-else-if="error">Errore: {{ error }}</div>
    <section v-else
      class="Category  flex items-center overflow-x-scroll whitespace-nowrap mt-[9px] space-x-4 pr-4 md:overflow-x-hidden md:flex-wrap md:w-[85%]"
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
    padding-top: 90px;
    padding-bottom: 57px;
    margin: 0 auto;

}
</style>