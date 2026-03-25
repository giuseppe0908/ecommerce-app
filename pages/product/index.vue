<template>
  <div class="catalog-page">
    <transition name="fade">
      <div
        v-if="isMenuOpen"
        class="fixed inset-0 z-50 overflow-y-auto bg-[#5D758B] px-4 py-6 text-white"
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalog-mobile-menu"
      >
        <div class="mx-auto max-w-5xl">
          <div class="mb-6 flex items-center justify-between">
            <nav class="flex gap-6 text-sm font-semibold" aria-label="Schede genere mobile">
              <button
                v-for="tab in GENDER_TABS"
                :key="tab.id"
                type="button"
                class="border-b-2 pb-1 transition"
                :class="activeGenderTab === tab.id ? 'border-white text-white' : 'border-transparent text-slate-300 hover:text-white'"
                @click="setActiveGenderTab(tab.id)"
              >
                {{ tab.label }}
              </button>
            </nav>

            <button
              type="button"
              class="rounded-md px-3 py-1 text-2xl text-slate-200 transition hover:bg-white/10 hover:text-white"
              aria-label="Chiudi menu catalogo"
              @click="toggleMobileMenu"
            >
              ×
            </button>
          </div>

          <div class="mb-6">
            <input
              v-model="searchQuery"
              type="search"
              placeholder="RICERCA"
              class="w-full rounded-xl border border-white/20 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-0"
              aria-label="Cerca prodotti"
              @input="handleSearchInput"
            >
          </div>

          <div class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            <article
              v-for="category in catalogCategories"
              :key="category.id"
              class="group"
            >
              <button
                type="button"
                class="w-full text-left"
                :aria-label="`Vai alla categoria ${category.name}`"
                @click="applyCategoryFromMenu(category)"
              >
                <div class="relative overflow-hidden rounded-2xl shadow-lg">
                  <img
                    :src="category.image"
                    :alt="`Categoria ${category.name}`"
                    class="h-40 w-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  >
                  <div class="absolute inset-x-3 bottom-3 rounded-full bg-white/95 px-4 py-2 text-center text-sm font-semibold text-[#5D758B] shadow">
                    {{ category.name }}
                  </div>
                </div>
              </button>
            </article>
          </div>
        </div>
      </div>
    </transition>

    <section class="catalog-page__header">
      <div class="catalog-page__tabs">
        <button
          v-for="tab in GENDER_TABS"
          :key="tab.id"
          type="button"
          class="catalog-page__tab"
          :class="{ 'catalog-page__tab--active': isGenderActive(tab.id) }"
          @click="applyGenderFilter(tab.id)"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="catalog-page__nav-row">
        <button
          type="button"
          class="catalog-page__menu-button"
          aria-label="Apri menu catalogo"
          @click="toggleMobileMenu"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <nav class="catalog-page__nav" aria-label="Categorie catalogo">
          <button
            v-for="category in catalogCategories"
            :key="category.id"
            type="button"
            class="catalog-page__nav-item"
            :class="{ 'catalog-page__nav-item--active': isCategoryActive(category) }"
            @click="applyCategoryFilter(category)"
          >
            {{ category.name.toUpperCase() }}
          </button>
        </nav>
      </div>

      <p class="catalog-page__breadcrumb">
        {{ breadcrumbTrail.join(' > ') }}
      </p>
    </section>

    <div class="catalog-page__layout">
      <aside class="catalog-sidebar">
        <section class="catalog-sidebar__section">
          <h2>{{ sidebarTitle }}</h2>
          <ul>
            <li v-for="item in sidebarItems" :key="item.type + '-' + item.id">
              <button
                v-if="item.type === 'subCategory'"
                type="button"
                class="catalog-sidebar__link"
                :class="{ 'catalog-sidebar__link--active': isSubCategoryActive(item) }"
                @click="applySubCategoryFilter(item)"
              >
                {{ item.name.toUpperCase() }}
              </button>

              <button
                v-else
                type="button"
                class="catalog-sidebar__link"
                :class="{ 'catalog-sidebar__link--active': isCategoryActive(item) }"
                @click="applyCategoryFilter(item)"
              >
                {{ item.name.toUpperCase() }}
              </button>
            </li>
          </ul>
        </section>

        <section class="catalog-sidebar__controls">
          <div class="catalog-sidebar__search">
            <label for="catalog-search" class="catalog-sidebar__label">Cerca</label>
            <input
              id="catalog-search"
              v-model="searchQuery"
              type="search"
              placeholder="RICERCA"
              class="catalog-sidebar__input"
              @input="handleSearchInput"
            >
          </div>

          <button
            type="button"
            class="catalog-sidebar__toggle"
            :aria-expanded="isAdvancedFiltersOpen"
            @click="toggleAdvancedFilters"
          >
            {{ isAdvancedFiltersOpen ? 'Chiudi filtri avanzati' : 'Apri filtri avanzati' }}
          </button>

          <div class="catalog-sidebar__advanced" :class="{ 'catalog-sidebar__advanced--open': isAdvancedFiltersOpen }">
            <div class="catalog-sidebar__field">
              <label class="catalog-sidebar__label" for="brand-filter">Brand</label>
              <select
                id="brand-filter"
                v-model="selectedBrand"
                class="catalog-sidebar__select"
                @change="applyBrandSelection"
              >
                <option value="">Tutti i brand</option>
                <option
                  v-for="brand in brands"
                  :key="brand.id"
                  :value="normalizeName(brand.name)"
                >
                  {{ brand.name }}
                </option>
              </select>
            </div>

            <PriceRangeFilter
              :min-price="priceConstraints.min"
              :max-price="priceConstraints.max"
              :current-range="priceRange"
              :color-primary="colorPrimary"
              @update:range="updatePriceRange"
              @apply="applyPriceFilter"
              @reset="resetPriceFilter"
            />
          </div>
        </section>
      </aside>

      <main class="catalog-content">
        <div class="catalog-content__filters-bar">
          <button
            type="button"
            class="catalog-filter-btn catalog-filter-btn--outline"
            @click="toggleAdvancedFilters"
          >
            FILTRI
          </button>

          <label class="catalog-filter-select">
            <span>Ordina</span>
            <select v-model="selectedSort" @change="applySortSelection">
              <option v-for="option in SORT_OPTIONS" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>

          <button
            type="button"
            class="catalog-filter-btn"
            :class="{ 'catalog-filter-btn--active': isBooleanFilterActive('inStock') }"
            @click="toggleBooleanFilter('inStock')"
          >
            Consegna
          </button>

          <button
            type="button"
            class="catalog-filter-btn"
            :class="{ 'catalog-filter-btn--active': isBooleanFilterActive('promo') }"
            @click="toggleBooleanFilter('promo')"
          >
            Promo
          </button>

          <button
            type="button"
            class="catalog-filter-btn"
            :class="{ 'catalog-filter-btn--active': !!selectedBrand }"
            @click="toggleAdvancedFilters"
          >
            Brand
          </button>

          <button
            type="button"
            class="catalog-filter-btn"
            :class="{ 'catalog-filter-btn--active': hasPriceFilter }"
            @click="toggleAdvancedFilters"
          >
            Prezzo
          </button>

          <button
            type="button"
            class="catalog-filter-btn"
            :class="{ 'catalog-filter-btn--active': isBooleanFilterActive('newArrivals') }"
            @click="toggleBooleanFilter('newArrivals')"
          >
            Novita
          </button>

          <button
            type="button"
            class="catalog-filter-btn catalog-filter-btn--outline"
            @click="clearAllFilters"
          >
            Reset
          </button>
        </div>

        <div v-if="activeFilters.length > 0" class="catalog-content__active-filters">
          <button
            v-for="filter in activeFilters"
            :key="filter.key"
            type="button"
            class="catalog-content__active-filter"
            @click="removeFilter(filter.key)"
          >
            {{ filter.label }} ×
          </button>
        </div>

        <div class="catalog-content__summary">
          <div>
            <h1>{{ catalogTitle }}</h1>
            <p>{{ resultSummary }}</p>
          </div>

          <div class="catalog-content__summary-box">
            <strong>{{ selectedSortLabel }}</strong>
            <span>Pagina {{ pagination.page }} di {{ pagination.pages || 1 }}</span>
          </div>
        </div>

        <section class="catalog-content__products" :aria-busy="isLoading">
          <div v-if="isLoading" class="catalog-content__loading">
            <div class="catalog-content__spinner"></div>
          </div>

          <div
            v-else-if="products.length === 0"
            class="catalog-content__empty"
          >
            <p class="catalog-content__empty-title">Nessun prodotto trovato</p>
            <p class="catalog-content__empty-copy">
              Prova a modificare ricerca, brand o intervallo di prezzo.
            </p>
          </div>

          <div v-else class="catalog-content__grid">
            <CatalogProductCard
              v-for="product in products"
              :key="product.id"
              :id="product.id"
              :name="product.name"
              :img="product.photo"
              :code-item="product.codeItem"
              :promo="product.promo"
              :plus="product.plus"
              :price="product.price"
              :percentual-promo="product.percentualPromo"
              :category="product.category"
              :sub-category="product.subCategory"
              :brand="product.brand"
              :color-primary="colorPrimary"
            />
          </div>
        </section>

        <div
          v-if="pagination.pages > 1"
          class="catalog-content__pagination"
        >
          <button
            type="button"
            class="catalog-content__pagination-button"
            :disabled="pagination.page <= 1"
            @click="goToPage(pagination.page - 1)"
          >
            Pagina precedente
          </button>

          <div class="catalog-content__pagination-pages">
            <button
              v-for="pageNumber in paginationPages"
              :key="pageNumber"
              type="button"
              class="catalog-content__pagination-page"
              :class="{ 'catalog-content__pagination-page--active': pageNumber === pagination.page }"
              @click="goToPage(pageNumber)"
            >
              {{ pageNumber }}
            </button>
          </div>

          <button
            type="button"
            class="catalog-content__pagination-button"
            :disabled="pagination.page >= pagination.pages"
            @click="goToPage(pagination.page + 1)"
          >
            Pagina successiva
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CatalogProductCard from '~/components/Product/CatalogProductCard.vue'

