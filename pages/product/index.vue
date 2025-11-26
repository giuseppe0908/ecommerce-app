<template>
  <div class="product-catalog-container">
    <!-- ============================================
         MOBILE NAVIGATION MENU
         Full-screen overlay menu for mobile devices
         ============================================ -->
    <transition name="fade">
      <div
        v-if="isMenuOpen"
        class="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-menu-title"
      >
        <!-- Menu Header with Gender Tabs -->
        <div class="mobile-menu__header">
          <nav class="mobile-menu__tabs" role="tablist" aria-label="Categorie per genere">
            <button
              v-for="tab in GENDER_TABS"
              :key="tab.id"
              :class="[
                'mobile-menu__tab',
                { 'mobile-menu__tab--active': activeGenderTab === tab.id }
              ]"
              :aria-selected="activeGenderTab === tab.id"
              role="tab"
              @click="setActiveGenderTab(tab.id)"
            >
              {{ tab.label }}
            </button>
          </nav>

          <!-- Close Button -->
          <button
            class="mobile-menu__close"
            aria-label="Chiudi menu"
            @click="toggleMobileMenu"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <!-- Search Input -->
        <div class="mobile-menu__search">
          <input
            v-model="searchQuery"
            type="search"
            :placeholder="SEARCH_PLACEHOLDER"
            class="search-input"
            aria-label="Cerca prodotti"
            @input="handleSearchInput"
          />
        </div>

        <!-- Category Grid -->
        <div class="mobile-menu__categories" role="list">
          <article
            v-for="category in categories"
            :key="category.id"
            class="category-card"
            role="listitem"
          >
            <div class="category-card__image-wrapper">
              <img
                :data-src="category.image"
                :alt="`Categoria ${category.name}`"
                class="category-card__image lazyload"
                loading="lazy"
              />
              <div class="category-card__button-wrapper">
                <Button
                  :name="category.name"
                  bg-color="white"
                  :text-color="colorPrimary"
                  :to="buildCategoryUrl(category.name)"
                  width="100%"
                  :height="buttonHeight"
                  :aria-label="`Vai alla categoria ${category.name}`"
                />
              </div>
            </div>
          </article>
        </div>
      </div>
    </transition>

    <!-- ============================================
         DESKTOP HEADER NAVIGATION
         Horizontal navigation bar for larger screens
         ============================================ -->
    <nav
      v-if="!isMenuOpen"
      class="desktop-header"
      aria-label="Navigazione principale"
    >
      <!-- Mobile Menu Toggle Button -->
      <button
        class="desktop-header__hamburger"
        aria-label="Apri menu"
        aria-expanded="false"
        @click="toggleMobileMenu"
      >
        <svg
          class="hamburger-icon"
          :style="{ color: colorPrimary }"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <!-- Quick Action Buttons -->
      <div class="desktop-header__actions" role="group" aria-label="Filtri rapidi">
        <Button
          v-for="action in quickActions"
          :key="action.id"
          :name="action.label"
          :bg-color="action.isActive ? colorPrimary : 'white'"
          :text-color="action.isActive ? 'white' : colorPrimary"
          :to="action.to"
          :width="action.width"
          height="30px"
          font-size="12px"
          @click="action.onClick"
        />
      </div>
    </nav>

    <!-- ============================================
         DESKTOP CATEGORY NAVIGATION
         Visible only on larger screens (≥640px)
         ============================================ -->
    <nav
      class="category-navigation"
      aria-label="Categorie prodotto"
    >
      <ul class="category-navigation__list">
        <li
          v-for="category in categories"
          :key="category.id"
          class="category-navigation__item"
        >
          <button
            class="category-navigation__link"
            :style="{ color: colorPrimary }"
            :aria-label="`Filtra per categoria ${category.name}`"
            @click="applyFilter('category', category)"
          >
            {{ category.name }}
          </button>
        </li>
      </ul>
    </nav>

    <!-- ============================================
         ACTIVE FILTERS BREADCRUMB
         Shows currently applied filters
         ============================================ -->
    <div
      v-if="activeFilters.length > 0"
      class="active-filters"
      role="navigation"
      aria-label="Filtri attivi"
    >
      <ul class="active-filters__list">
        <li
          v-for="filter in activeFilters"
          :key="filter.key"
          class="active-filters__item"
        >
          <button
            class="active-filters__remove"
            :aria-label="`Rimuovi filtro ${filter.label}`"
            @click="removeFilter(filter.key)"
          >
            {{ filter.label }}
            <span aria-hidden="true"> ›</span>
          </button>
        </li>
      </ul>
    </div>

    <!-- ============================================
         MAIN CONTENT AREA
         Filters sidebar + Product grid
         ============================================ -->
    <div v-if="!isMenuOpen" class="main-content">
      <!-- ============================================
           LEFT SIDEBAR - FILTERS (Desktop only)
           ============================================ -->
      <aside class="filters-sidebar" aria-label="Filtri prodotti">
        <div class="filters-sidebar__section">
          <button
            class="filter-toggle-button"
            :style="getFilterButtonStyles(isFilterPanelOpen)"
            :aria-expanded="isFilterPanelOpen"
            aria-controls="filter-panel"
            @click="toggleFilterPanel"
          >
            {{ FILTER_LABEL }}
          </button>

          <!-- Filter Options List -->
          <transition name="slide-down">
            <ul
              v-if="isFilterPanelOpen"
              id="filter-panel"
              class="filter-options-list"
              role="list"
            >
              <li
                v-for="option in FILTER_OPTIONS"
                :key="option"
                class="filter-options-list__item"
              >
                {{ option }}
              </li>
            </ul>
          </transition>
        </div>
      </aside>

      <!-- ============================================
           RIGHT CONTENT AREA - Advanced Filters + Products
           ============================================ -->
      <main class="content-area">
        <!-- Advanced Filters Section -->
        <section class="advanced-filters" aria-label="Filtri avanzati">
          <div class="advanced-filters__wrapper">
            <button
              class="filter-toggle-button"
              :style="getFilterButtonStyles(isAdvancedFiltersOpen)"
              :aria-expanded="isAdvancedFiltersOpen"
              aria-controls="advanced-filters-panel"
              @click="toggleAdvancedFilters"
            >
              {{ FILTER_LABEL }}
            </button>

            <!-- Advanced Filter Panel with Slide Animation -->
            <transition name="slide-in-right">
              <div
                v-if="isAdvancedFiltersOpen"
                id="advanced-filters-panel"
                class="filter-panel"
              >
                <!-- Filter Type Buttons -->
                <div class="filter-panel__types" role="group" aria-label="Tipi di filtro">
                  <button
                    v-for="filterType in availableFilterTypes"
                    :key="filterType.id"
                    class="filter-type-button"
                    :style="getFilterButtonStyles(filterType.selected)"
                    :aria-pressed="filterType.selected"
                    @click="selectFilterType(filterType)"
                  >
                    {{ filterType.name }}
                  </button>
                </div>

                <!-- Price Range Filter Component -->
                <PriceRangeFilter
                  v-if="isPriceFilterActive"
                  :min-price="priceConstraints.min"
                  :max-price="priceConstraints.max"
                  :current-range="priceRange"
                  :color-primary="colorPrimary"
                  @update:range="updatePriceRange"
                  @apply="applyPriceFilter"
                  @reset="resetPriceFilter"
                />
              </div>
            </transition>
          </div>
        </section>

        <!-- ============================================
             PRODUCT GRID
             Responsive grid with product cards
             ============================================ -->
        <section
          class="product-grid"
          aria-label="Catalogo prodotti"
          :aria-busy="isLoading"
        >
          <!-- Loading State -->
          <div v-if="isLoading" class="loading-state" aria-live="polite">
            <div class="spinner" role="status">
              <span class="sr-only">Caricamento prodotti...</span>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="products.length === 0" class="empty-state">
            <p class="empty-state__message">
              {{ EMPTY_STATE_MESSAGE }}
            </p>
          </div>

          <!-- Product Cards Grid -->
          <div v-else class="product-grid__container">
            <Card
              v-for="product in products"
              :key="product.id"
              :id="product.id"
              :name="product.name"
              :img="product.photo"
              :code-item="product.codeItem"
              :promo="product.promo"
              :plus="product.plus"
              :price="product.price"
              :category="product.category"
              :brand="product.brand"
              :color-primary="colorPrimary"
              color-secondary="#00192F"
            />
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { ref, computed, onMounted, watch } from 'vue';

