import { defineStore } from 'pinia'

export const useItemStore = defineStore('itemStore', {
  state: () => ({
    items: [],
    item: []
  }),
  actions: {
    async fetchItems() {
      // Qui userai il tuo API per recuperare gli elementi dal database
      const response = await fetch('/api/items')
      const data = await response.json()
      this.items = data
    },
    async fetchItemById(itemId) {
      console.log(this.items.filter((item)=>  item.id == itemId));
      
      this.item = this.items.filter((item)=>  item.id == itemId);
     return this.item
    },
    async addItem(item) {
      console.log(item);
      
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      })
      const newItem = await response.json()
      this.items.push(newItem)
    },
    async updateItem(item) {
      const response = await fetch(`/api/items/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      })
      const updatedItem = await response.json()
      const index = this.items.findIndex(i => i.id === updatedItem.id)
      this.items[index] = updatedItem
    },
    async deleteItem(id) {      
      await fetch(`/api/items`, { 
        method: 'DELETE' , 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),})
      this.items = this.items.filter(item => item.id !== id)
    },
  },
})
