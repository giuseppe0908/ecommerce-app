
  <template>
    <div>
      <h1>Items Store</h1>
     
  
      <div class="item flex" v-for="itemm in itemStore.items" :key="itemm.id">
        <div class="name flex flex-col border-solid border-2 border-sky-500">
          <h3 class="text-red-500 ">NAME</h3>
          <NuxtLink :to="`/product/${itemm.id}`"><p>{{ itemm.name }}</p></NuxtLink>
        </div>
        <div class="price flex flex-col border-solid border-2 border-sky-500">
          <h3 class="text-red-500 ">PRICE</h3>
          <p>{{ itemm.price }}</p>
        </div>
        <div class="codeiotem flex flex-col border-solid border-2 border-sky-500">
          <h3 class="text-red-500 ">CODEITEM</h3>
          <p>{{ itemm.codeItem }}</p>
        </div>
        <p @click="deleteItems(itemm.id)" class=" bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded align-middle ">Button</p>
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
        <form @submit.prevent="addItems">

            <!-- Name Input -->
            <div class="form-group">
                <label for="name">Product Name</label>
                <input type="text" v-model="product.name" required placeholder="Enter product name" />
            </div>

            <!-- Category Select -->
            <div class="form-group">
                <label for="categoryId">Category</label>
                <select v-model="product.categoryId" required>
                  <option v-for="category in categoryStore.categories" :key="category.id" :value="category.id">
                      {{ category.name }}
                  </option>
                </select>
            </div>

            <!-- Brand Select -->
            <div class="form-group">
                <label for="brandId">Brand</label>
                <select v-model="product.brandId" required>
                  <option v-for="brand in categoryStore.brands" :key="brand.id" :value="brand.id">
                      {{ brand.name }}
                  </option>
                </select>
            </div>

            <!-- Favorite Checkbox -->
            <div class="form-group">
                <label for="favorite">
                <input type="checkbox" v-model="product.favorite" /> Favorite
                </label>
            </div>

            <!-- Promo Checkbox -->
            <div class="form-group">
                <label for="promo">
                <input type="checkbox" v-model="product.promo" /> Promo
                </label>
            </div>

                <!-- Percentual Promo Input -->
              <div v-if="product.promo" class="form-group">
                <label for="percentualPromo">Promo Percentage</label>
                <input type="number" v-model="product.percentualPromo" placeholder="Enter promo %" min="0" max="100" />
              </div>

            <!-- Price Input -->
            <div class="form-group">
                <label for="price">Price</label>
                <input type="number" v-model="product.price" required placeholder="Enter price" min="0" step="0.01" />
            </div>

            <!-- Photo URL Input -->
            <div class="form-group">
                <label for="photo">Photo URL</label>
                <input type="url" v-model="product.photo" required placeholder="Enter image URL" />
            </div>

            <!-- Code Item Input -->
            <div class="form-group">
                <label for="codeItem">Product Code</label>
                <input type="text" v-model="product.codeItem" required placeholder="Enter product code" />
            </div>
            <!-- Submit Button -->
            <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  </template>
  <script setup>
  import { useItemStore } from '@/stores/itemStore'
  import { useCategoryStore } from '@/stores/categoryStore'

  import { onMounted, ref } from 'vue'
  
  const itemStore = useItemStore()
  const categoryStore = useCategoryStore()
  const fetchItems = () => {
    itemStore.fetchItems()
  }
  const fetchCategories= () =>{
    categoryStore.fetchCategories()
  }
  //addItem richiamata nello store
  const addItems = () =>{
    itemStore.addItem(product.value)
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
  const deleteItems = (itemId) => {
    itemStore.deleteItem(itemId)
  }

  const filterfavorite = computed(() => {
        return itemStore.items.filter((item)=>  item.favorite == true);
  });
  
  onMounted(() => {
    fetchItems();
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
  
  