/**
 * ============================================
 * CONSTANTS & CONFIGURATION
 * ============================================
 */
const GENDER_TABS = [
  { id: 'donna', label: 'DONNA' },
  { id: 'uomo', label: 'UOMO' },
  { id: 'bambini', label: 'BAMBINI' }
];

const FILTER_OPTIONS = ['pippo', 'pluto', 'tipo', 'olindo', 'nettuno', 'ulisse', 'nessuno'];

const FILTER_LABEL = 'FILTRI';
const SEARCH_PLACEHOLDER = 'RICERCA';
const EMPTY_STATE_MESSAGE = 'Nessun prodotto trovato. Prova a modificare i filtri.';

const DEBOUNCE_DELAY_MS = 500;
const PRICE_STEP = 1;

/**
 * ============================================
 * COMPOSABLES & EXTERNAL DEPENDENCIES
 * ============================================
 */
const route = useRoute();
const router = useRouter();

// Custom composable for responsive UI values
const { screenWidth, buttonHeight, colorPrimary } = useResponsiveButton();

// API data fetching using Nuxt's useFetch
const { data: categories } = await useFetch('/api/categories');
const { data: genders } = await useFetch('/api/genders');
const { data: brands } = await useFetch('/api/brands');

/**
 * ============================================
 * REACTIVE STATE MANAGEMENT
 * ============================================
 */

