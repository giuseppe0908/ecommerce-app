<script setup>
const props = defineProps(['colorPrimary'])

</script>

<template>
    <section class="Promo h-[50vh] md:h-[100vh] bg-white relative">
        <div class="imgPromo h-[70%] w-[85%]  md:w-[73%] centrato absolute">
            <div class="centrato absolute "
                :class="{
                    'md:right-[-45px] md:translate-x-1/2': true,
                    'right-[-56px] translate-x-3/4': true /* Schermo piccolo */
                }"
            >
            <Button name="PROMO" :bgColor="colorPrimary" textColor="white"  to="/Promo" :applyNegativeMargin="true" width="90px" height="42px" fontSize="13px"/>
            </div>
        </div>
    </section>
</template>
<style scoped>
.imgPromo{
    background-image: url("../assets/img/promo.png");
    background-size: cover; /* Adatta l'immagine all'elemento */
    background-position: center; /* Centra l'immagine */
    /* border-top-right-radius: 50%;
    border-bottom-right-radius: 50%; */

}
.centrato{
    top: 50%;
    transform: translateY(-50%);
}
#ellipse {
    float: left;
      width: 150px;
      height: 150px;
      margin: 20px;
      shape-outside: circle(50% at 30%);
      clip-path: circle(50% at 0%);
      background: lightblue;
            z-index: 3;
    }
@media (max-width: 769px) {
    .imgPromo {
        border-top-right-radius: 120px;
        border-bottom-right-radius: 120px;
    }
}
</style>