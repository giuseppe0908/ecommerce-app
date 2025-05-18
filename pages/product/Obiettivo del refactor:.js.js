Obiettivo del refactor:
Pulizia e modularità → Troppa logica nel template e nello script.

Performance → Ottimizzare rendering, evitare doppioni.

Manutenibilità → Separare responsabilità (components, composables).

Best practices Nuxt 3 → Uso corretto di useAsyncData, reactive utils, e gestione query.

🎯 Refactor Aziendale: Step by Step
✅ 1. Separazione in Componenti
Components da creare:
Nome	Responsabilità
ToggleMenu.vue	Menu laterale con categorie e ricerca
NavBar.vue	Navigation con categorie in top bar
FilterSidebar.vue	Sidebar filtri (con price range e selettori)
ActiveFilters.vue	Mostra filtri attivi
ProductGrid.vue	Mostra la griglia dei prodotti (composta di Card.vue)
FilterButton.vue	Bottone singolo filtro riutilizzabile (colore dinamico)

✅ 2. Composables
Esempi:
Composable	Funzione
useFilters()	Gestisce stato, set, remove e sincronizza query string
useFetchProducts()	Si occupa della chiamata API e gestisce cache, loading, errors
useDebounced()	Funzione debounce riutilizzabile ovunque
useResponsiveButton()	Già lo usi, lo teniamo, magari rivedendo naming e tipi

✅ 3. Script Setup Pulito
Esempio in ProductPage.vue dopo il refactor:

vue
Copia
Modifica
<script setup>
import { useRoute } from 'vue-router'
import { useFilters } from '@/composables/useFilters'
import { useFetchProducts } from '@/composables/useFetchProducts'
import ToggleMenu from '@/components/ToggleMenu.vue'
import NavBar from '@/components/NavBar.vue'
import ActiveFilters from '@/components/ActiveFilters.vue'
import FilterSidebar from '@/components/FilterSidebar.vue'
import ProductGrid from '@/components/ProductGrid.vue'

// Stato del menu aperto/chiuso
const open = ref(false)
const toggleMenu = () => { open.value = !open.value }

// Gestione filtri & products
const { filters, activeFilters, updateFilter, removeFilter, syncFromRoute } = useFilters()
const { products, fetchProducts } = useFetchProducts(filters)

// Watch su cambiamenti
watch(filters, fetchProducts, { deep: true })

// Sincronizza query params su mount
onMounted(() => { syncFromRoute() })
</script>
✅ 4. Esempio Composable: useFilters.js
js
Copia
Modifica
export const useFilters = () => {
  const route = useRoute()
  const filters = reactive({
    category: '',
    brand: '',
    gender: '',
    priceMin: '',
    priceMax: '',
    promo: '',
    plus: '',
    newArrivals: ''
  })

  const syncFromRoute = () => {
    const params = ['category', 'brand', 'gender', 'priceMin', 'priceMax', 'newArrivals']
    params.forEach(param => {
      if (route.query[param]) {
        filters[param] = route.query[param]
      }
    })
  }

  const activeFilters = computed(() => {
    return Object.entries(filters)
      .filter(([_, v]) => v !== '')
      .map(([key, value]) => ({ key, label: `${key}: ${value}` }))
  })

  const updateFilter = (key, value) => { filters[key] = value }
  const removeFilter = (key) => { filters[key] = '' }

  return { filters, activeFilters, updateFilter, removeFilter, syncFromRoute }
}
✅ 5. Best Practices che applicherei
Problema	Refactor
Troppa logica nel template	Sposto tutto in piccoli components con props & emit
Doppioni di codice (es. buttons)	Creo componenti FilterButton.vue, CategoryButton.vue riutilizzabili
Fetch a mano	Uso useAsyncData / SWR pattern (Nuxt style) per caching e refetch
UI migliorabile	Uso slot nei componenti per rendere i pulsanti/filtro più flessibili
Debounce hardcoded	Creo un useDebounced() composable riusabile

✅ 6. Directory finale (clean structure)
lua
Copia
Modifica
components/
  ToggleMenu.vue
  NavBar.vue
  ActiveFilters.vue
  FilterSidebar.vue
  ProductGrid.vue
  FilterButton.vue
composables/
  useFilters.js
  useFetchProducts.js
  useDebounced.js
pages/
  products.vue  <-- semplice, orchestratore dei components
✅ 7. Bonus: Performance
Uso v-memo sui componenti statici.

Split dei filtri in keep-alive.

Lazy load su griglie e immagini già impostato? ✔️ (continua con lazyload).