<script setup>
import { useCartStore } from '@/stores/cartStore'
import { useWishlistStore } from '@/stores/wishlistStore'
import { useAppToast } from '~/composables/useAppToast'

const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const toast = useAppToast()
const FALLBACK_PRODUCT_IMAGE = 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg'
//const props = defineProps(['id', 'name', 'img', 'promo', 'plus', 'price', 'category','brand','colorPrimary', 'colorSecondary', 'codeItem']);
const props = defineProps({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  img: { type: String, required: true },
  promo: { type: Boolean, default: false },
  plus: { type: Boolean, default: false },
  price: { type: Number, required: true },
  category: { type: Object, required: true },
  brand: { type: Object, required: true },
  colorPrimary: { type: String, required: true },
  colorSecondary: { type: String, required: true },
  codeItem: { type: String, required: true },
  onCardClick: { type: Function, required: false },
});

const { id, name, img, promo, plus, price, category, brand, colorPrimary, colorSecondary, codeItem } = props;

const addcart = (product, event) => {
  event.preventDefault() // Blocca l'azione predefinita del link
  event.stopPropagation() // Ferma la propagazione
  cartStore.addtocart(product)
  toast.success('Prodotto aggiunto al carrello!', {
    position: 'top-right',
    timeout: 3000
  });
  
}

// Add to wishlist function
const toggleWishlist = (event) => {
  event.preventDefault() // Blocca l'azione predefinita del link
  event.stopPropagation() // Ferma la propagazione
  wishlistStore.toggleWishlistItem(props)
}

const stopPropagation = (event) => {
  event.stopPropagation(); // Ferma la propagazione
};

const handleCardClick = (event) => {
  if (props.onCardClick) {
    props.onCardClick(event);
  }
};
</script>

<template>
  <nuxtLink :to="'/product/'+id" class="no-underline" @click="handleCardClick">
    <div class="card relative w-[162px] min-h-[193px] flex flex-col cursor-pointer">
        <div class="btnLike absolute right-2 top-2 text-gray-500 cursor-pointer" @click="toggleWishlist">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-black border-2 border-black rounded-full p-1" 
               :style="{ color: colorPrimary }" 
               :fill="wishlistStore.isInWishlist(id) ? 'currentColor' : 'none'" 
               viewBox="0 0 24 24" 
               stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
        </div>
        <div v-if="promo" class="btn btnPromo absolute left-1 top-1 flex items-center justify-center w-[60px] h-[21px] text-white"
            :style="{backgroundColor: colorSecondary, boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }"
        >
            <p class="text-[10px]">PROMO</p>
        </div>
        <div class="img h-[220px] ">
            <img class=" w-full h-full" :src="img || FALLBACK_PRODUCT_IMAGE" :alt="name" loading="lazy" decoding="async" fetchpriority="low" width="320" height="440">
        </div>
        <div class="descriptions text-white h-48">
            <div class="category font-bold" :style="promo ? { color: colorSecondary } : { color: 'white' }">
                <p>{{ brand.name }}</p>
            </div>
            <div class="name ">
                <p>{{name}}</p>
            </div>
            <div class="price"> 
                <span class="flex items-center">
                    <p class="mr-[5px]" :style="promo ? { color: colorSecondary } : { color: 'white' }">{{price}} € </p> 
                    <p class="text-[9px] pl-[3px]">IVA inclusa</p>
                </span>
            </div>
            <div v-if="plus" class="btn btnPlus flex items-center justify-center w-[85px] h-[30px] bg-white"
             :style="{color: colorSecondary}"
            >
                <p>PLUS</p>
            </div>
            <div class="cart" @click="addcart(props, $event)">
              <!-- <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="cart" class="h-[30px]" >
                <path d="M8.5,19A1.5,1.5,0,1,0,10,20.5,1.5,1.5,0,0,0,8.5,19ZM19,16H7a1,1,0,0,1,0-2h8.49121A3.0132,3.0132,0,0,0,18.376,11.82422L19.96143,6.2749A1.00009,1.00009,0,0,0,19,5H6.73907A3.00666,3.00666,0,0,0,3.92139,3H3A1,1,0,0,0,3,5h.92139a1.00459,1.00459,0,0,1,.96142.7251l.15552.54474.00024.00506L6.6792,12.01709A3.00006,3.00006,0,0,0,7,18H19a1,1,0,0,0,0-2ZM17.67432,7l-1.2212,4.27441A1.00458,1.00458,0,0,1,15.49121,12H8.75439l-.25494-.89221L7.32642,7ZM16.5,19A1.5,1.5,0,1,0,18,20.5,1.5,1.5,0,0,0,16.5,19Z"></path>
              </svg> -->
              🛒
            </div>
        </div>
    </div>
  </nuxtLink>  
</template> 



<style>
 /* .card {
  width: calc(13% - 10px);
  margin: 10px 10px;
} */

.img img {
  border-radius: 13px;
}
.btn{
  border-radius: 50px;
} 
.descriptions p {
   margin: 5px 0;
}
</style>
