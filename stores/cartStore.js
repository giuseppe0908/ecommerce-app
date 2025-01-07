// stores/useStore.js

import { defineStore } from 'pinia'

export const useStore = defineStore('mainStore', {
  state: () => ({
    item: [
      {
        id: 0,
        name: 'jeans',
        category: 'abbigliamento',
        brand: 'diesel',
        preferity: false,
        promo: false,
        price: 29.99,
        photo: '',
        quantity: 0,
        desc: '',
        cod_item: 366,
        percentual_promo: 0
      },
      {
        id: 1,
        name: 'felpa',
        category: 'abbigliamento',
        brand: 'nike',
        preferity: false,
        promo: true,
        price: 39.99,
        photo: '',
        quantity: 0,
        desc: '',
        cod_item: 123,
        percentual_promo: 30
      },
      {
        id: 2,
        name: 'cappellino',
        category: 'accessori',
        brand: 'nike',
        preferity: false,
        promo: false,
        price: 9.99,
        photo: '',
        quantity: 0,
        desc: '',
        cod_item: 258,
        percentual_promo: 0
      },
      {
        id: 3,
        name: 'cappellino',
        category: 'accessori',
        brand: 'patagonia',
        preferity: false,
        promo: false,
        price: 9.99,
        photo: '',
        quantity: 0,
        desc: '',
        cod_item: 511,
        percentual_promo: 0
      }
    ],
    cart: [],
    filteredItems: [],
    flag_cart: false,
    total: 0,
    flag_search: false,
    flag_modale: false,
    input: ''
  }),

  getters: {
    getFilteredItems: (state) => state.filteredItems
  },

  actions: {
    addtocart(cod_item) {
      const cart_item = this.cart.find(item => item.cod_item === cod_item)
      
      if (cart_item) {
        cart_item.quantity++
        localStorage.setItem('carrello', JSON.stringify(this.cart))
        this.total = JSON.parse(localStorage.getItem('prezzototal')) || 0
      } else {
        const item = this.item.find(item => item.cod_item === cod_item)
        if (item) {
          this.cart.push({ ...item, quantity: 1 })
          localStorage.setItem('carrello', JSON.stringify(this.cart))
          localStorage.setItem('prezzototal', JSON.stringify(this.total))
          this.calculate_promo(cod_item)
        }
      }
    },

    removetocart(cod_item) {
      const remove_item = this.cart.find(item => item.cod_item === cod_item)
      if (remove_item && remove_item.quantity === 1) {
        const pos = this.cart.indexOf(remove_item)
        this.cart.splice(pos, 1)
        localStorage.setItem('carrello', JSON.stringify(this.cart))
      } else if (remove_item) {
        remove_item.quantity--
        localStorage.setItem('carrello', JSON.stringify(this.cart))
      }

      if (this.cart.length === 0) {
        this.flag_cart = false
        localStorage.removeItem('carrello')
        localStorage.removeItem('prezzototal')
      }
    },

    calculate_promo(cod_item) {
      const cart_item = this.cart.find(item => item.cod_item === cod_item)
      if (cart_item) {
        const price_promo = cart_item.price - ((cart_item.price * cart_item.percentual_promo) / 100)
        cart_item.price = price_promo
      }
    },

    filterItems(query) {
      
 // Se la query è vuota, restituisci un array vuoto o l'intero catalogo, a seconda delle necessità
      if (!query) {
        this.filteredItems = []
        this.flag_search = false
        return
      }
 // Filtra gli elementi in base a nome, brand e categoria
      const lowerQuery = query.toLowerCase()
      const filtered = this.item.filter(item => 
        item.name.toLowerCase().includes(lowerQuery) ||
        item.brand.toLowerCase().includes(lowerQuery) ||
        item.category.toLowerCase().includes(lowerQuery)
      )
      // Uso un Set per garantire unicità degli elementi, basato su una chiave composta
      const uniqueItems = []
      const seenNames = new Set()

      for (const item of filtered) {
        if (!seenNames.has(item.name.toLowerCase())) {
          seenNames.add(item.name.toLowerCase())
          uniqueItems.push(item)
        }
      }

      this.filteredItems = uniqueItems
      this.flag_search = true
    }
  }
})
