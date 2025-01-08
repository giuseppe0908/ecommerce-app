<script setup>
import { ref, computed, watch } from 'vue'
import { useCartStore } from '@/stores/cartStore';

const cartStore = useCartStore();

const info= "Se il tuo ordine raggiunge 28,90 la tua spedizione è gratuita. Per i membri Plus, è sempre offerta"
const price_shipping= 4.95

const addquantity=(item)=>{
    cartStore.addtocart(item)
    cartStore.total += item.price;
    localStorage.prezzototal = JSON.stringify(cartStore.total);
}
const removeQuantity=(item)=>{
    cartStore.removetocart(item.codeItem); 
    cartStore.total -= item.price;

}

//SVUOTA CARRELLO
const svuota =()=>{
    localStorage.removeItem('carrello');
    localStorage.removeItem('prezzototal');
    var length = cartStore.cart.length;
    cartStore.cart.splice(0,length)
    cartStore.total = 0 
}
        
</script>

<template>
    <div class="cart" v-if="(cartStore.flag_cart)" >
       <h3>Carrello</h3>
       <div class="item" v-for="(item,index) in cartStore.cart" :key="index">
        <div class="flex" >
            <div class="photo">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwvYPYCtBxtKnwYC2Maa6PsNpOVmQ6_zjUNULVJl74DA&s" alt="">
            </div>
            <div class="desc">
                <div class="brand">
                    <p><b>{{ item.brand }}</b></p>
                </div>
                <div class="name">
                    <p>{{ item.name }}</p>
                </div>
                <!-- <div :class="(item.promo) ? 'price sbarrato':'price'" v-if="!item.promo">
                    {{ item.price }}
                </div>
                <div class="price" v-else>
                    {{ item.price}}
                </div> -->
                <div class="price">
                    {{ item.price.toFixed(2) }}
                </div>
                <div class="color">
                    <p>colore:{{  }}</p>
                </div>
                <div class="size">
                    <p>Taglia: {{  }}</p>
                </div>
                <div class="quantity flex">
                    <p>Quantità: {{ item.quantity }}</p>
                    <p class="pr-2" @click="addquantity(item)">+</p>
                    <p @click="removeQuantity(item)">-</p>
                </div>
            </div>
        </div>
       </div>
       <div class="info-extra">
            <div class="info">
                <p>{{ info }}</p>
            </div>
            <div class="shipping flex between" v-if="cartStore.total <= 28.89">
                <div class="name">
                    <p>Spedizione</p>
                </div>
                <div class="value">
                    <p>{{ price_shipping }}</p>
                </div>
            </div>
            <div class="shipping flex between" v-else>
                <div class="name">
                    <p>Spedizione</p>
                </div>
                <div class="value">
                    <p> 0.00 </p>
                </div>
            </div>
           {{cartStore.total.toFixed(2) }} €
            <div class="button" v-if="cartStore.length !=0">
                <button @click="cartStore.flag_cart = !cartStore.flag_cart"><RouterLink to="/ordine">Compra</RouterLink></button>
                <button @click="svuota(), cartStore.flag_cart = !cartStore.flag_cart">Svuota</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
   .cart{
    position: absolute;
    height: 400px;
    right: 0px;
    border: 1px solid black;
    width: 300px;
    top: 64px;
    z-index: 2;
    text-align: center;
    background-color: white;
    overflow-y: auto;
   }
   .item{
    border:1px solid black
   }
   .photo{
    height: 160px;
    width: 100px;
   }
   .photo img{
    width: 100%;
    height: 130px;
    background-size: cover;
   }
   .price{
    color: red;
   }
   .flex{
    display: flex;
   }

   .between{
    justify-content: space-between;
   }
   .info-extra{
    width: 90%;
    margin: 0 auto;
    margin-top: 10px;
   }
   .info{
   
    background-color: lightgray;
   }

   /* @media screen and ( max-width: 768px){
  
    .cart{
     right: 25px;
    }
   }
   @media screen and ( max-width: 1000px){
    .cart{
        right: 30px;
    } 
}*/
</style>