const route = useRoute()
const router = useRouter()

const colorPrimary = '#5D758B'
const FALLBACK_CATEGORY_IMAGE = 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg'
const DEBOUNCE_DELAY_MS = 350

const GENDER_TABS = [
  { id: 'donna', label: 'DONNA' },
  { id: 'uomo', label: 'UOMO' },
  { id: 'bambini', label: 'BAMBINO' },
]

const SORT_OPTIONS = [
  { value: 'id:desc', label: 'Più recenti' },
  { value: 'price:asc', label: 'Prezzo crescente' },
  { value: 'price:desc', label: 'Prezzo decrescente' },
  { value: 'name:asc', label: 'Nome A-Z' },
  { value: 'rating:desc', label: 'Valutazione migliore' },
]

const { data: categoriesData } = await useFetch('/api/categories')
const { data: gendersData } = await useFetch('/api/genders')
const { data: brandsData } = await useFetch('/api/brands')

const categories = computed(() => (Array.isArray(categoriesData.value) ? categoriesData.value : []))
const genders = computed(() => (Array.isArray(gendersData.value) ? gendersData.value : []))
const brands = computed(() => (Array.isArray(brandsData.value) ? brandsData.value : []))

const isMenuOpen = ref(false)
const isAdvancedFiltersOpen = ref(false)
const isLoading = ref(false)
const activeGenderTab = ref('donna')
const searchQuery = ref('')
const selectedBrand = ref('')
const selectedSort = ref('id:desc')
const products = ref([])
const pagination = ref({
  total: 0,
  page: 1,
  limit: 12,
  pages: 0,
})
const priceConstraints = ref({
  min: 0,
  max: 1000,
})
const priceRange = ref({
  min: 0,
  max: 1000,
})
const lastRequestKey = ref('')

