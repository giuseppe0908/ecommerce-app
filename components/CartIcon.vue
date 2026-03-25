<script setup>
import { computed, onMounted } from 'vue'
import { useCartStore } from '@/stores/cartStore'

const props = defineProps(['colorPrimary'])
const cartStore = useCartStore()

const badgeLabel = computed(() => {
  if (cartStore.itemCount > 99) return '99+'
  return String(cartStore.itemCount)
})

onMounted(() => {
  cartStore.loadCartFromLocalStorage()
})
</script>

<template>
  <div class="cart-icon">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width="35"
      height="35"
      :fill="props.colorPrimary"
      class="cart-icon__bag"
      aria-hidden="true"
    >
      <rect
        x="8"
        y="10"
        width="16"
        height="12"
        rx="3"
        ry="3"
        :fill="props.colorPrimary"
      />
      <path
        d="M11 12V9a5 5 0 0 1 10 0v3"
        :stroke="props.colorPrimary"
        stroke-width="2"
        fill="none"
      />
    </svg>

    <span v-if="cartStore.itemCount > 0" class="cart-icon__badge">
      {{ badgeLabel }}
    </span>
  </div>
</template>

<style scoped>
.cart-icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.cart-icon__bag {
  display: block;
}

.cart-icon__badge {
  position: absolute;
  top: -5px;
  right: -8px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: #0f172a;
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.2);
}
</style>
