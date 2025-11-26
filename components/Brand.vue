<script setup>
import brand from '../assets/img/brand.png';
import logoNike from '../assets/img/logo/logoNike.png';
import logoAdidas from '../assets/img/logo/logoAdidas.png';
import logoCk from '../assets/img/logo/logoCk.png';
import logoJordan from '../assets/img/logo/logoJordan.png';
import logoChanel from '../assets/img/logo/logoChanel.png';
import logoStarbucks from '../assets/img/logo/logoStarbucks.png';
import logoPuma from '../assets/img/logo/logoPuma.png';
import logoConverse from '../assets/img/logo/logoConverse.png';

    const props = defineProps(['colorPrimary'])
    const buttonWidth = ref('142px'); // Impostazione predefinita per mobile
    const buttonHeight = ref('42px');
    const brandLogos = [
        {
            name: 'Nike',
            url: '/product?brand=nike',
            src: logoNike,
        },
        {
            name: 'Adidas',
            url: '/product?brand=adidas',
            src: logoAdidas,
        },
        {
            name: 'Calvin Klein',
            url: '/product?brand=calvin-klein',
            src: logoCk,
        },
        {
            name: 'Jordan',
            url: '/product?brand=jordan',
            src: logoJordan,
        },
        {
            name: 'Chanel',
            url: '/product?brand=chanel',
            src: logoChanel,
        },
        {
            name: 'Starbucks',
            url: '/product?brand=starbucks',
            src: logoStarbucks,
        },
        {
            name: 'Puma',
            url: '/product?brand=puma',
            src: logoPuma,
        },
        {
            name: 'Converse',
            url: '/product?brand=converse',
            src: logoConverse,
        },
    ]
    
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
    <section class="Brand w-full" >
        <div class="img-container h-[40vh] w-full relative  md:h-[51vh]">
            <img class="w-full h-full " :src="brand" alt="">
            <div class="absolute top-8 md:top-12">
                <Button name="BRAND" textColor="white" :bgColor="colorPrimary"  to="/Uomo" :applyNegativeMargin="true" :width="buttonWidth" :height="buttonHeight"/>
            </div>
        </div>
        <div class="loghi h-[40vh] md:h-[51vh]">
            <div class="carousel flex items-center h-full w-[95%] mx-auto justify-between overflow-x-scroll md:overflow-x-hidden">
                <div class="arrow left text-6xl pt-[30px]"> < </div>
                <div class="logo mx-3" v-for="(logo,index) in brandLogos" :key="index">
                    <NuxtLink :to="logo.url" class="no-underline w-full">
                        <div class="flex flex-col">
                            <img :src="logo.src" :alt="logo.name" class="w-[100px] h-[100px]"/>
                            <div class="text-center uppercase text-white bold">{{logo.name}}</div>
                        </div>
                    </NuxtLink>  
                </div>
                <div class="arrow right text-6xl pt-[30px]"> > </div>
            </div>
        </div>
    </section>
</template>
<style scoped>

.img img{
    border-bottom-right-radius: 35%;
    background-size: cover; /* Adatta l'immagine all'elemento */
    background-position: center; /* Centra l'immagine */
   
}
.img-container {
  /* border-bottom-right-radius: 50% 20%; */

  overflow: hidden;
}
/* image */
/* img altezza da figma 427px pc  */

</style>