let searchDebounceTimer

function toFirstString(value) {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : ''
  }

  return typeof value === 'string' ? value : ''
}

function normalizeName(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function parsePositiveNumber(value) {
  const parsed = Number(toFirstString(value))
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

function parsePositiveInt(value, fallback = 1) {
  const parsed = Number.parseInt(toFirstString(value), 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

function findEntityByQuery(collection, rawValue) {
  const normalizedQuery = normalizeName(toFirstString(rawValue))
  if (!normalizedQuery) return null

  return (
    collection.find((entity) => String(entity.id) === normalizedQuery) ||
    collection.find((entity) => normalizeName(entity.name) === normalizedQuery) ||
    null
  )
}

function parseSortValue(rawSort) {
  const [sortBy = 'id', sortOrder = 'desc'] = String(rawSort || 'id:desc').split(':')
  return {
    sortBy,
    sortOrder,
  }
}

function buildCategoryImage(category) {
  const selectedGender = findEntityByQuery(genders.value, activeGenderTab.value)
  const categoryImages = Array.isArray(category?.images) ? category.images : []

  return (
    categoryImages.find((image) => image.genderId === selectedGender?.id)?.imageUrl ||
    categoryImages[0]?.imageUrl ||
    FALLBACK_CATEGORY_IMAGE
  )
}

const catalogCategories = computed(() =>
  categories.value.map((category) => ({
    ...category,
    image: buildCategoryImage(category),
  }))
)

const allSubCategories = computed(() =>
  categories.value.flatMap((category) =>
    Array.isArray(category.subCategories)
      ? category.subCategories.map((subCategory) => ({
          ...subCategory,
          categoryId: category.id,
          categoryName: category.name,
        }))
      : []
  )
)

const activeFilters = computed(() => {
  const filters = []
  const category = findEntityByQuery(categories.value, route.query.category)
  const brand = findEntityByQuery(brands.value, route.query.brand)
  const gender = findEntityByQuery(genders.value, route.query.gender)
  const subCategory = findEntityByQuery(allSubCategories.value, route.query.subCategory)

  if (searchQuery.value.trim()) {
    filters.push({ key: 'q', label: `Ricerca: ${searchQuery.value.trim()}` })
  }

  if (category) {
    filters.push({ key: 'category', label: category.name })
  }

  if (subCategory) {
    filters.push({ key: 'subCategory', label: subCategory.name })
  }

  if (brand) {
    filters.push({ key: 'brand', label: brand.name })
  }

  if (gender) {
    filters.push({ key: 'gender', label: gender.name })
  }

  if (toFirstString(route.query.priceMin)) {
    filters.push({ key: 'priceMin', label: `Da €${toFirstString(route.query.priceMin)}` })
  }

  if (toFirstString(route.query.priceMax)) {
    filters.push({ key: 'priceMax', label: `Fino a €${toFirstString(route.query.priceMax)}` })
  }

  if (toFirstString(route.query.newArrivals) === 'true') {
    filters.push({ key: 'newArrivals', label: 'Nuovi arrivi' })
  }

  if (toFirstString(route.query.promo) === 'true') {
    filters.push({ key: 'promo', label: 'Promo' })
  }

  if (toFirstString(route.query.inStock) === 'true') {
    filters.push({ key: 'inStock', label: 'Disponibili' })
  }

  return filters
})

const resultSummary = computed(() => {
  if (pagination.value.total === 0) {
    return 'Nessun risultato per i filtri selezionati.'
  }

  const start = (pagination.value.page - 1) * pagination.value.limit + 1
  const end = Math.min(pagination.value.total, pagination.value.page * pagination.value.limit)
  return `Visualizzi ${start}-${end} di ${pagination.value.total} prodotti.`
})

const selectedCategory = computed(() => findEntityByQuery(categories.value, route.query.category))
const selectedBrandEntity = computed(() => findEntityByQuery(brands.value, route.query.brand))
const selectedGenderEntity = computed(() => findEntityByQuery(genders.value, route.query.gender))
const selectedSubCategory = computed(() => findEntityByQuery(allSubCategories.value, route.query.subCategory))
const hasNonCanonicalCatalogQuery = computed(() => Object.keys(route.query).length > 0)
const hasPriceFilter = computed(
  () => Boolean(toFirstString(route.query.priceMin) || toFirstString(route.query.priceMax))
)

const sidebarTitle = computed(() =>
  String(selectedSubCategory.value?.name || selectedCategory.value?.name || 'Categorie').toUpperCase()
)

const sidebarItems = computed(() => {
  if (selectedCategory.value?.subCategories?.length) {
    return selectedCategory.value.subCategories.map((subCategory) => ({
      ...subCategory,
      type: 'subCategory',
    }))
  }

  return catalogCategories.value.map((category) => ({
    ...category,
    type: 'category',
  }))
})

const breadcrumbTrail = computed(() => {
  const segments = [
    selectedGenderEntity.value?.name,
    selectedCategory.value?.name,
    selectedSubCategory.value?.name,
  ].filter(Boolean)

  return segments.length > 0 ? segments : ['Catalogo']
})

const selectedSortLabel = computed(
  () => SORT_OPTIONS.find((option) => option.value === selectedSort.value)?.label || 'Più recenti'
)

const catalogTitle = computed(() => {
  if (searchQuery.value.trim()) {
    return `Risultati ricerca: ${searchQuery.value.trim()}`
  }

  const labels = [
    selectedCategory.value?.name,
    selectedSubCategory.value?.name,
    selectedBrandEntity.value?.name,
    selectedGenderEntity.value?.name,
  ].filter(Boolean)

  return labels.length > 0 ? `Catalogo ${labels.join(' · ')}` : 'Catalogo prodotti'
})

const catalogDescription = computed(() => {
  if (searchQuery.value.trim()) {
    return `Esplora i risultati per "${searchQuery.value.trim()}" nel catalogo prodotti, con filtri su brand, categoria, disponibilita e fascia prezzo.`
  }

  if (activeFilters.value.length > 0) {
    return `Catalogo filtrato per ${activeFilters.value.map((filter) => filter.label).join(', ')}. Scopri disponibilita, promozioni e varianti aggiornate.`
  }

  return 'Esplora il catalogo completo con brand, categorie, promo, nuovi arrivi e disponibilita aggiornate lato server.'
})

const { baseUrl, canonicalUrl, siteName } = usePageSeo({
  title: catalogTitle,
  description: catalogDescription,
  path: '/product',
  index: computed(() => !hasNonCanonicalCatalogQuery.value),
})

useHead(() => ({
  script: [
    {
      key: 'catalog-jsonld',
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: catalogTitle.value,
        description: catalogDescription.value,
        url: canonicalUrl.value,
        isPartOf: {
          '@type': 'WebSite',
          name: siteName.value,
          url: `${baseUrl.value}/`,
        },
      }),
    },
  ],
}))

const paginationPages = computed(() => {
  const totalPages = pagination.value.pages
  const currentPage = pagination.value.page
  if (totalPages <= 1) return []

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1])
  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right)
})

