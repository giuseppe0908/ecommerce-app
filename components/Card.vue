<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const store = useStore()
const props = defineProps(['id','name','category','price','brand','quantity','cod_item','preferity','promo','percentual_promo'])

</script>

<template>
  <div class="card">
    <div class="img">
        <img src="img" alt="">
    </div>
    <div class="container">
        <div class="text">
        <!-- <div class="category">{{ props.category }}</div> -->
            <div class="brand bold">{{ props.brand }}</div>
            <div class="name bold">{{ props.name }}</div>
            <div class="price" v-if="props.promo">
                <p class="bold">{{ (props.price - ((props.price * props.percentual_promo)/100)).toFixed(2) }}€</p>
                <span class="price-sale flex">
                    Prezzo ordinario: <p :class="(props.promo) ? 'price sbarrato':'price'" >{{ props.price }} €</p> <span class="red">Fino a -{{ props.percentual_promo }}%</span>
                </span>
            </div>
            <div v-else >
                <p class="bold">{{ props.price }}€</p>
            </div>
        </div>
        <div class="btn-cart">
            <p @click="cart(props)">Compra</p>
        </div>
        <div class="btn-preferity">
            <span class="centrato" @click="store.state.item[props.id].preferity = !store.state.item[props.id].preferity; prefer(store.state.item[props.id])" :class="(props.preferity) ? 'red': 't' ">
                <FontAwesomeIcon :icon="['fas', 'heart']" />
            </span>
        </div>
    </div>
   
  </div>
  
</template>

<style lang="scss">
    .card{
       /* flex: 1;  Ogni elemento occupa la stessa quantità di spazio 
        min-width: 33.33%; */
        height: 400px;
        border: 1px solid black;
        width: calc(100%/4 - 40px);
        border-radius: 30px;
        z-index: 2;
        margin: 10px 20px;
        position: relative;
        img{
            height: 250px;
            width: 100%;
            background-size: cover;
            border-top-left-radius: 30px;
            border-top-right-radius: 30px;
        }
    }
   
    .container{
        margin: 0 auto;
        width: 95%;
    }
    .bold{
        font-weight: bold;
        p{
            font-weight: bold;
        }
    }
    
    .price{
        display: flex;
        p{
            margin-right: 5px;
        }
    }
    .sbarrato{
        text-decoration: line-through;
        text-decoration-color: red;
    }
    .btn-preferity{
        position: absolute;
        top: 15px;
        right: 17px;
        height: 30px;
        width: 30px;
        border: 1px solid black;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 20px;
    }
    .centrato{
        display: flex;
        align-items: center;
        height: 100%;
        width: 100%;
        justify-content: center;
    }
    .price{
        display: flex;
        flex-direction: column;
    }
    .price-sale{
        margin-top: -10px;
        font-size: 13px;
    }
 
    .red{
        color: red;
        font-family: var(--font-family-sans-serif);
        svg{
            color: red;
        }
    }
    .btn-cart{
        border-radius: 30px;
        width: 60px;
        height: 30px;
        background-color: greenyellow;
        display: flex;
        justify-content: center;

    }
    .card-detail{
        width: 65%;
        border: 1px solid black;
        z-index: 5;
        height: 600px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border-radius: 30px;
    }
    @media screen and ( max-width: 1280px){
        .card{
            width: calc(100%/3 - 40px);
        }

    }

    @media screen and ( max-width: 768px){
  
        .card{
            width: calc(100%/2 - 40px);
        }
    }

    @media screen and ( max-width: 500px){
   
        .card{
            width: calc(100%/1 - 40px);
        }
    }
</style>