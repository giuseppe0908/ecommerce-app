<template>
    <div class="jumbo relative bg-no-repeat w-full h-[320px] md:h-[700px]">
        <img class="w-full h-full" src="https://imgs.search.brave.com/-yfsBO7_DQUtSG4VYhtgOOAqXJNSm_R6b4MbRAfWJos/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/cHJlbWl1bS1waG90/by9lY29tbWVyY2Ut/c2hvcHBpbmctc2hv/cHBpbmctY2FydC1s/YXB0b3BfMTE5ODg4/NC0xMDY3My5qcGc_/c2l6ZT02MjYmZXh0/PWpwZw" alt="jumbo">
        <div class="absolute top-[10px] lg:top-[50px]">
            <div class="pt-11">
            <Button name="DONNA" :bgColor="colorPrimary" colorText="white"  to="/donna" :leftRadius="false" :width="buttonWidth" :height="buttonHeight"/>
            </div>
            <div class="mt-5 lg:mt-8">
                <Button name="UOMO" bgColor="white" :colorText="colorPrimary"  to="/uomo" :leftRadius="false" :width="buttonWidth" :height="buttonHeight"/>
            </div>
            <div class="mt-5 lg:mt-8 ">
                <Button name="BAMBINO" :bgColor="colorPrimary" colorText="white"  to="/bambino" :leftRadius="false" :width="buttonWidth" :height="buttonHeight" ml_25="25px"/>
            </div>
        </div>
        
    </div>
   
</template>

<script setup>
import Button from './Button.vue'
import { computed } from 'vue';
    const props = defineProps(['colorPrimary'])
    const {colorPrimary} = props

   // Variabile reattiva per la larghezza del bottone
    const buttonWidth = ref('142px'); // Impostazione predefinita per mobile
    const buttonHeight = ref('42px');
    // Imposta la larghezza e largezza in base alla dimensione dello schermo lato client
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
<style scoped>

.jumbo{
    /* background-image: url("https://imgs.search.brave.com/-yfsBO7_DQUtSG4VYhtgOOAqXJNSm_R6b4MbRAfWJos/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/cHJlbWl1bS1waG90/by9lY29tbWVyY2Ut/c2hvcHBpbmctc2hv/cHBpbmctY2FydC1s/YXB0b3BfMTE5ODg4/NC0xMDY3My5qcGc_/c2l6ZT02MjYmZXh0/PWpwZw"); */
    /* height: 39vh; */
    /* width: 100%; */
    
}
img{
    border-bottom-right-radius: 110px;
    object-fit: cover;
}


</style>