// UI State
const isMenuOpen = ref(false);
const isFilterPanelOpen = ref(false);
const isAdvancedFiltersOpen = ref(false);
const isLoading = ref(false);
const activeGenderTab = ref('donna');

// Product Data
const products = ref([]);
const searchQuery = ref('');

// Filter State
const filters = ref({
  category: '',
  brand: '',
  gender: '',
  priceMin: '',
  priceMax: '',
  promo: '',
  plus: '',
  newArrivals: ''
});

// Price Filter State
const priceConstraints = ref({
  min: 0,
  max: 1000
});

const priceRange = ref({
  min: priceConstraints.value.min,
  max: priceConstraints.value.max
});

// Available filter types with selection state
const availableFilterTypes = ref([
  { id: 'color', name: 'Colore', value: '', selected: false },
  { id: 'size', name: 'Taglia', value: '', selected: false },
  { id: 'price', name: 'Prezzo', value: '', selected: false }
]);

// Request deduplication
const lastQueryString = ref('');

/**
 * ============================================
 * COMPUTED PROPERTIES
 * ============================================
 */

/**
 * Determines if price filter is currently active
 * @returns {boolean} True if price filter type is selected
 */
const isPriceFilterActive = computed(() => {
  return availableFilterTypes.value.find(f => f.id === 'price')?.selected || false;
});

/**
 * Generates array of active filters with labels for UI display
 * @returns {Array<{key: string, label: string}>} Array of active filter objects
 */
