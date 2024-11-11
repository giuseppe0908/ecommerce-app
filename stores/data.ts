// stores/dataStore.ts
// import { defineStore } from 'pinia'
// import { ref } from 'vue'

// export const useDataStore = defineStore('dataStore', () => {
//   // Usa `ref` per dichiarare lo stato
//   const items = ref([]) // Sostituisci `any` con il tipo dei tuoi dati se lo conosci

//   // Definisci l’azione `fetchItems` senza `this`
//   const fetchItems = async () => {
//     try {
//       // Effettua una chiamata API o una richiesta al database per ottenere i dati
//       const response = await $fetch('/api/items')
//       items.value = response
//     } catch (error) {
//       console.error('Errore nel recupero dei dati:', error)
//     }
//   }

//   // Restituisci lo stato e le azioni per renderli disponibili nel componente
//   return { items, fetchItems }
// })
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', {
    state: () => {
      return {
        // for initially empty lists
        userList: [] as UserInfo[],
        // for data that is not yet loaded
        user: null as UserInfo | null,
      }
    },
  })
  
  interface UserInfo {
    name: string
    age: number
  }