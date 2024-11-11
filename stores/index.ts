import { createStore, Store, Commit } from 'vuex'

interface State {
  counter: number
}

// Crea lo store Vuex
export const store = createStore<State>({
  state: (): State => ({
    counter: 0,
  }),
  getters: {
    getCounter(state: State): number {
      return state.counter
    }
  },
  mutations: {
    increment(state: State): void {
      state.counter++
    },
    setCounter(state: State, value: number): void {
      state.counter = value
    }
  },
  actions: {
    increment({ commit }: { commit: Commit }): void {
      commit('increment')
    },
    setCounter({ commit }: { commit: Commit }, value: number): void {
      commit('setCounter', value)
    }
  }
})