function syncStateFromRoute() {
  searchQuery.value = toFirstString(route.query.q)
  selectedBrand.value = normalizeName(toFirstString(route.query.brand))

  const routeSortBy = toFirstString(route.query.sortBy)
  const routeSortOrder = toFirstString(route.query.sortOrder)
  selectedSort.value = SORT_OPTIONS.some(
    (option) => option.value === `${routeSortBy || 'id'}:${routeSortOrder || 'desc'}`
  )
    ? `${routeSortBy || 'id'}:${routeSortOrder || 'desc'}`
    : 'id:desc'

  const routeGender = normalizeName(toFirstString(route.query.gender))
  if (GENDER_TABS.some((tab) => tab.id === routeGender)) {
    activeGenderTab.value = routeGender
  }

  const routePriceMin = parsePositiveNumber(route.query.priceMin)
  const routePriceMax = parsePositiveNumber(route.query.priceMax)

  priceRange.value = {
    min: routePriceMin ?? priceConstraints.value.min,
    max: routePriceMax ?? priceConstraints.value.max,
  }
}

function getCleanQueryValue(value) {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'string' && value.trim() === '') return undefined
  return value
}

function applyQueryPatch(patch, options = {}) {
  const { resetPage = true, closePanels = false } = options
  const nextQuery = { ...route.query }

  for (const [key, value] of Object.entries(patch)) {
    const normalizedValue = getCleanQueryValue(value)
    if (normalizedValue === undefined) {
      delete nextQuery[key]
    } else {
      nextQuery[key] = normalizedValue
    }
  }

  if (resetPage) {
    delete nextQuery.page
  }

  router.replace({ query: nextQuery })

  if (closePanels) {
    isAdvancedFiltersOpen.value = false
    if (isMenuOpen.value) {
      toggleMobileMenu()
    }
  }
}

