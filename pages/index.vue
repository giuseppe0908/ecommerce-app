
  <template>
    <div :style="{ backgroundColor: categoryStore.colorPrimary }">
      <Jumbo :colorPrimary=categoryStore.colorPrimary />
      <Category/>
      <Promo :colorPrimary=categoryStore.colorPrimary />
      <Brand :colorPrimary=categoryStore.colorPrimary />
      <NewArrivals />
      <Banner/>
      <Cart v-if="cartStore.flag_cart" :colorPrimary=categoryStore.colorPrimary />
    </div> 
  </template>
  <script setup>
  import Jumbo from '~/components/Jumbo.vue'
  import Category from '~/components/Category.vue'
  import Promo from '~/components/Promo.vue'
  import Brand from '~/components/Brand.vue'
  import NewArrivals from '~/components/NewArrivals.vue'
  import Banner from '~/components/Banner.vue'
  import Cart from '~/components/Cart.vue'
  import { useCategoryStore } from '@/stores/categoryStore'
  import { useCartStore } from '@/stores/cartStore';

  const cartStore = useCartStore();
  const categoryStore = useCategoryStore()

  </script>
  




   

<!-- <script setup>
import { onMounted } from 'vue'
   const store = useStore()
 
   onMounted(async () => {
     await useAsyncData('item',()=> store.fetchItems()) 
     console.log("sono nel mounted");
     
   })
//    await useAsyncData('user', () => store.fetchUser())
</script> -->
  
  <style>
/* image */


</style>