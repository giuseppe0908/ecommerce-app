<script setup>

const props = defineProps(['name','bgColor', 'colorText', 'to', 'leftRadius'])
const { name, bgColor, colorText, to, leftRadius } = props
</script>


<template>
    <NuxtLink :to="to" class="no-underline">
        <div class="btn btn shadow-md hover:shadow-lg transition-shadow duration-200 flex items-center justify-center" :class=" leftRadius ? '' : 'ml--18' " :style="{ backgroundColor: bgColor }">
            <span class="" :style="{ color: colorText }">
                <p >{{name}}</p>
            </span>
        </div>
    </NuxtLink>    
</template>
<style scoped>
    .btn{
       width: 142px;
       height: 42px;
       border-radius: 50px;
       
    }
    .ml--18{
        margin-left: -18px;
    }



</style>