<script setup>
const props = defineProps(['colorPrimary'])
const {id,  name, img} = props
</script>

<template>
    
    <section class="Promo h-[50vh] bg-white relative">
        <div class="imgPromo centrato absolute">

        </div>
        <div class="centrato absolute right-[-15px]">
            <Button name="PROMO" bgColor="white" :colorText="colorPrimary"  to="/Promo" :leftRadius="true" width="90px" height="42px" />
        </div>

    </section>
</template>
<style scoped>
.imgPromo{
    height: 196px;
    min-width: 343px;
    background-image: url("https://imgs.search.brave.com/ZwxzAu04kvbQqHMc_syAKV5G5uO-D8ankluuVvU_fh8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS1hc3NldHMudmFu/aXR5ZmFpci5pdC9w/aG90b3MvNjNmMzlm/YmExZjkyYzRjOWYw/ODhhNzcwLzE6MS9w/YXNzL0FsdGElMjBC/YWRpYV9MYWdhenVv/aV9ieSUyMEFsZXgl/MjBNb2xpbmclMjAo/MjUpLmpwZw");
    border-top-right-radius: 100px;
    border-bottom-right-radius: 100px;
}
.centrato{
    top: 50%;
    transform: translateY(-50%);
}
</style>