const activeFilters = computed(() => {
  const filterMap = [
    {
      condition: filters.value.gender,
      key: 'gender',
      getLabel: () => genders.value.find(g => g.id === parseInt(filters.value.gender, 10))?.name || ''
    },
    {
      condition: filters.value.category,
      key: 'category',
      getLabel: () => categories.value.find(c => c.id === parseInt(filters.value.category, 10))?.name || ''
    },
    {
      condition: filters.value.brand,
      key: 'brand',
      getLabel: () => brands.value.find(b => b.id === parseInt(filters.value.brand, 10))?.name || ''
    },
    {
      condition: filters.value.priceMin,
      key: 'priceMin',
      getLabel: () => `Prezzo Min: €${filters.value.priceMin}`
    },
    {
      condition: filters.value.priceMax,
      key: 'priceMax',
      getLabel: () => `Prezzo Max: €${filters.value.priceMax}`
    },
    {
      condition: filters.value.newArrivals,
      key: 'newArrivals',
      getLabel: () => 'Nuovi Arrivi'
    },
    {
      condition: filters.value.promo,
      key: 'promo',
      getLabel: () => 'Promo'
    },
    {
      condition: filters.value.plus,
      key: 'plus',
      getLabel: () => 'Spedizione Plus'
    }
  ];

  return filterMap
    .filter(filter => filter.condition)
    .map(filter => ({ key: filter.key, label: filter.getLabel() }));
});

/**
 * Generates quick action buttons configuration for desktop header
 * @returns {Array<Object>} Array of button configuration objects
 */
const quickActions = computed(() => {
  return [
    {
      id: 'donna',
      label: 'DONNA',
      isActive: route.query.gender === 'donna',
      to: buildGenderUrl('donna'),
      width: '83px'
    },
    {
      id: 'uomo',
      label: 'UOMO',
      isActive: route.query.gender === 'uomo',
      to: buildGenderUrl('uomo'),
      width: '83px'
    },
    {
      id: 'bambini',
      label: 'BAMBINO',
      isActive: route.query.gender === 'bambini',
      to: buildGenderUrl('bambini'),
      width: '83px'
    },
    {
      id: 'newArrivals',
      label: 'NUOVI ARRIVI',
      isActive: route.query.newArrivals === 'true',
      onClick: toggleNewArrivals,
      width: '110px'
    }
  ];
});

/**
 * ============================================
 * API & DATA FETCHING
 * ============================================
 */

/**
 * Fetches products from API based on current filters
 * Implements request deduplication to avoid unnecessary API calls
 * @async
 * @returns {Promise<void>}
 */
const fetchProducts = async () => {
  try {
    // Sync filters with URL query parameters
    syncFiltersFromQuery();

    // Build query string for API request
    const queryString = new URLSearchParams(
      Object.entries(filters.value).filter(([_, value]) => value !== '')
    ).toString();

    // Prevent duplicate requests
    if (queryString === lastQueryString.value) return;
    lastQueryString.value = queryString;

    // Set loading state
    isLoading.value = true;

    // Fetch products from API
    const response = await fetch(`/api/products?${queryString}`);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    products.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[fetchProducts] Error:', error.message);
    products.value = [];

    // TODO: Implement user-facing error notification
    // showErrorNotification('Errore nel caricamento dei prodotti');
  } finally {
    isLoading.value = false;
  }
};

/**
 * Synchronizes local filter state with URL query parameters
 * Updates filters for category, brand, gender, price, and feature flags
 * @returns {void}
 */
const syncFiltersFromQuery = () => {
  // Sync entity-based filters (category, brand, gender)
  syncEntityFilter(categories, 'category');
  syncEntityFilter(brands, 'brand');
  syncEntityFilter(genders, 'gender');

  // Sync price filters
  syncPriceFilter('priceMin', priceConstraints.value.min);
  syncPriceFilter('priceMax', priceConstraints.value.max);

  // Sync boolean filters
  syncBooleanFilter('newArrivals');
  syncBooleanFilter('promo');
  syncBooleanFilter('plus');
};

/**
 * Syncs a single entity-based filter from query params
 * @param {Ref<Array>} entityArray - Ref to array of entities (categories, brands, etc.)
 * @param {string} paramName - Query parameter name
 */
