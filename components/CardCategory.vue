<script setup>
import Button from './Button.vue'

const props = defineProps(['id','name', 'img', 'colorPrimary'])
const {id,  name, img, colorPrimary } = props

</script>

<template>
    <div class="categories">
        <div class="card h-45 min-w-[150px] relative">
            <div class="img ">
                <img class="w-full h-full" :src="img" :alt="name">
            </div>
            <div class="absolute bottom-[-20px] btn-center">
                <Button :name="name" bgColor="white" :colorText="colorPrimary"  :to="name" :leftRadius="true" width="106px" height="42px" />
            </div>
        </div>
    </div>
    
</template>

<style scoped>
.card{
     /* margin: 10px;
    width: calc(100% / 6 - 20px); */
}
.img{
    height: 193px;
    width: 134px;
    
}
.img img{
    border-radius: 13px;
}
.btn-center{
   left: 45%;
   transform: translateX(-50%);
}

</style>