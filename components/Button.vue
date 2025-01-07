<script setup>
const props = defineProps(['name', 'bgColor', 'colorText', 'to', 'leftRadius', 'width', 'height', 'ml_25', 'ml_46', 'size_13'])
</script>

<template>
        <div 
            class="btn shadow-md hover:shadow-lg transition-shadow duration-200 flex items-center justify-center "
            :class="leftRadius ? '' : ' ml--30'"
            :style="{ backgroundColor: bgColor, width, height }">
             <NuxtLink :to="to" class="no-underline w-full">
            <span class="flex justify-center font-semibold" :style="{ color: colorText }">
                <p 
                    :style="{
                        marginLeft: ml_46 ? `${ml_46}` : (ml_25 ? `${ml_25}` : ''),
                        fontSize: size_13 ? `${size_13}` : ''
                    }"
                    >
                    {{ name }}
                </p>

            </span>
            </NuxtLink>  
        </div>
</template>

<style scoped>
.btn {
   border-radius: 50px;
}
.ml--30 {
    margin-left: -30px;
}
</style>
