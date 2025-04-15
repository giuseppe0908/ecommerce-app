<template>
    <div class="div h-[100vh] flex items-center ">
        <div class="curved-container h-[70vh] w-[65%] relative overflow-hidden">
            <!-- Contenuto del container -->
        </div>
    </div>
</template>

<style scoped>
.curved-container {
    /* border-radius: 0 50% 50% 0 / 0 100% 100% 0; */
    /* Alternativa più personalizzabile usando clip-path */
    /* clip-path: ellipse(75% 100% at 0% 50%); */
    /* clip-path: circle(50% at 100% 50%); */
    clip-path: circle(50% at 0% 50%);
    /* clip-path: polygon(0 0, 100% 0, 100% 50%, 75% 60%, 50% 70%, 25% 60%, 0 50%); */
    background-image: url('~/assets/img/nuoviArrivi.png');
    background-size: cover;
    background-position: center; 
}
</style>