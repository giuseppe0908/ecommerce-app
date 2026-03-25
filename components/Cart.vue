<script setup>
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { useCartStore } from '@/stores/cartStore'

const FALLBACK_PRODUCT_IMAGE = 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg'
const FREE_SHIPPING_THRESHOLD = 28.9
const SHIPPING_PRICE = 4.95

const props = defineProps({
  colorPrimary: {
    type: String,
    default: '#5D758B',
  },
})

const cartStore = useCartStore()
const route = useRoute()

const hasItems = computed(() => cartStore.cart.length > 0)
const shippingCost = computed(() => {
  if (!hasItems.value) return 0
  return cartStore.total > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_PRICE
})
const grandTotal = computed(() => Number(cartStore.total || 0) + shippingCost.value)
const itemCountLabel = computed(() => {
  const count = cartStore.itemCount
  if (count === 1) return '1 articolo nel carrello'
  return `${count} articoli nel carrello`
})
const shippingMessage = computed(() => {
  if (!hasItems.value) {
    return 'Aggiungi un prodotto per iniziare lo shopping.'
  }

  if (shippingCost.value === 0) {
    return 'Spedizione gratuita attiva sul tuo ordine.'
  }

  const missingAmount = Math.max(FREE_SHIPPING_THRESHOLD - Number(cartStore.total || 0), 0)
  return `Ti mancano ${formatCurrency(missingAmount)} per ottenere la spedizione gratuita.`
})

function formatCurrency(value) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(value) || 0)
}

function getItemBrand(item) {
  if (typeof item?.brand === 'string' && item.brand.trim()) {
    return item.brand.trim()
  }

  if (typeof item?.brand?.name === 'string' && item.brand.name.trim()) {
    return item.brand.name.trim()
  }

  return 'Brand'
}

function getItemImage(item) {
  if (typeof item?.image === 'string' && item.image.trim()) {
    return item.image.trim()
  }

  if (typeof item?.img === 'string' && item.img.trim()) {
    return item.img.trim()
  }

  if (typeof item?.photo === 'string' && item.photo.trim()) {
    return item.photo.trim()
  }

  const productImages = Array.isArray(item?.images) ? item.images : []
  const mainImage = productImages.find((image) => image?.imageType === 'MAIN')?.imageUrl
  if (typeof mainImage === 'string' && mainImage.trim()) {
    return mainImage.trim()
  }

  const fallbackImage = productImages[0]?.imageUrl
  if (typeof fallbackImage === 'string' && fallbackImage.trim()) {
    return fallbackImage.trim()
  }

  return FALLBACK_PRODUCT_IMAGE
}

function closeCart() {
  cartStore.flag_cart = false
}

function addQuantity(item) {
  cartStore.addtocart(item)
}

function removeQuantity(item) {
  cartStore.removetocart(item.codeItem)
}

function removeItem(item) {
  cartStore.removeItem(item.codeItem)
}

function clearCart() {
  cartStore.clearCart()
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    closeCart()
  }
}

onMounted(() => {
  cartStore.loadCartFromLocalStorage()
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})

watch(
  () => route.fullPath,
  () => {
    closeCart()
  }
)
</script>

<template>
  <Teleport to="body">
    <Transition name="cart-backdrop">
      <button
        v-if="cartStore.flag_cart"
        type="button"
        class="cart-overlay"
        aria-label="Chiudi il carrello"
        @click="closeCart"
      />
    </Transition>

    <Transition name="cart-panel">
      <aside
        v-if="cartStore.flag_cart"
        class="cart-panel"
        :style="{ '--cart-surface': props.colorPrimary }"
        aria-label="Carrello"
        @click.stop
      >
        <header class="cart-panel__header">
          <div>
            <p class="cart-panel__title">
              {{ hasItems ? 'Aggiunto con successo al tuo carrello!' : 'Il tuo carrello e vuoto' }}
            </p>
            <p class="cart-panel__subtitle">{{ itemCountLabel }}</p>
          </div>

          <button
            type="button"
            class="cart-panel__close"
            aria-label="Chiudi"
            @click="closeCart"
          >
            &times;
          </button>
        </header>

        <p class="cart-panel__status">
          {{ shippingMessage }}
        </p>

        <template v-if="hasItems">
          <div class="cart-panel__items">
            <article
              v-for="item in cartStore.cart"
              :key="item.codeItem"
              class="cart-item"
            >
              <div class="cart-item__image">
                <img :src="getItemImage(item)" :alt="item.name || 'Prodotto nel carrello'">
              </div>

              <div class="cart-item__content">
                <button
                  type="button"
                  class="cart-item__remove"
                  aria-label="Rimuovi articolo"
                  @click="removeItem(item)"
                >
                  &times;
                </button>

                <p class="cart-item__brand">{{ getItemBrand(item) }}</p>
                <p class="cart-item__name">{{ item.name }}</p>
                <p class="cart-item__price">{{ formatCurrency(item.price) }}</p>

                <div class="cart-item__meta">
                  <p>Colore: {{ item.color || 'Standard' }}</p>

                  <div class="cart-item__quantity">
                    <span>Quantita:</span>
                    <button type="button" class="qty-btn" @click="addQuantity(item)">+</button>
                    <strong>{{ item.quantity }}</strong>
                    <button type="button" class="qty-btn" @click="removeQuantity(item)">-</button>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <footer class="cart-panel__footer">
            <hr class="cart-panel__divider">

            <div class="cart-summary__row">
              <span>Subtotale</span>
              <strong>{{ formatCurrency(cartStore.total) }}</strong>
            </div>
            <div class="cart-summary__row">
              <span>Spedizione</span>
              <strong>{{ formatCurrency(shippingCost) }}</strong>
            </div>
            <div class="cart-summary__row cart-summary__row--total">
              <span>Totale iva inclusa</span>
              <strong>{{ formatCurrency(grandTotal) }}</strong>
            </div>

            <div class="cart-panel__actions">
              <NuxtLink to="/cart" class="cart-action cart-action--outline" @click="closeCart">
                VISUALIZZA IL CARRELLO
              </NuxtLink>
              <NuxtLink to="/order" class="cart-action cart-action--solid" @click="closeCart">
                ACQUISTA ORA
              </NuxtLink>
            </div>

            <button type="button" class="cart-panel__clear" @click="clearCart">
              Svuota carrello
            </button>
          </footer>
        </template>

        <div v-else class="cart-empty">
          <p class="cart-empty__copy">
            Quando aggiungi un prodotto, lo troverai qui con riepilogo e checkout rapido.
          </p>
          <NuxtLink to="/product" class="cart-action cart-action--solid" @click="closeCart">
            SCOPRI I PRODOTTI
          </NuxtLink>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cart-overlay {
  position: fixed;
  inset: 0;
  z-index: 69;
  border: 0;
  background: rgba(15, 23, 42, 0.22);
  backdrop-filter: blur(4px);
  cursor: default;
}

