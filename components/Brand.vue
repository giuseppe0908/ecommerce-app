<script setup>
    const props = defineProps(['colorPrimary'])
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
    <section class="Brand w-full" >
        <div class="img h-[270px] w-full relative  md:h-[45vh]">
            <img class="w-full h-full" src="https://plus.unsplash.com/premium_photo-1674273912680-14dc56e523b8?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="">
            <div class="absolute top-8 md:top-12">
                <Button name="BRAND" bgColor="white" :colorText="colorPrimary"  to="/Uomo" :leftRadius="false" :width="buttonWidth" :height="buttonHeight"/>
            </div>
        </div>
    </section>
</template>
<style scoped>

.img img{
    border-bottom-right-radius: 35%;
   
}
/* image */
/* img altezza da figma 427px pc  */

</style>