const syncEntityFilter = (entityArray, paramName) => {
  const queryValue = route.query[paramName];

  if (queryValue && entityArray.value) {
    const entity = entityArray.value.find(
      item => item.name.toLowerCase() === queryValue.toLowerCase()
    );
    filters.value[paramName] = entity ? entity.id.toString() : '';
  } else {
    filters.value[paramName] = '';
  }
};

/**
 * Syncs a price filter from query params with validation
 * @param {string} paramName - Query parameter name ('priceMin' or 'priceMax')
 * @param {number} defaultValue - Default value if param is invalid
 */
const syncPriceFilter = (paramName, defaultValue) => {
  const queryValue = route.query[paramName];

  if (queryValue && !isNaN(parseFloat(queryValue))) {
    const numValue = parseFloat(queryValue);
    filters.value[paramName] = queryValue;
    priceRange.value[paramName === 'priceMin' ? 'min' : 'max'] = numValue;
  } else if (queryValue === undefined) {
    filters.value[paramName] = '';
    priceRange.value[paramName === 'priceMin' ? 'min' : 'max'] = defaultValue;
  }
};

/**
 * Syncs a boolean filter from query params
 * @param {string} paramName - Query parameter name
 */
const syncBooleanFilter = (paramName) => {
  filters.value[paramName] = route.query[paramName] === 'true' ? 'true' : '';
};

/**
 * ============================================
 * FILTER MANAGEMENT
 * ============================================
 */

/**
 * Applies a filter and updates the URL
 * @param {string} filterType - Type of filter to apply (e.g., 'category', 'brand')
 * @param {Object} value - Value object containing filter data
 */
const applyFilter = (filterType, value) => {
  const newQuery = { ...route.query };

  if (value && value.name) {
    newQuery[filterType] = value.name.toLowerCase();
  } else {
    delete newQuery[filterType];
  }

  router.replace({ query: newQuery });
};

/**
 * Removes a specific filter from the active filters
 * @param {string} filterKey - Key of the filter to remove
 */
const removeFilter = (filterKey) => {
  const newQuery = { ...route.query };
  delete newQuery[filterKey];

  // Reset local state for price filters
  if (filterKey === 'priceMin') {
    priceRange.value.min = priceConstraints.value.min;
    filters.value.priceMin = '';
  }

  if (filterKey === 'priceMax') {
    priceRange.value.max = priceConstraints.value.max;
    filters.value.priceMax = '';
  }

  if (filterKey === 'newArrivals') {
    filters.value.newArrivals = '';
  }

  router.replace({ query: newQuery });
};

/**
 * Toggles the "New Arrivals" filter
 */
const toggleNewArrivals = () => {
  const newQuery = { ...route.query };

  if (newQuery.newArrivals === 'true') {
    delete newQuery.newArrivals;
    filters.value.newArrivals = '';
  } else {
    newQuery.newArrivals = 'true';
    filters.value.newArrivals = 'true';
  }

  router.replace({ query: newQuery });
};

/**
 * Selects a filter type (color, size, price) in advanced filters
 * @param {Object} filterType - Filter type object to select
 */
const selectFilterType = (filterType) => {
  // Deselect all filter types
  availableFilterTypes.value.forEach(f => (f.selected = false));

  // Select the clicked filter type
  filterType.selected = true;
};

/**
 * ============================================
 * PRICE FILTER MANAGEMENT
 * ============================================
 */

/**
 * Updates price range constraints based on available products
 * Calculates min/max prices from product data
 */