function buildSearchApiQuery() {
  const category = findEntityByQuery(categories.value, route.query.category)
  const brand = findEntityByQuery(brands.value, route.query.brand)
  const gender = findEntityByQuery(genders.value, route.query.gender)
  const { sortBy, sortOrder } = parseSortValue(selectedSort.value)

  const apiQuery = {
    page: String(parsePositiveInt(route.query.page, 1)),
    limit: String(pagination.value.limit || 12),
    sortBy,
    sortOrder,
  }

  if (searchQuery.value.trim()) {
    apiQuery.q = searchQuery.value.trim()
  }

  if (category?.id) {
    apiQuery.categories = String(category.id)
  }

  if (brand?.id) {
    apiQuery.brands = String(brand.id)
  }

  if (gender?.id) {
    apiQuery.gender = String(gender.id)
  }

  if (selectedSubCategory.value?.id) {
    apiQuery.subCategory = String(selectedSubCategory.value.id)
  }

  if (toFirstString(route.query.promo) === 'true') {
    apiQuery.onSale = 'true'
  }

  if (toFirstString(route.query.inStock) === 'true') {
    apiQuery.inStock = 'true'
  }

  if (toFirstString(route.query.newArrivals) === 'true') {
    apiQuery.newArrivals = 'true'
  }

  if (toFirstString(route.query.priceMin)) {
    apiQuery.priceMin = toFirstString(route.query.priceMin)
  }

  if (toFirstString(route.query.priceMax)) {
    apiQuery.priceMax = toFirstString(route.query.priceMax)
  }

  return apiQuery
}

