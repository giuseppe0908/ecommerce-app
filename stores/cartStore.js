import { defineStore } from 'pinia'

const CART_STORAGE_KEY = 'carrello'
const CART_TOTAL_KEY = 'prezzototal'

function isClientStorageAvailable() {
  return process.client && typeof localStorage !== 'undefined'
}

function parseNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function toPositiveInt(value, fallback = 1) {
  const parsed = Number.parseInt(String(value), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function roundCurrency(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function normalizeBrand(brand) {
  if (brand && typeof brand === 'object') {
    return {
      ...brand,
      name: typeof brand.name === 'string' && brand.name.trim() ? brand.name.trim() : 'Brand',
    }
  }

  if (typeof brand === 'string' && brand.trim()) {
    return { name: brand.trim() }
  }

  return { name: 'Brand' }
}

function normalizeCartItem(item) {
  if (!item || typeof item !== 'object') {
    return null
  }

  const rawCodeItem = item.codeItem ?? item.cod_item ?? item.id
  if (rawCodeItem === undefined || rawCodeItem === null || rawCodeItem === '') {
    return null
  }

  const codeItem = String(rawCodeItem)
  const parsedCodeAsInt = Number.parseInt(codeItem, 10)
  const normalizedId =
    item.id !== undefined && item.id !== null
      ? item.id
      : Number.isNaN(parsedCodeAsInt)
        ? codeItem
        : parsedCodeAsInt

  return {
    ...item,
    id: normalizedId,
    codeItem,
    quantity: toPositiveInt(item.quantity, 1),
    price: parseNumber(item.price, 0),
    brand: normalizeBrand(item.brand),
  }
}

export const useCartStore = defineStore('cartStore', {
  state: () => ({
    cart: [],
    total: 0,
    input: '',
    flag_cart: false,
    filteredItems: [],
    flag_search: false,
  }),

  getters: {
    getFilteredItems: (state) => state.filteredItems,
    itemCount: (state) =>
      state.cart.reduce((count, item) => count + toPositiveInt(item.quantity, 1), 0),
    isInCart: (state) => (codeItem) => {
      const normalizedCodeItem = String(codeItem ?? '')
      if (!normalizedCodeItem) return false

      return state.cart.some((item) => String(item.codeItem) === normalizedCodeItem)
    },
  },

  actions: {
    recalculateTotal() {
      const computedTotal = this.cart.reduce((total, item) => {
        return total + parseNumber(item.price, 0) * toPositiveInt(item.quantity, 1)
      }, 0)

      this.total = roundCurrency(computedTotal)
    },

    persistCart() {
      if (!isClientStorageAvailable()) return

      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.cart))
      localStorage.setItem(CART_TOTAL_KEY, JSON.stringify(this.total))
    },

    clearPersistedCart() {
      if (!isClientStorageAvailable()) return

      localStorage.removeItem(CART_STORAGE_KEY)
      localStorage.removeItem(CART_TOTAL_KEY)
    },

    addtocart(item) {
      const normalizedItem = normalizeCartItem(item)
      if (!normalizedItem) {
        console.error('Invalid item passed to addtocart')
        return
      }

      const existingItem = this.cart.find(
        (cartItem) => String(cartItem.codeItem) === String(normalizedItem.codeItem)
      )

      if (existingItem) {
        existingItem.quantity = toPositiveInt(existingItem.quantity, 1) + 1
      } else {
        this.cart.push({ ...normalizedItem, quantity: 1 })
      }

      this.flag_cart = this.cart.length > 0
      this.recalculateTotal()
      this.persistCart()
    },

    removetocart(cod_item) {
      const codeItem = String(cod_item ?? '')
      if (!codeItem) return

      const itemIndex = this.cart.findIndex(
        (item) => String(item.codeItem) === codeItem
      )

      if (itemIndex === -1) return

      const item = this.cart[itemIndex]
      const currentQuantity = toPositiveInt(item.quantity, 1)

      if (currentQuantity <= 1) {
        this.cart.splice(itemIndex, 1)
      } else {
        item.quantity = currentQuantity - 1
      }

      this.flag_cart = this.cart.length > 0

      if (!this.flag_cart) {
        this.total = 0
        this.clearPersistedCart()
        return
      }

      this.recalculateTotal()
      this.persistCart()
    },

    removeItem(cod_item) {
      const codeItem = String(cod_item ?? '')
      if (!codeItem) return

      const nextCart = this.cart.filter(
        (item) => String(item.codeItem) !== codeItem
      )

      if (nextCart.length === this.cart.length) return

      this.cart = nextCart
      this.flag_cart = this.cart.length > 0

      if (!this.flag_cart) {
        this.total = 0
        this.clearPersistedCart()
        return
      }

      this.recalculateTotal()
      this.persistCart()
    },

    clearCart() {
      this.cart = []
      this.total = 0
      this.flag_cart = false
      this.filteredItems = []
      this.flag_search = false
      this.clearPersistedCart()
    },

    loadCartFromLocalStorage() {
      if (!isClientStorageAvailable()) return

      try {
        const storedCart = localStorage.getItem(CART_STORAGE_KEY)
        const parsedCart = storedCart ? JSON.parse(storedCart) : []

        if (!Array.isArray(parsedCart)) {
          this.clearCart()
          return
        }

        this.cart = parsedCart
          .map((item) => normalizeCartItem(item))
          .filter((item) => item !== null)

        this.flag_cart = this.cart.length > 0

        if (!this.flag_cart) {
          this.total = 0
          this.clearPersistedCart()
          return
        }

        this.recalculateTotal()
        this.persistCart()
      } catch (error) {
        console.error('Errore caricamento carrello da localStorage:', error)
        this.clearCart()
      }
    },

    updateCart(cart) {
      if (!Array.isArray(cart)) {
        this.clearCart()
        return
      }

      this.cart = cart
        .map((item) => normalizeCartItem(item))
        .filter((item) => item !== null)

      this.flag_cart = this.cart.length > 0

      if (!this.flag_cart) {
        this.total = 0
        this.clearPersistedCart()
        return
      }

      this.recalculateTotal()
      this.persistCart()
    },

    calculate_promo(cod_item) {
      const codeItem = String(cod_item ?? '')
      if (!codeItem) return

      const cartItem = this.cart.find(
        (item) => String(item.codeItem) === codeItem
      )

      if (!cartItem) return

      const discountPercent = parseNumber(
        cartItem.percentualPromo ?? cartItem.percentual_promo,
        0
      )

      if (discountPercent <= 0) return

      const discountedPrice =
        parseNumber(cartItem.price, 0) -
        (parseNumber(cartItem.price, 0) * discountPercent) / 100

      cartItem.price = roundCurrency(Math.max(discountedPrice, 0))
      this.recalculateTotal()
      this.persistCart()
    },

    filterItems(query, sourceItems = null) {
      const normalizedQuery = typeof query === 'string' ? query.trim().toLowerCase() : ''

      if (!normalizedQuery) {
        this.filteredItems = []
        this.flag_search = false
        return
      }

      const collection = Array.isArray(sourceItems) ? sourceItems : this.cart

      const filtered = collection.filter((item) => {
        const name = String(item?.name ?? '').toLowerCase()
        const brand = String(item?.brand?.name ?? item?.brand ?? '').toLowerCase()
        const category = String(item?.category?.name ?? item?.category ?? '').toLowerCase()

        return (
          name.includes(normalizedQuery) ||
          brand.includes(normalizedQuery) ||
          category.includes(normalizedQuery)
        )
      })

      const uniqueByCodeItem = []
      const seenCodeItems = new Set()

      for (const item of filtered) {
        const codeItem = String(item?.codeItem ?? item?.id ?? '')
        if (!codeItem || seenCodeItems.has(codeItem)) continue

        seenCodeItems.add(codeItem)
        uniqueByCodeItem.push(item)
      }

      this.filteredItems = uniqueByCodeItem
      this.flag_search = true
    },
  },
})
