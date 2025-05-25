<script setup>
import { useResponsiveButton } from '~/composables/useResponsiveButton';
const { screenWidth, buttonStyle, buttonWidth, buttonHeight, colorPrimary } = useResponsiveButton();

const props = defineProps(['colorPrimary']);
</script>

<template>
    <section class="Promo h-[50vh] md:h-[100vh] bg-white relative overflow-hidden">
        <div class="imgPromo h-[70%] w-[85%] md:w-[70%] centrato absolute transition-all duration-300 hover:shadow-lg rounded-tr-full rounded-br-full">
            <div class="centrato absolute"
                :class="{
                    'md:right-[-148px] md:translate-x-1/2 md:w-[227px]': screenWidth >= 768,
                    'right-[-56px] translate-x-3/4': screenWidth < 768
                }"
            >
                <Button 
                    name="PROMO" 
                    :bgColor="colorPrimary" 
                    textColor="white"  
                    to="product?promo=true" 
                    :applyNegativeMargin="true" 
                    :width="buttonWidth" 
                    :height="buttonHeight" 
                    fontSize="22px"
                />
            </div>
        </div>
        <div class="promo-overlay absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-20 pointer-events-none"></div>
    </section>
</template>

<style scoped>
.imgPromo{
    background-image: url("../assets/img/promo.png");
    background-size: cover; 
    background-position: center; 
    transition: transform 0.3s ease;
}

.centrato{
    top: 50%;
    transform: translateY(-50%);
}

@media (max-width: 769px) {
    /* .imgPromo {
        border-top-right-radius: 120px;
        border-bottom-right-radius: 120px;
    } */
}

@media (min-width: 770px) {
    .imgPromo {
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
}
</style>