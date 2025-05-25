<template>
    <div class="jumbo relative bg-no-repeat w-full h-[320px] md:h-[676px]">
        <div class="image-container w-full h-full">
            <img class="w-full h-full" src="../assets/img/jumbo-nonradius.png" alt="jumbo">
        </div>
        <div class="centrato absolute ">    
            <div class="">
                <Button name="DONNA" :bgColor="colorPrimary" textColor="white" to="product?gender=donna"  :applyNegativeMargin="true" :width="buttonWidth" :height="buttonHeight"/>
            </div>
            <div class="mt-5 lg:mt-8">
                <Button name="UOMO" bgColor="white" :textColor="colorPrimary"  to="product?gender=/uomo" :applyNegativeMargin="true" :width="buttonWidth" :height="buttonHeight"/>
            </div>
            <div class="mt-5 lg:mt-8 ">
                <Button name="BAMBINO" :bgColor="colorPrimary" textColor="white"  to="product?gender=bambini" :applyNegativeMargin="true" :width="buttonWidth" :height="buttonHeight" marginLeft="25px"/>
            </div>
        </div>
        <!-- <div class="centrato absolute left-48 title text-[20px] md:w-[50%]" >
            <h1>Tutto in un unico posto per uno shopping 
                <span class="text-black font-bold">facile e veloce!</span>
            </h1>
        </div> -->
        <div class="centrato absolute left-48 title text-[20px] md:w-[50%]">
            <h1 class="font-bold text-4xl leading-normal title-stroke" :style="{ color: colorPrimary }">
                TUTTO IN UN<br />
            <span class="text-7xl"> UNICO POSTO<br /></span>
                PER UNO SHOPPING<br />
            <span class="text-black font-bold">FACILE E VELOCE!</span>                
            </h1>
        </div>
    </div>
</template>

<script setup>
import Button from './Button.vue'

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
    overflow: hidden; /* Assicura che l'immagine non fuoriesca dal contenitore */
    border-bottom-right-radius: 18% 36%; 
}

 .image-container {
    position: relative;
    overflow: hidden;
    border-bottom-right-radius: 100px; /* Stondatura in basso a destra */
} 

.image-container::after {
  content: "";
  position: absolute;
  bottom: -50px; /* Ajusta la posizione */
  right: 0;
  width: 50%;
  height: 50%;
  background: #56768D; /* Colore del fondo */
  border-radius: 50% 0 0 0; /* Curva verso sinistra */
  z-index: -1;
}


.centrato{
    top: 50%;
    transform: translateY(-50%);
}

.centrato p{
    font-weight: 900;
    color: #56768D;
    font-size: 17px;
    line-height: 21px;
    color: color(display-p3 0.365 0.459 0.545);
    text-shadow: 0 0 10px rgba(0,0,0,0.5); /* Effetto luce */
    mix-blend-mode: multiply; /* Integrazione con lo sfondo */
}
  

img{
    /* Rimuovi questi commenti poiché ora gestiamo la stondatura nel container */
    /* border-bottom-right-radius: 110px; */
    /* border-bottom-right-radius: 50% 20%; */
    object-fit: cover;
    background-position: center;
}

/* .title{
    font-weight: 900;
    -webkit-text-stroke: 6px black;
    letter-spacing: 13px;
    text-transform: uppercase;
} */
.title-stroke {
    -webkit-text-stroke: 2px ; /* Per browser WebKit (Chrome, Safari) */
    text-stroke: 2px ; /* Standard */
    letter-spacing: 2px;
    text-transform: uppercase;
}
</style>