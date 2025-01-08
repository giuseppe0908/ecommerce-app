<script setup>
import { useCartStore } from '@/stores/cartStore'
const cartStore = useCartStore()
const props = defineProps(['id', 'name', 'img', ' promo', 'plus', 'price', 'category','colorPrimary', 'colorSecondary', 'codeItem']);
const { id, name, img, promo, plus, price, category, colorPrimary, colorSecondary, codeItem } = props;
const addcart = (product) => {
   cartStore.addtocart(product)
}
</script>

<template>
    <div class="card relative min-w-[150px] min-h-[193px] flex flex-col">
        <div class="btnLike absolute right-2 top-2  text-gray-500 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-black border-2 border-black rounded-full p-1" :style="{ color:colorPrimary }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
        </div>
        <div v-if="promo" class="btn btnPromo absolute left-0 top-0">Promo</div>
        <div class="img h-[220px]">
            <img class=" w-full h-full" src="https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg" alt="">
        </div>
        <div class="descriptions text-white h-48">
            <div class="category font-bold" :style="{color: colorSecondary}">
                <p>{{ category.name }}</p>
            </div>
            <div class="name">
                <p>{{name}}</p>
            </div>
            <div class="price">
                
                <span class="flex items-center">
                    <p :style="{color: colorSecondary, marginRight:'5px'}">{{price}} € </p> 
                    IVA inclusa
                </span>
            </div>
            <div v-if="plus" class="btn btnPlus flex items-center justify-center"
             :style="{backgroundColor: colorSecondary}"
            >
                <p>PLUS</p>
            </div>
            <div class="cart" @click="addcart(props)">
              <!-- <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="cart" class="h-[30px]" >
                <path d="M8.5,19A1.5,1.5,0,1,0,10,20.5,1.5,1.5,0,0,0,8.5,19ZM19,16H7a1,1,0,0,1,0-2h8.49121A3.0132,3.0132,0,0,0,18.376,11.82422L19.96143,6.2749A1.00009,1.00009,0,0,0,19,5H6.73907A3.00666,3.00666,0,0,0,3.92139,3H3A1,1,0,0,0,3,5h.92139a1.00459,1.00459,0,0,1,.96142.7251l.15552.54474.00024.00506L6.6792,12.01709A3.00006,3.00006,0,0,0,7,18H19a1,1,0,0,0,0-2ZM17.67432,7l-1.2212,4.27441A1.00458,1.00458,0,0,1,15.49121,12H8.75439l-.25494-.89221L7.32642,7ZM16.5,19A1.5,1.5,0,1,0,18,20.5,1.5,1.5,0,0,0,16.5,19Z"></path>
              </svg> -->
              🛒
            </div>
        </div>
    </div>
</template> 


<!-- <template>
    <div class="card relative flex flex-col bg-white shadow-lg rounded-lg">
      <!-- Pulsante Like  
      <div class="btn-like absolute right-2 top-2 text-gray-500 cursor-pointer">
        ❤️
      </div>
      
      <!-- Badge Promo  
      <div v-if="promo" class="btn-promo absolute left-2 top-2 bg-red-500 text-white text-xs font-bold py-1 px-3 rounded-full">
        Promo
      </div>
      
      <!-- Immagine del prodotto  
      <div class="img w-full aspect-w-4 aspect-h-3">
        <img class="w-full h-full object-cover rounded-t-lg" :src="img" :alt="name" />
      </div>
      
      <!-- Descrizioni  
      <div class="descriptions flex flex-col flex-grow p-4 text-gray-700">
        <!-- Categoria  
        <p class="category font-bold text-sm" :style="{ color: colorSecondary }">
          {{ category.name }}
        </p>
        
        <!-- Nome del prodotto  
        <p class="name text-lg font-semibold mt-2">
          {{ name }}
        </p>
        
        <!-- Prezzo  
        <div class="price flex items-center mt-2">
          <p :style="{ color: colorSecondary }" class="text-lg font-bold mr-2">{{ price }} €</p>
          <span class="text-xs text-gray-500">IVA inclusa</span>
        </div>
        
        <!-- Pulsante Plus  
        <div class="flex justify-center mt-4">
          <div
            class="btn-plus w-24 h-8 flex items-center justify-center text-xs font-bold text-white rounded-full"
            v-if="plus"
            :style="{ backgroundColor: colorSecondary }"
          >
            PLUS
          </div>
          <div v-else class="w-24 h-8"></div> <!-- Spazio riservato  
        </div>
      </div>
      
      <!-- Icona carrello  
      <div class="cart mt-4 flex justify-center">
        
      </div>
    </div>
  </template> -->

<style scoped>
 .card {
  width: calc(13% - 10px);
  margin: 10px 10px;
}



.img img {
  border-radius: 13px;
}
.btn{
    width: 100px;
    height: 30px;
    border-radius: 50px;

} 
.descriptions p {
   margin: 5px 0;
}
</style>