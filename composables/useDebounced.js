import { ref } from 'vue'

export function useDebounced(fn, delay = 300) {
  const timeout = ref(null)
  return (...args) => {
    if (timeout.value) clearTimeout(timeout.value)
    timeout.value = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}