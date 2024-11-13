<script setup>
const props = defineProps(['name', 'bgColor', 'colorText', 'to', 'leftRadius', 'width', 'height'])
</script>

<template>
   
        <div 
            class="btn shadow-md hover:shadow-lg transition-shadow duration-200 flex items-center justify-center"
            :class="leftRadius ? '' : 'ml--18'"
            :style="{ backgroundColor: bgColor, width, height }">
             <NuxtLink :to="to" class="no-underline w-full">
            <span class="flex justify-center" :style="{ color: colorText }">
                <p>{{ name }}</p>
            </span>
            </NuxtLink>  
        </div>
        
</template>

<style scoped>
.btn {
   border-radius: 50px;
}
.ml--18 {
    margin-left: -18px;
}
</style>