async function fetchProducts() {
  syncStateFromRoute()

  const apiQuery = buildSearchApiQuery()
  const requestKey = JSON.stringify(apiQuery)

  if (requestKey === lastRequestKey.value) {
    return
  }

  lastRequestKey.value = requestKey
  isLoading.value = true

  try {
    const payload = await $fetch('/api/products/search', {
      query: apiQuery,
    })

    products.value = Array.isArray(payload?.products) ? payload.products : []
    pagination.value = {
      total: Number(payload?.pagination?.total || 0),
      page: Number(payload?.pagination?.page || 1),
      limit: Number(payload?.pagination?.limit || 12),
      pages: Number(payload?.pagination?.pages || 0),
    }

    const nextMin = Number(payload?.facets?.priceRange?.min || 0)
    const nextMax = Number(payload?.facets?.priceRange?.max || 0)
    priceConstraints.value = {
      min: nextMin,
      max: nextMax > nextMin ? nextMax : nextMin + 1,
    }

    const routePriceMin = parsePositiveNumber(route.query.priceMin)
    const routePriceMax = parsePositiveNumber(route.query.priceMax)
    priceRange.value = {
      min: routePriceMin ?? priceConstraints.value.min,
      max: routePriceMax ?? priceConstraints.value.max,
    }

    if (pagination.value.pages > 0 && pagination.value.page > pagination.value.pages) {
      applyQueryPatch({ page: String(pagination.value.pages) }, { resetPage: false })
    }
  } catch (error) {
    console.error('Errore caricamento catalogo:', error)
    products.value = []
    pagination.value = {
      total: 0,
      page: 1,
      limit: 12,
      pages: 0,
    }
  } finally {
    isLoading.value = false
  }
}

function handleSearchInput() {
  clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    applyQueryPatch({ q: searchQuery.value.trim() })
  }, DEBOUNCE_DELAY_MS)
}

function toggleMobileMenu() {
  isMenuOpen.value = !isMenuOpen.value

  if (process.client) {
    document.body.style.overflow = isMenuOpen.value ? 'hidden' : ''
  }
}

function toggleAdvancedFilters() {
  isAdvancedFiltersOpen.value = !isAdvancedFiltersOpen.value
}

function setActiveGenderTab(tabId) {
  activeGenderTab.value = tabId
}

function applyCategoryFilter(category) {
  applyQueryPatch({
    category: normalizeName(category.name),
    subCategory: undefined,
  })
}

function applyCategoryFromMenu(category) {
  applyQueryPatch(
    {
      category: normalizeName(category.name),
      gender: normalizeName(toFirstString(route.query.gender)) || activeGenderTab.value,
      subCategory: undefined,
    },
    { closePanels: true }
  )
}

function findParentCategoryForSubCategory(subCategory) {
  if (!subCategory) return null

  return (
    categories.value.find((category) => category.id === subCategory.categoryId) ||
    categories.value.find((category) =>
      Array.isArray(category.subCategories)
        ? category.subCategories.some((candidate) => candidate.id === subCategory.id)
        : false
    ) ||
    null
  )
}

