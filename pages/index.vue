
  <template>
    <div :style="{ backgroundColor: productStore.colorPrimary }">
      <Jumbo/>
      <!-- <h1>Items Store</h1>
     
  
      <div class="item flex" v-for="product in productStore.products" :key="product.id">
        <div class="name flex flex-col border-solid border-2 border-sky-500">
          <h3 class="text-red-500 ">NAME</h3>
          <NuxtLink :to="`/product/${product.id}`"><p>{{ product.name }}</p></NuxtLink>
        </div>
        <div class="price flex flex-col border-solid border-2 border-sky-500">
          <h3 class="text-red-500 ">PRICE</h3>
          <p>{{ product.price }}</p>
        </div>
        <div class="codeiotem flex flex-col border-solid border-2 border-sky-500">
          <h3 class="text-red-500 ">CODEITEM</h3>
          <p>{{ product.codeItem }}</p>
        </div>
        <p @click="deleteProducts(product.id)" class=" bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded align-middle ">Button</p>
      </div>
      <h2>Aggiungi un nuovo item</h2>

      <div class="favoriti">
        <h1 class="text-red-500 font-medium ">QUI TROVI TUTTI GLI ITEM FAVORITI</h1>
        <ul>
            <li v-for="fav in filterfavorite" :key="fav.id">{{fav.name}}</li>
        </ul>
      </div>
      <div class="add-new">
        <h1>Aggiungi un nuovo item</h1>
        <form @submit.prevent="addProducts">

            <!-- Name Input 
            <div class="form-group">
                <label for="name">Product Name</label>
                <input type="text" v-model="product.name" required placeholder="Enter product name" />
            </div>

            <!-- Category Select 
            <div class="form-group">
                <label for="categoryId">Category</label>
                <select v-model="product.categoryId" required>
                  <option v-for="category in categoryStore.categories" :key="category.id" :value="category.id">
                      {{ category.name }}
                  </option>
                </select>
            </div>

            <!-- Brand Select
            <div class="form-group">
                <label for="brandId">Brand</label>
                <select v-model="product.brandId" required>
                  <option v-for="brand in categoryStore.brands" :key="brand.id" :value="brand.id">
                      {{ brand.name }}
                  </option>
                </select>
            </div>

            <!-- Favorite Checkbox
            <div class="form-group">
                <label for="favorite">
                <input type="checkbox" v-model="product.favorite" /> Favorite
                </label>
            </div>

            <!-- Promo Checkbox
            <div class="form-group">
                <label for="promo">
                <input type="checkbox" v-model="product.promo" /> Promo
                </label>
            </div>

                <!-- Percentual Promo Input
              <div v-if="product.promo" class="form-group">
                <label for="percentualPromo">Promo Percentage</label>
                <input type="number" v-model="product.percentualPromo" placeholder="Enter promo %" min="0" max="100" />
              </div>

            <!-- Price Input 
            <div class="form-group">
                <label for="price">Price</label>
                <input type="number" v-model="product.price" required placeholder="Enter price" min="0" step="0.01" />
            </div>

            <!-- Photo URL Input 
            <div class="form-group">
                <label for="photo">Photo URL</label>
                <input type="url" v-model="product.photo" required placeholder="Enter image URL" />
            </div>

            <!-- Code Item Input 
            <div class="form-group">
                <label for="codeItem">Product Code</label>
                <input type="text" v-model="product.codeItem" required placeholder="Enter product code" />
            </div>
            <!-- Submit Button
            <button type="submit">Submit</button>
        </form>
      </div>-->
    </div> 
  </template>
  <script setup>
  import Jumbo from '~/components/Jumbo.vue'

  import { useProductStore } from '@/stores/productStore'
  import { useCategoryStore } from '@/stores/categoryStore'

  import { onMounted, ref } from 'vue'
  
  const productStore = useProductStore()
  const categoryStore = useCategoryStore()
  const fetchProducts = () => {
    productStore.fetchProducts()
  }
  const fetchCategories= () =>{
    categoryStore.fetchCategories()
  }
  //addProduct richiamata nello store
  const addProducts = () =>{
    productStore.addProduct(product.value)
  }

//   const name = ref("");
//   const codeItem = ref("")
//   const favorite = ref(false)
//   const percentualPromo = ref(0)
//   const photo = ref("")
//   const price = ref(0)
//   const promo =  ref(false)
const product = ref({
      name: '',
      categoryId: '',
      brandId: '',
      favorite: false,
      promo: false,
      price: 0.0,
      photo: '',
      codeItem: '',
      percentualPromo: 0,
 });
  const deleteProducts = (itemId) => {
    productStore.deleteProduct(itemId)
  }

  const filterfavorite = computed(() => {
      return productStore.products.filter((item)=>  item.favorite == true);
  });
  
  onMounted(() => {
    fetchProducts();
    fetchCategories();
  })
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
  
  