const updatePriceConstraints = () => {
  if (!products.value || products.value.length === 0) return;

  const prices = products.value.map(p => p.price).filter(price => !isNaN(price));

  if (prices.length === 0) return;

  const minProductPrice = Math.floor(Math.min(...prices));
  const maxProductPrice = Math.ceil(Math.max(...prices));

  priceConstraints.value.min = minProductPrice;
  priceConstraints.value.max = maxProductPrice;

  // Initialize range if not set
  if (!priceRange.value.min || priceRange.value.min < minProductPrice) {
    priceRange.value.min = minProductPrice;
  }
  if (!priceRange.value.max || priceRange.value.max > maxProductPrice) {
    priceRange.value.max = maxProductPrice;
  }
};

/**
 * Updates the price range reactively during slider interaction
 * @param {Object} newRange - New price range {min, max}
 */
const updatePriceRange = (newRange) => {
  priceRange.value = { ...newRange };
};

/**
 * Applies the current price range filter to the URL
 * Triggers product refetch with new price constraints
 */
const applyPriceFilter = () => {
  const newQuery = { ...route.query };

  // Update local filters
  filters.value.priceMin = priceRange.value.min.toString();
  filters.value.priceMax = priceRange.value.max.toString();

  // Add to URL only if different from default
  if (priceRange.value.min !== priceConstraints.value.min) {
    newQuery.priceMin = priceRange.value.min.toString();
  } else {
    delete newQuery.priceMin;
    filters.value.priceMin = '';
  }

  if (priceRange.value.max !== priceConstraints.value.max) {
    newQuery.priceMax = priceRange.value.max.toString();
  } else {
    delete newQuery.priceMax;
    filters.value.priceMax = '';
  }

  router.replace({ query: newQuery });
  isAdvancedFiltersOpen.value = false;
};

/**
 * Resets price filter to default constraints
 * Removes price parameters from URL
 */
const resetPriceFilter = () => {
  priceRange.value.min = priceConstraints.value.min;
  priceRange.value.max = priceConstraints.value.max;

  const newQuery = { ...route.query };
  delete newQuery.priceMin;
  delete newQuery.priceMax;

  filters.value.priceMin = '';
  filters.value.priceMax = '';

  router.replace({ query: newQuery });
};

/**
 * ============================================
 * UI INTERACTION HANDLERS
 * ============================================
 */

/**
 * Toggles mobile menu visibility
 */
const toggleMobileMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;

  // Prevent body scroll when menu is open
  if (isMenuOpen.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

/**
 * Toggles filter panel in sidebar
 */
const toggleFilterPanel = () => {
  isFilterPanelOpen.value = !isFilterPanelOpen.value;
};

/**
 * Toggles advanced filters panel
 */
const toggleAdvancedFilters = () => {
  isAdvancedFiltersOpen.value = !isAdvancedFiltersOpen.value;
};

/**
 * Sets the active gender tab in mobile menu
 * @param {string} tabId - ID of the tab to activate
 */
const setActiveGenderTab = (tabId) => {
  activeGenderTab.value = tabId;
};

/**
 * Handles search input with debouncing
 * Prevents excessive API calls during typing
 */
const handleSearchInput = debounce(() => {
  fetchProducts();
}, DEBOUNCE_DELAY_MS);

/**
 * ============================================
 * URL BUILDERS
 * ============================================
 */

/**
 * Builds URL for category filtering
 * @param {string} categoryName - Name of the category
 * @returns {string} Complete URL with query parameters
 */
const buildCategoryUrl = (categoryName) => {
  const params = new URLSearchParams(route.query);
  params.set('category', categoryName.toLowerCase());
  return `/product?${params.toString()}`;
};

/**
 * Builds URL for gender filtering while preserving other filters
 * @param {string} gender - Gender value (donna, uomo, bambini)
 * @returns {string} Complete URL with query parameters
 */
const buildGenderUrl = (gender) => {
  const params = new URLSearchParams();

  params.append('gender', gender.toLowerCase());

  // Preserve existing query parameters except gender
  for (const [key, value] of Object.entries(route.query)) {
    if (key !== 'gender') {
      params.append(key, value);
    }
  }

  return `/product?${params.toString()}`;
};

/**
 * ============================================
 * UTILITY FUNCTIONS
 * ============================================
 */

/**
 * Creates a debounced function that delays execution
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Generates dynamic styles for filter buttons based on state
 * @param {boolean} isActive - Whether the button is active
 * @returns {Object} Style object for button
 */
const getFilterButtonStyles = (isActive) => {
  return {
    backgroundColor: isActive ? colorPrimary : 'white',
    color: isActive ? 'white' : colorPrimary,
    border: isActive ? 'none' : `1px solid ${colorPrimary}`
  };
};

/**
 * ============================================
 * LIFECYCLE HOOKS & WATCHERS
 * ============================================
 */

/**
 * Watch route query changes and refetch products
 * Deep watch ensures nested property changes are detected
 */
watch(
  () => route.query,
  () => {
    fetchProducts();
  },
  { deep: true }
);

/**
 * Watch products array and update price constraints
 * Runs immediately on mount to set initial constraints
 */
watch(
  products,
  () => {
    updatePriceConstraints();
  },
  { immediate: true }
);

/**
 * Component mounted hook
 * Initializes product data on first render
 */
onMounted(() => {
  fetchProducts();
});
</script>

<style scoped>
/**
 * ============================================
 * GLOBAL CONTAINER
 * ============================================
 */
.product-catalog-container {
  width: 95%;
  margin: 0 auto;
}

/**
 * ============================================
 * MOBILE MENU STYLES
 * ============================================
 */
.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  min-height: 100vh;
  background-color: #5d758b;
  color: white;
  padding: 1.5rem;
  z-index: 9999;
  overflow-y: auto;
}

