<script setup>
const props = defineProps(['colorPrimary'])

</script>

<template>
    
    <section class="Promo h-[50vh] md:h-[100vh] bg-white relative">
        <div class="imgPromo h-[70%] w-[85%]  md:w-[73%] centrato absolute">
            <div class="centrato absolute "
            :class="{
                'md:right-[-45px] md:translate-x-1/2': true,
                'right-[-60px] translate-x-3/4': true /* Schermo piccolo */
            }"
        >
            <Button name="PROMO" bgColor="white" :colorText="colorPrimary"  to="/Promo" :leftRadius="true" width="90px" height="42px" />
        </div>
        </div>
        

    </section>
</template>
<style scoped>
.imgPromo{

    background-image: url("https://imgs.search.brave.com/ZwxzAu04kvbQqHMc_syAKV5G5uO-D8ankluuVvU_fh8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS1hc3NldHMudmFu/aXR5ZmFpci5pdC9w/aG90b3MvNjNmMzlm/YmExZjkyYzRjOWYw/ODhhNzcwLzE6MS9w/YXNzL0FsdGElMjBC/YWRpYV9MYWdhenVv/aV9ieSUyMEFsZXgl/MjBNb2xpbmclMjAo/MjUpLmpwZw");
    border-top-right-radius: 50%;
    border-bottom-right-radius: 50%;
}
.centrato{
    top: 50%;
    transform: translateY(-50%);
}

@media (max-width: 769px) {
    .imgPromo {
        border-top-right-radius: 120px;
        border-bottom-right-radius: 120px;
    }
}
</style>