// store/items.ts
// export const state = () => ({
//     items: [] as any[],  // Array per gli articoli
//   })
  
//   export const mutations = {
//     setItems(state: any, items: any[]) {
//       state.items = items
//     }
//   }
  
//   export const actions = {
//     async fetchItems({ commit }: any) {
//       const response = await $fetch('/api/items')
//       console.log(response);
      
//       commit('setItems', response)
//     }
//   }
  
//   export const getters = {
//     allItems: (state: any) => state.items,
//   }
  

// store/index.ts

import { GetterTree, MutationTree, ActionTree } from 'vuex'

interface State {
  counter: number
}

export const state = (): State => ({
  counter: 0,
})

export const getters: GetterTree<State, State> = {
  getCounter(state): number {
    return state.counter
  }
}

export const mutations: MutationTree<State> = {
  increment(state): void {
    state.counter++
  },
  setCounter(state, value: number): void {
    state.counter = value
  }
}

export const actions: ActionTree<State, State> = {
  increment({ commit }): void {
    commit('increment')
  },
  setCounter({ commit }, value: number): void {
    commit('setCounter', value)
  }
}

  