<script setup>
import { useFetch } from '#app';
import Card from './Card.vue';
import Button from './Button.vue';
import { useProductStore } from '@/stores/productStore'
import nuoviArriviImg from '../assets/img/nuoviArrivi.png';


const productStore = useProductStore()
const { data: newArrivals, pending, error } = await useFetch('/api/products/newArrivals');
const buttonWidth = ref('142px')
const buttonHeight = ref('42px')

function updateButtonDimensions() {
    if (!process.client) return

    buttonWidth.value = window.innerWidth >= 1024 ? '206px' : '142px'
    buttonHeight.value = window.innerWidth >= 1024 ? '64px' : '42px'
}

onMounted(() => {
    updateButtonDimensions()
    window.addEventListener('resize', updateButtonDimensions)
})

onBeforeUnmount(() => {
    if (!process.client) return
    window.removeEventListener('resize', updateButtonDimensions)
})
</script>

<template>
    <div class="h-[100vh]">
    <!-- <div class="mt-6">
        <Button name="NUOVI ARRIVI" bgColor="white" :colorText="productStore.colorPrimary"  to="/NewArrivi" :leftRadius="false" :width="buttonWidth" :height="buttonHeight" ml_46="46px" />
    </div> -->

    <div class="img h-[40vh] w-full relative  md:h-[55vh]">
            <img class="w-full h-full bg" :src="nuoviArriviImg" alt="Sezione nuovi arrivi del catalogo" width="1600" height="600" sizes="100vw" loading="lazy" decoding="async">
            <div class="absolute top-8 md:top-12">
                <Button name="NUOVI ARRIVI" bgColor="white" :textColor="productStore.colorPrimary"  to="/product?newArrivals=true" :applyNegativeMargin="true" :width="buttonWidth" :height="buttonHeight" marginLeft="29px" />
            </div>
    </div>

    <div v-if="pending">Loading...</div>
    <div v-else-if="error">Error loading new arrivals!</div>
    <section v-else 
     class="NewArrivals w-[95%] mx-auto pt-1 flex items-center overflow-x-scroll whitespace-nowrap mt-[15px] space-x-4 pr-4 md:overflow-x-hidden md:flex-wrap md:w-[95%] md:h-[55vh]"
    >
        <Card v-for="product in newArrivals" :key="product.id"
            :id="product.id"
            :name="product.name"
            :img="product.photo"
            :promo="product.promo"
            :plus="product.plus"
            :price="product.price"
            :category="product.category"
            :brand="product.brand"
            :colorPrimary="productStore.colorPrimary"
            :colorSecondary="productStore.colorSecondary"
            :codeItem="product.codeItem"
        /> 
    </section >
    </div>
</template>
<style >
.img .bg{
    /* border-bottom-right-radius: 35%; */
    background-size: cover; /* Adatta l'immagine all'elemento */
    background-position: center; /* Centra l'immagine */


    background-position: center;
    border-bottom-right-radius: 22% 58%;
    overflow: hidden;
   
}
</style>
