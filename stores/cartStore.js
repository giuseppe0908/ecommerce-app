// stores/useStore.js

import { defineStore } from 'pinia'

export const useCartStore = defineStore('cartStore', {
  state: () => ({
    cart: [],
    total: 0,
    input: '',
    flag_cart: false,
  }),

  getters: {
    getFilteredItems: (state) => state.filteredItems
  },

  actions: {
    addtocart(item) {
      if (!item || !item.codeItem) {
        console.error('Invalid item passed to addtocart');
        return;
      }
      const cart_item = this.cart.find(cartItem => cartItem.codeItem === item.codeItem);
      
      if (cart_item) {
        cart_item.quantity++;
        localStorage.setItem('carrello', JSON.stringify(this.cart));
        this.total = JSON.parse(localStorage.getItem('prezzototal')) ;
      } else {
        this.cart.push({ ...item, quantity: 1 });
        localStorage.setItem('carrello', JSON.stringify(this.cart));
        this.total += item.price;
        localStorage.setItem('prezzototal', JSON.stringify(this.total));
        //this.calculate_promo(item.cod_item);
      }
    },

    removetocart(cod_item) {
      console.log(cod_item);
      
      const remove_item = this.cart.find(item => item.codeItem === cod_item)
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

    loadCartFromLocalStorage() {
      const storedCart = localStorage.getItem('carrello');
      if (storedCart) {
        this.cart = JSON.parse(storedCart);
        this.flag_cart = true;
      } else {
        this.flag_cart = false;
      }
    },
    updateCart(cart) {
      this.cart = cart;
      localStorage.setItem('carrello', JSON.stringify(cart));
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