.cart-panel {
  --cart-text: #ffffff;
  position: fixed;
  top: 84px;
  right: 16px;
  z-index: 70;
  width: min(400px, calc(100vw - 32px));
  max-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  padding: 24px;
  border-radius: 24px;
  background: var(--cart-surface);
  color: var(--cart-text);
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.28);
  overflow: hidden;
  box-sizing: border-box;
}

.cart-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.cart-panel__title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.35;
}

.cart-panel__subtitle {
  margin: 6px 0 0;
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  opacity: 0.72;
}

.cart-panel__close {
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 32px;
  line-height: 0.8;
  cursor: pointer;
}

.cart-panel__status {
  margin: 16px 0 18px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.14);
  font-size: 12px;
  line-height: 1.5;
}

.cart-panel__items {
  display: flex;
  flex-direction: column;
  gap: 18px;
  overflow-y: auto;
  padding-right: 4px;
}

.cart-item {
  position: relative;
  display: grid;
  grid-template-columns: 108px minmax(0, 1fr);
  gap: 16px;
}

.cart-item__image {
  width: 108px;
  height: 118px;
  border-radius: 16px;
  background: #f4f5f7;
  overflow: hidden;
}

.cart-item__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-item__content {
  position: relative;
  min-width: 0;
  padding-right: 24px;
}

.cart-item__remove {
  position: absolute;
  top: -4px;
  right: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}

.cart-item__brand,
.cart-item__price {
  margin: 0;
  font-weight: 700;
}

.cart-item__brand {
  font-size: 14px;
  letter-spacing: 0.05em;
}

.cart-item__name {
  margin: 4px 0 8px;
  font-size: 13px;
  line-height: 1.45;
}

.cart-item__price {
  font-size: 17px;
  color: #f8fbff;
}

.cart-item__meta {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 18px;
  font-size: 13px;
  line-height: 1.5;
}

.cart-item__meta p {
  margin: 0;
}

.cart-item__quantity {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.qty-btn {
  width: 18px;
  height: 18px;
  border: 0;
  border-radius: 999px;
  background: #ffffff;
  color: var(--cart-surface);
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
}

.cart-panel__footer {
  margin-top: 18px;
}

.cart-panel__divider {
  height: 1px;
  margin: 0 0 18px;
  border: 0;
  background: rgba(255, 255, 255, 0.45);
}

.cart-summary__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 14px;
}

.cart-summary__row--total {
  margin-bottom: 22px;
  font-size: 15px;
  font-weight: 700;
}

.cart-panel__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.cart-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 12px 14px;
  border-radius: 999px;
  border: 1px solid #ffffff;
  text-decoration: none;
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  transition: transform 0.2s ease, opacity 0.2s ease, background-color 0.2s ease;
}

.cart-action:hover {
  transform: translateY(-1px);
  opacity: 0.92;
}

.cart-action--outline {
  background: transparent;
  color: #ffffff;
}

.cart-action--solid {
  background: #ffffff;
  color: #111827;
}

.cart-panel__clear {
  display: block;
  margin: 14px auto 0;
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.88);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.cart-empty {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  gap: 18px;
  padding: 16px 0 4px;
}

.cart-empty__copy {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  opacity: 0.9;
}

.cart-backdrop-enter-active,
.cart-backdrop-leave-active,
.cart-panel-enter-active,
.cart-panel-leave-active {
  transition: all 0.22s ease;
}

.cart-backdrop-enter-from,
.cart-backdrop-leave-to {
  opacity: 0;
}

.cart-panel-enter-from,
.cart-panel-leave-to {
  opacity: 0;
  transform: translateY(-8px) translateX(18px);
}

@media (max-width: 640px) {
  .cart-panel {
    top: 72px;
    right: 12px;
    width: calc(100vw - 24px);
    max-height: calc(100vh - 84px);
    padding: 20px;
    border-radius: 20px;
  }

  .cart-item {
    grid-template-columns: 96px minmax(0, 1fr);
  }

  .cart-item__image {
    width: 96px;
    height: 108px;
  }

  .cart-panel__actions {
    grid-template-columns: 1fr;
  }
}
</style>