.mobile-menu__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.mobile-menu__tabs {
  display: flex;
  gap: 1.5rem;
}

.mobile-menu__tab {
  font-weight: 600;
  font-size: 0.875rem;
  color: #9ca3af;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding-bottom: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mobile-menu__tab--active {
  color: #000;
  border-bottom-color: white;
}

.mobile-menu__tab:hover {
  color: #000;
}

.mobile-menu__close {
  font-size: 1.5rem;
  font-weight: bold;
  color: #9ca3af;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  line-height: 1;
  transition: color 0.2s ease;
}

.mobile-menu__close:hover {
  color: white;
}

.mobile-menu__search {
  margin-bottom: 1.5rem;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  outline: none;
}

.mobile-menu__categories {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  padding-top: 1.25rem;
}

/**
 * Category Cards
 */
.category-card {
  position: relative;
}

.category-card__image-wrapper {
  position: relative;
  height: 140px;
  width: 135px;
}

.category-card__image {
  width: 100%;
  height: 100%;
  border-radius: 0.75rem;
  object-fit: cover;
}

.category-card__button-wrapper {
  position: absolute;
  bottom: -20px;
  left: 0;
  width: 100%;
}

/**
 * ============================================
 * DESKTOP HEADER NAVIGATION
 * ============================================
 */
.desktop-header {
  width: 95%;
  margin: 0 auto;
  display: flex;
  gap: 1.5rem;
  align-items: center;
  padding: 1rem 0;
}

.desktop-header__hamburger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding-right: 0.5rem;
  border-radius: 0.375rem;
  color: #1f2937;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.desktop-header__hamburger:hover {
  color: #111827;
}

.hamburger-icon {
  height: 1.5rem;
  width: 1.5rem;
}

.desktop-header__actions {
  display: flex;
  gap: 1rem;
}

/* Hide hamburger on desktop */
@media (min-width: 768px) {
  .desktop-header__hamburger {
    display: none;
  }
}

/**
 * ============================================
 * CATEGORY NAVIGATION (Desktop)
 * ============================================
 */
.category-navigation {
  display: none;
  width: 95%;
  margin: 0 auto;
  padding: 1rem 0;
}

@media (min-width: 640px) {
  .category-navigation {
    display: block;
  }
}