function applySubCategoryFilter(subCategory) {
  const parentCategory = findParentCategoryForSubCategory(subCategory)

  applyQueryPatch({
    category: parentCategory ? normalizeName(parentCategory.name) : undefined,
    subCategory: normalizeName(subCategory.name),
  })
}

function applyGenderFilter(genderSlug) {
  if (isGenderActive(genderSlug)) {
    applyQueryPatch({ gender: undefined })
    return
  }

  applyQueryPatch({ gender: genderSlug })
}

function applyBrandSelection() {
  applyQueryPatch({
    brand: selectedBrand.value || undefined,
  })
}

function applySortSelection() {
  const { sortBy, sortOrder } = parseSortValue(selectedSort.value)
  applyQueryPatch(
    {
      sortBy,
      sortOrder,
    },
    { resetPage: false }
  )
}

function toggleBooleanFilter(filterKey) {
  const isActive = toFirstString(route.query[filterKey]) === 'true'
  applyQueryPatch({
    [filterKey]: isActive ? undefined : 'true',
  })
}

function updatePriceRange(range) {
  priceRange.value = { ...range }
}

function applyPriceFilter() {
  applyQueryPatch(
    {
      priceMin:
        priceRange.value.min > priceConstraints.value.min ? String(priceRange.value.min) : undefined,
      priceMax:
        priceRange.value.max < priceConstraints.value.max ? String(priceRange.value.max) : undefined,
    },
    { closePanels: true }
  )
}

function resetPriceFilter() {
  priceRange.value = {
    min: priceConstraints.value.min,
    max: priceConstraints.value.max,
  }

  applyQueryPatch(
    {
      priceMin: undefined,
      priceMax: undefined,
    },
    { closePanels: true }
  )
}

function removeFilter(filterKey) {
  if (filterKey === 'q') {
    searchQuery.value = ''
  }

  if (filterKey === 'priceMin' || filterKey === 'priceMax') {
    priceRange.value = {
      min: priceConstraints.value.min,
      max: priceConstraints.value.max,
    }
  }

  applyQueryPatch({
    [filterKey]: undefined,
    ...(filterKey === 'category' ? { subCategory: undefined } : {}),
  })
}

function clearAllFilters() {
  searchQuery.value = ''
  selectedBrand.value = ''
  selectedSort.value = 'id:desc'
  priceRange.value = {
    min: priceConstraints.value.min,
    max: priceConstraints.value.max,
  }

  router.replace({
    query: {},
  })
}

function goToPage(pageNumber) {
  if (pageNumber < 1 || pageNumber > pagination.value.pages) return
  applyQueryPatch({ page: String(pageNumber) }, { resetPage: false })
}

function isCategoryActive(category) {
  return normalizeName(toFirstString(route.query.category)) === normalizeName(category.name)
}

function isSubCategoryActive(subCategory) {
  return normalizeName(toFirstString(route.query.subCategory)) === normalizeName(subCategory.name)
}

function isGenderActive(genderSlug) {
  return normalizeName(toFirstString(route.query.gender)) === normalizeName(genderSlug)
}

function isBooleanFilterActive(filterKey) {
  return toFirstString(route.query[filterKey]) === 'true'
}

watch(
  () => route.query,
  () => {
    lastRequestKey.value = ''
    fetchProducts()
  },
  { deep: true, immediate: true }
)

