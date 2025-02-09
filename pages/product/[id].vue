  <template>
    <div class="w-[95%] mx-auto my-0">    
      <div class="buttons flex gap-9 text-xs">
        <Button name="DONNA" :bgColor="colorPrimary" textColor="white" to="/donna" applyNegativeMargin="false" width="83px" height="30px"/>
        <Button name="UOMO" bgColor="white" :textColor="colorPrimary" to="/uomo" applyNegativeMargin="false" width="83px" height="30px"/>
        <Button name="BAMBINO" :bgColor="colorPrimary" textColor="white" to="/bambino" applyNegativeMargin="false" width="83px" height="30px"/>
      </div>
      <div class="navBar">

      </div>
      <div class="cronologia"></div>
      <div class="container flex gap-12 mt-8">
        <div class="left flex gap-2">
            <!-- Colonna delle immagini -->
          <div class="imgVertical flex flex-col gap-4">
            <img
              v-for="(image, index) in currentOtherImages"
              :key="index"
              class="img square h-[138px] w-[136px] rounded-xl cursor-pointer"
              :src="image"
              :alt="'Immagine correlata ' + index"
              @click="changeMainImage(image)"
            />
          </div>
      
          <!-- Immagine principale -->
          <div class=" w-[412px] h-[605px]">
            <img
              class="w-full h-full rounded-xl"
              :src="currentMainImage"
              alt="Immagine principale"
            />
          </div>
        </div>
        <div class="right">
          <div class="descriptions">
            <div class="brand font-bold text-black text-3xl">
              <p>{{ product.brand.name }}</p>
            </div>
            <div class="name text-[#5D758B] text-2xl">
              <p>{{ product.name }}</p>
            </div>
            <div class="price text-2xl">
              <span class="flex items-center">
                {{ product.price }} <p class="text-[#5D758B]">€ IVA inclusa</p>
              </span>
             
            </div>
            <div class="color">
              colore: Nero
            </div>
          </div>
          <!-- Miniature delle colorazioni -->
          <div class="color-thumbnails flex gap-2 items-center mt-4">
            <img
              v-for="(item, id) in img"
              :key="item.id"
              :src="item.images.main"
              :alt="'Colorazione ' + item.color"
              class="thumbnail cursor-pointer square h-[138px] w-[136px] rounded-xl cursor-pointer border"
              :class="{ active: id === currentColorIndex }"
              @click="changeColor(id)"
            />
          </div>
          <div class="disponibility">
            <p>Solo {1} disponibile!</p>
          </div>
          <div class="buttons flex gap-4 mt-4">
            <Button name="Acquista" bgColor="white" colorText="#5D758B" width="200px" height="50px" @click="addCart"/>
          </div>  
          </div>
      </div>
   </div>
