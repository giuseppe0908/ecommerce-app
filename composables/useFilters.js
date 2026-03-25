import { useRoute } from 'vue-router'
import { reactive, computed } from 'vue'

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