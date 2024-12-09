import { defineStore } from 'pinia'

export const useProductStore = defineStore('productstore', {
  state: () => ({
    products: [],
    product: null,
    // colorPrimary:"#56768D"
    colorPrimary:"#5D758B",
    colorSecondary:'#00192F'
  }),
  actions: {
    async fetchProducts() {
      // Qui userai il tuo API per recuperare gli elementi dal database
      const response = await fetch('/api/products')
      const data = await response.json()
      this.products = data
    },
    async fetchProductById(productId) {
      const response = await fetch(`/api/products/${productId}`);
      const data = await response.json();
      this.product = data;
    },
    async addProduct(product) {
      console.log(product);
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      })
      const newProduct = await response.json()
      this.products.push(newProduct)
    },
    async updateProduct(product) {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      })
      const updatedProduct = await response.json()
      const index = this.products.findIndex(i => i.id === updatedProduct.id)
      this.products[index] = updatedProduct
    },
    async deleteProduct(id) {
      const response = await fetch('/api/products', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        this.products = this.products.filter(product => product.id !== id);  // Rimuovi il prodotto dallo store
      }
    },
  },
});