</template>
  
  
  <script setup>
  import { useRoute } from 'vue-router'
  import { ref, onMounted } from 'vue'

  
  // Definisci il prodotto come un ref
  const product = ref([])
  const route = useRoute()
  const colorPrimary = "#5D758B";

  const productId = route.params.id
    const { data } = await useFetch(`/api/products/${productId}`);
    product.value = data.value || [];
    console.log(data.value);
  
  // const img = ref([
  //   {
  //     id:0,
  //     url:["https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg","https://imgs.search.brave.com/9lz0DyLBFYJy2tZ8T-nuqLvIEuW2kqDdzwSVzLNJPFM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Ym9yc2FpdGFsaWFu/YS5pdC9ob21lcGFn/ZS9pdGVtLXN0cmlw/cy9wYXJ0bmVyc2hp/cC1maW5hbnphLXNv/c3RlbmliaWxlLndl/YnA","https://imgs.search.brave.com/Hf8WRja9rNLInDTJi98CxnGkaw3FNxTK60_mA1-LP8w/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Ym9yc2FpdGFsaWFu/YS5pdC9ob21lcGFn/ZS9pdGVtLXN0cmlw/cy9pbnZlc3RpbWVu/dGktZmluYW56YS1z/b3N0ZW5pYmlsZS53/ZWJw","https://imgs.search.brave.com/FY4jzaJKU2JGJbnQKBW7c_6pi8tB4eNybSxOC_l8IZ4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Ym9yc2FpdGFsaWFu/YS5pdC9ob21lcGFn/ZS9pdGVtLXN0cmlw/cy9pbnZlc2NvZGlj/ZW1icmUud2VicA","https://imgs.search.brave.com/o1rkiH8BTrsy1dYXh9e5XSwg7NaNvsQvSe4BAWOr9bw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Ym9yc2FpdGFsaWFu/YS5pdC9ob21lcGFn/ZS9pdGVtLXN0cmlw/cy9ldmVudGktZmlu/YW56YS1zb3N0ZW5p/YmlsZS53ZWJw"],
  //   },
  //   {
  //     id:1,
  //     url:["https://imgs.search.brave.com/rPdVLd8LhZ-b_HmtxgmpQR21h2o4wvWQdZFTs0_B-DA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/c29sZGlvbmxpbmUu/aXQvcGljdHVyZXMv/MjAxOS8wOC8xMi9w/aWF6emEtYWZmYXJp/LW1pbGFuby5qcGVn","https://imgs.search.brave.com/UVvPo40DWHz3xepCyKKkvzYDWqNA2ybh_PQ7y_zvwJI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Ym9yc2FpdGFsaWFu/YS5pdC9ob21lcGFn/ZS9pdGVtLWdhbGxl/cnkvYm9yc2Etdmly/dHVhbGUuanBn","https://imgs.search.brave.com/HCpl-EqzXYvzK1IBM4G-WYMMhGOY-65WhMgttEIupZU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZXJj/YXRpLmlsc29sZTI0/b3JlLmNvbS9zdGF0/aWMvaW1nL2Vjb21t/ZXJjZS9tZXJjYXRp/LXN1YnNjcmliZS5w/bmc","https://imgs.search.brave.com/NhqBwszAM2MatONDXJUsdSnack5aVsvOZqfkiWsdeqs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/c29sZGlvbmxpbmUu/aXQvcGljdHVyZXMv/MjAyNC8wMS8xNi9k/aXZpZGVuZGlfOS5w/bmc","https://imgs.search.brave.com/ssFduhO2tceVJyFXSDelg0NAVO7DxYIIPiC4v_oBUow/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Ym9yc2FpdGFsaWFu/YS5pdC9ob21lcGFn/ZS9pdGVtLXN0cmlw/cy9hY2Nlc3NvLWNh/cGl0YWxpLWZpbmFu/emEtc29zdGVuaWJp/bGUud2VicA" ],
  //   },
  //   {
  //     id:2,
  //     url:["https://imgs.search.brave.com/rPdVLd8LhZ-b_HmtxgmpQR21h2o4wvWQdZFTs0_B-DA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/c29sZGlvbmxpbmUu/aXQvcGljdHVyZXMv/MjAxOS8wOC8xMi9w/aWF6emEtYWZmYXJp/LW1pbGFuby5qcGVn","https://imgs.search.brave.com/UVvPo40DWHz3xepCyKKkvzYDWqNA2ybh_PQ7y_zvwJI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Ym9yc2FpdGFsaWFu/YS5pdC9ob21lcGFn/ZS9pdGVtLWdhbGxl/cnkvYm9yc2Etdmly/dHVhbGUuanBn","https://imgs.search.brave.com/HCpl-EqzXYvzK1IBM4G-WYMMhGOY-65WhMgttEIupZU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZXJj/YXRpLmlsc29sZTI0/b3JlLmNvbS9zdGF0/aWMvaW1nL2Vjb21t/ZXJjZS9tZXJjYXRp/LXN1YnNjcmliZS5w/bmc","https://imgs.search.brave.com/NhqBwszAM2MatONDXJUsdSnack5aVsvOZqfkiWsdeqs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/c29sZGlvbmxpbmUu/aXQvcGljdHVyZXMv/MjAyNC8wMS8xNi9k/aXZpZGVuZGlfOS5w/bmc","https://imgs.search.brave.com/ssFduhO2tceVJyFXSDelg0NAVO7DxYIIPiC4v_oBUow/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Ym9yc2FpdGFsaWFu/YS5pdC9ob21lcGFn/ZS9pdGVtLXN0cmlw/cy9hY2Nlc3NvLWNh/cGl0YWxpLWZpbmFu/emEtc29zdGVuaWJp/bGUud2VicA" ],
  //   },
  //   {
  //     id:3,
  //     url:["https://imgs.search.brave.com/qTAiH6lscUZ0z2rRFcMoFBZ9pWAAXnGebvF76BwsLtg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NjFsOVdnVnUtNUwu/anBn","https://imgs.search.brave.com/FDu6wsthYbjt9I8ybfACxFM__mV286HST8ILxPm4zDE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zaG9w/LmdvaHVudC5jb20v/Y2RuL3Nob3AvcHJv/ZHVjdHMvY2hhcm1v/ei5qcGc_dj0xNTg3/MDc1NjA4JndpZHRo/PTUzMw","https://imgs.search.brave.com/fOdK5DasViuCjulY6H-lVeuAAPyFzK0n2ZK4TfRVi6I/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/d2lsZGVybmVzc3gu/Y29tL2Nkbi9zaG9w/L2ZpbGVzL3NjYXJw/YS1oZWxpeC1jbGlt/YmluZy1zaG9lLW1l/bnMtN19iYmM4N2Rh/OC1hMjVmLTRjZmEt/YTFkNi1mYWQ5MjE1/YTAzMDIuanBnP3Y9/MTcxODA4MzU0NiZ3/aWR0aD01MzM","https://imgs.search.brave.com/dzaAmNUFiQOu9SBfXGRP5ol0l8hNol4w00yZCdhwyZA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9ka3Mu/c2NlbmU3LmNvbS9p/cy9pbWFnZS9ka3Nj/ZG4vMjFGRFhXV1ZM/Q0NMTUJMVEdGQk9f/TGlnaHRfR3JheV9p/cy8_d2lkPTI1MiZo/ZWk9MjUyJnFsdD04/NSwwJmZtdD1qcGcm/b3Bfc2hhcnBlbj0x"],
  //   }

  // ])

  const img = ref([
  {
    id: 0,
    color: "Rosso",
    images: {
      main: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg", // Immagine principale
      others: [
        "https://imgs.search.brave.com/9lz0DyLBFYJy2tZ8T-nuqLvIEuW2kqDdzwSVzLNJPFM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Ym9yc2FpdGFsaWFu/YS5pdC9ob21lcGFn/ZS9pdGVtLXN0cmlw/cy9wYXJ0bmVyc2hp/cC1maW5hbnphLXNv/c3RlbmliaWxlLndl/YnA","https://imgs.search.brave.com/Hf8WRja9rNLInDTJi98CxnGkaw3FNxTK60_mA1-LP8w/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Ym9yc2FpdGFsaWFu/YS5pdC9ob21lcGFn/ZS9pdGVtLXN0cmlw/cy9pbnZlc3RpbWVu/dGktZmluYW56YS1z/b3N0ZW5pYmlsZS53/ZWJw",
        "https://imgs.search.brave.com/FY4jzaJKU2JGJbnQKBW7c_6pi8tB4eNybSxOC_l8IZ4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Ym9yc2FpdGFsaWFu/YS5pdC9ob21lcGFn/ZS9pdGVtLXN0cmlw/cy9pbnZlc2NvZGlj/ZW1icmUud2VicA",
        "https://imgs.search.brave.com/o1rkiH8BTrsy1dYXh9e5XSwg7NaNvsQvSe4BAWOr9bw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Ym9yc2FpdGFsaWFu/YS5pdC9ob21lcGFn/ZS9pdGVtLXN0cmlw/cy9ldmVudGktZmlu/YW56YS1zb3N0ZW5p/YmlsZS53ZWJw"
      ],
    },
  },
  {
    id: 1,
    color: "Blu",
    images: {
      main: "https://imgs.search.brave.com/rPdVLd8LhZ-b_HmtxgmpQR21h2o4wvWQdZFTs0_B-DA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/c29sZGlvbmxpbmUu/aXQvcGljdHVyZXMv/MjAxOS8wOC8xMi9w/aWF6emEtYWZmYXJp/LW1pbGFuby5qcGVn", // Immagine principale
      others: [
        "https://imgs.search.brave.com/UVvPo40DWHz3xepCyKKkvzYDWqNA2ybh_PQ7y_zvwJI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Ym9yc2FpdGFsaWFu/YS5pdC9ob21lcGFn/ZS9pdGVtLWdhbGxl/cnkvYm9yc2Etdmly/dHVhbGUuanBn",
        "https://imgs.search.brave.com/HCpl-EqzXYvzK1IBM4G-WYMMhGOY-65WhMgttEIupZU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZXJj/YXRpLmlsc29sZTI0/b3JlLmNvbS9zdGF0/aWMvaW1nL2Vjb21t/ZXJjZS9tZXJjYXRp/LXN1YnNjcmliZS5w/bmc",
        "https://imgs.search.brave.com/NhqBwszAM2MatONDXJUsdSnack5aVsvOZqfkiWsdeqs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/c29sZGlvbmxpbmUu/aXQvcGljdHVyZXMv/MjAyNC8wMS8xNi9k/aXZpZGVuZGlfOS5w/bmc",
        "https://imgs.search.brave.com/ssFduhO2tceVJyFXSDelg0NAVO7DxYIIPiC4v_oBUow/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Ym9yc2FpdGFsaWFu/YS5pdC9ob21lcGFn/ZS9pdGVtLXN0cmlw/cy9hY2Nlc3NvLWNh/cGl0YWxpLWZpbmFu/emEtc29zdGVuaWJp/bGUud2VicA" 
      ],
    },
  },
  {
    id: 2,
    color: "Verde",
    images: {
      main: "https://imgs.search.brave.com/nYQn-I6ZcecFyog0kkNR3C_f9gw5FXopetNtwY-4QBA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/c29sZGlvbmxpbmUu/aXQvcGljdHVyZXMv/MjAyMC8wNi8wMi9i/dHBfNS5qcGVn", // Immagine principale
      others: [
        "https://example.com/green1.jpg",
        "https://example.com/green2.jpg",
      ],
    },
  },
]);

const currentColorIndex = ref(0); // Indice della colorazione selezionata
const currentMainImage = ref(img.value[0].images.main); // Immagine principale iniziale
const currentOtherImages = ref(img.value[0].images.others); // Immagini correlate iniziali

const changeColor = (index) => {
  currentColorIndex.value = index;
  const selectedColor = img.value[index];
  currentMainImage.value = selectedColor.images.main;
  currentOtherImages.value = selectedColor.images.others;
};

const changeMainImage = (image) => {
  currentMainImage.value = image;
};

const addCart = () => {
  alert("Prodotto aggiunto al carrello!");
};
  
  // Recupera l'ID dalla route e chiama fetchItemById
  onMounted(async () => {
   
    
  })
  </script>
  <style>
.thumbnail {
  border: 2px solid transparent;
  transition: border-color 0.3s;
}

.thumbnail.active {
  border-color: #5D758B; /* Colore di evidenziazione */
}

  </style>
  