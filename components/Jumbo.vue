<template>
    <div class="jumbo bg-no-repeat w-max ">
        <div class="pt-11">
            <Button name="DONNA" :bgColor="colorPrimary" colorText="white"  to="/Donna" :leftRadius="false" width="142px" height="42px"/>
        </div>
        <div class="mt-5">
            <Button name="UOMO" bgColor="white" :colorText="colorPrimary"  to="/Uomo" :leftRadius="false" width="142px" height="42px"/>
        </div>
         <div class="mt-5">
            <Button name="BAMBINO" :bgColor="colorPrimary" colorText="white"  to="/Bambino" :leftRadius="false" width="142px" height="42px"/>
        </div>
    </div>
   
</template>

<script setup>
import Button from './Button.vue'
const props = defineProps(['colorPrimary'])
const {colorPrimary} = props

</script>
<style scoped>

.jumbo{
    background-image: url("https://imgs.search.brave.com/-yfsBO7_DQUtSG4VYhtgOOAqXJNSm_R6b4MbRAfWJos/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/cHJlbWl1bS1waG90/by9lY29tbWVyY2Ut/c2hvcHBpbmctc2hv/cHBpbmctY2FydC1s/YXB0b3BfMTE5ODg4/NC0xMDY3My5qcGc_/c2l6ZT02MjYmZXh0/PWpwZw");
    height: 39vh;
    width: 100%;
    border-bottom-right-radius: 110px;
}



</style>