.category-navigation__list {
  display: flex;
  gap: 1rem;
  list-style: none;
  padding: 0;
  margin: 0;
  transition: gap 0.2s ease;
}

.category-navigation__list:hover {
  gap: 1.5rem;
}

.category-navigation__item {
  list-style: none;
}

.category-navigation__link {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem;
  transition: transform 0.2s ease;
}

.category-navigation__link:hover {
  transform: scale(1.25);
}

/**
 * ============================================
 * ACTIVE FILTERS BREADCRUMB
 * ============================================
 */
.active-filters {
  width: 95%;
  margin: 0 auto;
  padding: 0.5rem 0;
}

.active-filters__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.active-filters__item {
  list-style: none;
}

.active-filters__remove {
  background-color: #f0f0f0;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.active-filters__remove:hover {
  background-color: #e0e0e0;
}

/**
 * ============================================
 * MAIN CONTENT LAYOUT
 * ============================================
 */
.main-content {
  width: 95%;
  margin: 0 auto;
  display: flex;
  gap: 2.5rem;
  padding-left: 0.5rem;
}

@media (min-width: 768px) {
  .main-content {
    display: flex;
  }
}

/**
 * ============================================
 * FILTERS SIDEBAR (Desktop only)
 * ============================================
 */
.filters-sidebar {
  display: none;
}

@media (min-width: 768px) {
  .filters-sidebar {
    display: block;
    min-width: 200px;
  }
}

.filters-sidebar__section {
  margin-bottom: 1.5rem;
}

.filter-toggle-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 74px;
  height: 31px;
  border-radius: 1.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;
}

.filter-toggle-button:hover {
  transform: scale(1.25);
}

.filter-options-list {
  list-style: none;
  padding-left: 0;
  margin-top: 1rem;
}

.filter-options-list__item {
  padding: 0.5rem 0;
  font-size: 0.875rem;
  color: #4b5563;
  cursor: pointer;
  transition: color 0.2s ease;
}

.filter-options-list__item:hover {
  color: #1f2937;
}

/**
 * ============================================
 * CONTENT AREA (Filters + Products)
 * ============================================
 */
.content-area {
  flex: 1;
}

/**
 * ============================================
 * ADVANCED FILTERS SECTION
 * ============================================
 */
.advanced-filters {
  margin-bottom: 2rem;
}

.advanced-filters__wrapper {
  position: relative;
  display: flex;
}

.filter-panel {
  position: absolute;
  top: 40px;
  left: 0;
  background-color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
  min-width: 250px;
}

.filter-panel__types {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.filter-type-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 74px;
  height: 31px;
  border-radius: 1.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;
}

.filter-type-button:hover {
  transform: scale(1.25);
}

/**
 * ============================================
 * PRODUCT GRID
 * ============================================
 */
.product-grid {
  width: 100%;
}

.product-grid__container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  padding-top: 0.5rem;
}

@media (min-width: 768px) {
  .product-grid__container {
    grid-template-columns: repeat(6, 1fr);
  }
}

/**
 * ============================================
 * LOADING & EMPTY STATES
 * ============================================
 */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 0;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #f3f4f6;
  border-top-color: v-bind(colorPrimary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 2rem;
}

.empty-state__message {
  font-size: 1.125rem;
  color: #6b7280;
  text-align: center;
}

/**
 * ============================================
 * TRANSITIONS & ANIMATIONS
 * ============================================
 */

/* Fade transition for mobile menu */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide down transition for filter options */
.slide-down-enter-active {
  transition: all 0.3s ease-out;
}

.slide-down-leave-active {
  transition: all 0.2s ease-in;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* Slide in right transition for filter panel */
.slide-in-right-enter-active {
  transition: all 0.3s ease-out;
}

.slide-in-right-leave-active {
  transition: all 0.3s ease-in;
}

.slide-in-right-enter-from,
.slide-in-right-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