onBeforeUnmount(() => {
  clearTimeout(searchDebounceTimer)
  if (process.client) {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.catalog-page {
  --primary-color: #5d7488;
  --text-dark: #333;
  --text-light: #777;
  --bg-gray: #f5f5f5;
  --border-color: #e0e0e0;
  color: var(--text-dark);
  padding: 20px 30px 40px;
}

.catalog-page__header {
  margin-bottom: 24px;
}

.catalog-page__tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.catalog-page__tab {
  padding: 8px 25px;
  border-radius: 20px;
  border: 1px solid var(--primary-color);
  background: var(--primary-color);
  color: #fff;
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
}

.catalog-page__tab--active {
  background: #fff;
  color: var(--primary-color);
}

.catalog-page__nav-row {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 15px;
}

.catalog-page__menu-button {
  display: none;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background: #fff;
  color: var(--primary-color);
  align-items: center;
  justify-content: center;
}

.catalog-page__nav {
  display: flex;
  gap: 25px;
  flex-wrap: wrap;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-light);
}

.catalog-page__nav-item {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.catalog-page__nav-item--active {
  color: var(--text-dark);
  font-weight: 700;
}

.catalog-page__breadcrumb {
  font-size: 13px;
  color: var(--text-dark);
  font-weight: 600;
}

.catalog-page__layout {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.catalog-sidebar {
  width: 200px;
  flex-shrink: 0;
}

.catalog-sidebar__section {
  margin-bottom: 24px;
}

.catalog-sidebar__section h2 {
  font-size: 14px;
  margin-bottom: 15px;
}

.catalog-sidebar__section ul {
  list-style: none;
  padding-left: 0;
}

.catalog-sidebar__section li + li {
  margin-top: 12px;
}

.catalog-sidebar__link {
  border: 0;
  background: transparent;
  color: var(--primary-color);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
}

.catalog-sidebar__link--active {
  color: var(--text-dark);
}

.catalog-sidebar__controls {
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 16px;
}

.catalog-sidebar__search {
  margin-bottom: 14px;
}

.catalog-sidebar__label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 8px;
  text-transform: uppercase;
  color: var(--text-light);
}

.catalog-sidebar__input,
.catalog-sidebar__select {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 10px 14px;
  font-size: 13px;
  background: #fff;
}

.catalog-sidebar__toggle {
  width: 100%;
  border: 1px solid var(--primary-color);
  border-radius: 16px;
  background: transparent;
  color: var(--primary-color);
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.catalog-sidebar__advanced {
  display: none;
  margin-top: 14px;
}

.catalog-sidebar__advanced--open {
  display: block;
}

.catalog-sidebar__field {
  margin-bottom: 16px;
}

.catalog-content {
  flex: 1;
  min-width: 0;
}

.catalog-content__filters-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.catalog-filter-btn,
.catalog-filter-select {
  padding: 6px 15px;
  border-radius: 15px;
  border: none;
  background: var(--primary-color);
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.catalog-filter-btn--outline {
  background: #fff;
  color: var(--text-dark);
  border: 1px solid var(--border-color);
}

.catalog-filter-btn--active {
  background: #223040;
}

.catalog-filter-select select {
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 12px;
  outline: none;
}

.catalog-content__active-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.catalog-content__active-filter {
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: #fff;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
}

.catalog-content__summary {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 30px;
}

.catalog-content__summary h1 {
  font-size: 24px;
  margin-bottom: 6px;
}

.catalog-content__summary p {
  color: var(--text-light);
  font-size: 13px;
}

.catalog-content__summary-box {
  min-width: 180px;
  padding: 12px 14px;
  border-radius: 16px;
  background: var(--bg-gray);
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.catalog-content__products {
  min-height: 280px;
}

.catalog-content__loading,
.catalog-content__empty {
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.catalog-content__spinner {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  border: 4px solid #dbe3e8;
  border-top-color: var(--primary-color);
  animation: spin 0.8s linear infinite;
}

.catalog-content__empty {
  border: 1px dashed var(--border-color);
  border-radius: 18px;
  background: #fafafa;
  text-align: center;
  padding: 24px;
}

.catalog-content__empty-title {
  font-size: 18px;
  font-weight: 700;
}

.catalog-content__empty-copy {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-light);
}

.catalog-content__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.catalog-content__pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 32px;
  flex-wrap: wrap;
}

.catalog-content__pagination-button,
.catalog-content__pagination-page {
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background: #fff;
  color: var(--text-dark);
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.catalog-content__pagination-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.catalog-content__pagination-pages {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.catalog-content__pagination-page--active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: #fff;
}

.fade-enter-active,
.fade-leave-active,
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1024px) {
  .catalog-page {
    padding: 20px 20px 32px;
  }

  .catalog-page__layout {
    flex-direction: column;
  }

  .catalog-sidebar {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .catalog-page__menu-button {
    display: inline-flex;
  }

  .catalog-page__nav {
    display: none;
  }

  .catalog-content__summary {
    flex-direction: column;
    align-items: flex-start;
  }

  .catalog-content__summary-box {
    min-width: 0;
    width: 100%;
    text-align: left;
  }

  .catalog-content__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
