
  <template>
    <div :style="{ backgroundColor: categoryStore.colorPrimary }">
      <Jumbo :colorPrimary=categoryStore.colorPrimary />
      <Category/>
      <section class="deferred-home-section">
        <Promo :colorPrimary=categoryStore.colorPrimary />
      </section>
      <section class="deferred-home-section">
        <Brand :colorPrimary=categoryStore.colorPrimary />
      </section>
      <section class="deferred-home-section">
        <NewArrivals />
      </section>
      <section class="deferred-home-section">
        <Banner/>
      </section>
    </div> 
  </template>
  <script setup>
  import Jumbo from '~/components/Jumbo.vue'
  import Category from '~/components/Category.vue'
  import Promo from '~/components/Promo.vue'
  import Brand from '~/components/Brand.vue'
  import NewArrivals from '~/components/NewArrivals.vue'
  import Banner from '~/components/Banner.vue'
  import { useCategoryStore } from '@/stores/categoryStore'
  const categoryStore = useCategoryStore()

  const { canonicalUrl, siteName } = usePageSeo({
    title: 'Moda, sneakers e accessori online',
    description: 'Scopri novita, promo e best seller del catalogo con un percorso di acquisto veloce e ottimizzato.',
    path: '/',
  })

  useHead(() => ({
    script: [
      {
        key: 'homepage-jsonld',
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: siteName.value,
          url: canonicalUrl.value,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${canonicalUrl.value}product?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        }),
      },
    ],
  }))

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
.deferred-home-section {
  content-visibility: auto;
  contain-intrinsic-size: 900px;
}


</style>
