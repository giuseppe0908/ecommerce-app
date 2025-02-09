<script setup>
import { useFetch } from '#app';
import Card from './Card.vue';
import Button from './Button.vue';
import { useProductStore } from '@/stores/productStore'
import nuoviArriviImg from '../assets/img/nuoviArrivi.png';


const productStore = useProductStore()
const { data: newArrivals, pending, error } = await useFetch('/api/products/newArrivals');

const buttonWidth = ref('142px'); // Impostazione predefinita per mobile
    const buttonHeight = ref('42px');
    
    onMounted(() => {
        if (process.client) {
            buttonWidth.value = window.innerWidth >= 1024 ? '206px' : '142px';
            buttonHeight.value = window.innerWidth >= 1024 ? '64px' : '42px'
            // Aggiorna la larghezza e altezza del bottone al ridimensionamento della finestra
            window.addEventListener('resize', () => {
                buttonWidth.value = window.innerWidth >= 1024 ? '206px' : '142px';
                buttonHeight.value = window.innerWidth >= 1024 ? '64px' : '42px';
            }); 
        }
    });
</script>

<template>
    <div class="h-[100vh]">
    <!-- <div class="mt-6">
        <Button name="NUOVI ARRIVI" bgColor="white" :colorText="productStore.colorPrimary"  to="/NewArrivi" :leftRadius="false" :width="buttonWidth" :height="buttonHeight" ml_46="46px" />
    </div> -->

    <div class="img h-[40vh] w-full relative  md:h-[60vh]">
            <img class="w-full h-full" :src="nuoviArriviImg" alt="">
            <div class="absolute top-8 md:top-12">
                <Button name="NUOVI ARRIVI" bgColor="white" :textColor="productStore.colorPrimary"  to="/NewArrivi" :applyNegativeMargin="true" :width="buttonWidth" :height="buttonHeight" marginLeft="29px" />
            </div>
    </div>

    <div v-if="pending">Loading...</div>
    <div v-else-if="error">Error loading new arrivals!</div>
    <section v-else 
     class="NewArrivals pt-1 flex items-center overflow-x-scroll whitespace-nowrap mt-[15px] space-x-4 pr-4 md:overflow-x-hidden md:flex-wrap md:w-[95%] md:h-[40vh]"
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
<style scoped>
.img img{
    border-bottom-right-radius: 35%;
    background-size: cover; /* Adatta l'immagine all'elemento */
    background-position: center; /* Centra l'immagine */
   
}
</style>