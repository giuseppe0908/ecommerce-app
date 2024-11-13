import { defineStore } from 'pinia'

export const useCategoryStore = defineStore('categoryStore', {
  state: () => ({
    categories: [],
    brands:[],
    colorPrimary:"#56768D"
  }),
  actions: {
    async fetchCategories() {
      // Qui userai il tuo API per recuperare gli elementi dal database
      const response = await fetch('/api/categories')
      const resBrand = await fetch('api/brands')
      const data = await response.json()      
      const dataBrand = await resBrand.json()
      this.categories = data
      this.brands = dataBrand
    },
    async addCategory(category) {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      })
      const newcategory = await response.json()
      this.categories.push(newcategory)
    },
    async updateCategory(category) {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      })
      const updatedcategory = await response.json()
      const index = this.categories.findIndex(i => i.id === updatedcategory.id)
      this.categories[index] = updatedcategory
    },
    async deleteCategory(categoryId) {
      await fetch(`/api/categories/${categoryId}`, { method: 'DELETE' })
      this.categories = this.categories.filter(category => category.id !== categoryId)
    },
  },
})
