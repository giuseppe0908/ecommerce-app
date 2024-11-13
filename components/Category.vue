<script setup>
    import CardCategory from './CardCategory.vue'
    import { useCategoryStore } from '@/stores/categoryStore'
    import { onMounted, ref } from 'vue'
  const categoryStore = useCategoryStore()
 
 
 onMounted(() => {
    categoryStore.fetchCategories()
    console.log(categoryStore.categories.images);
  })
</script>

<template>
    <section class="Category  flex items-center overflow-x-scroll whitespace-nowrap mt-[9px] space-x-4 pr-4">
        <CardCategory v-for="(item) in categoryStore.categories"
            :key="item.id"
            :id="item.id"
            :name="item.name"
            :img="item.images[0]?.imageUrl"
            :colorPrimary="item.colorPrimary"
        /> 



    </section>
</template>
<style scoped>
.Category::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
}
.Category{
    padding-top: 100px;
    padding-bottom: 57px;

}
</style>