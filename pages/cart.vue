<template>
  <div class="cart-page">
    <section class="cart-page__shell">
      <header class="cart-page__header">
        <p class="cart-page__eyebrow">Carrello</p>
        <h1>Rivedi i tuoi articoli prima del checkout</h1>
        <p>
          Controlla quantita, colori e totale. Quando sei pronto puoi passare subito al pagamento.
        </p>
      </header>

      <div v-if="hasItems" class="cart-page__grid">
        <div class="cart-page__items">
          <article
            v-for="item in cartStore.cart"
            :key="item.codeItem"
            class="cart-line"
          >
            <div class="cart-line__image">
              <img :src="getItemImage(item)" :alt="item.name || 'Prodotto nel carrello'">
            </div>

            <div class="cart-line__content">
              <div class="cart-line__top">
                <div>
                  <p class="cart-line__brand">{{ getItemBrand(item) }}</p>
                  <h2 class="cart-line__name">{{ item.name }}</h2>
                </div>

                <button type="button" class="cart-line__remove" @click="removeItem(item)">
                  Rimuovi
                </button>
              </div>

              <div class="cart-line__details">
                <span>Colore: {{ item.color || 'Standard' }}</span>
                <span>Codice: {{ item.codeItem }}</span>
              </div>

              <div class="cart-line__bottom">
                <div class="cart-line__quantity">
                  <span>Quantita</span>
                  <button type="button" class="qty-btn" @click="removeQuantity(item)">-</button>
                  <strong>{{ item.quantity }}</strong>
                  <button type="button" class="qty-btn" @click="addQuantity(item)">+</button>
                </div>

                <strong class="cart-line__price">
                  {{ formatCurrency(item.price * item.quantity) }}
                </strong>
              </div>
            </div>
          </article>
        </div>

        <aside class="cart-summary">
          <p class="cart-summary__eyebrow">Riepilogo ordine</p>
          <h2>Totali aggiornati in tempo reale</h2>
          <p class="cart-summary__copy">{{ shippingMessage }}</p>

          <div class="cart-summary__rows">
            <div class="cart-summary__row">
              <span>Articoli</span>
              <strong>{{ cartStore.itemCount }}</strong>
            </div>
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
          </div>

          <div class="cart-summary__actions">
            <NuxtLink to="/product" class="summary-action summary-action--ghost">
              CONTINUA LO SHOPPING
            </NuxtLink>
            <NuxtLink to="/order" class="summary-action summary-action--solid">
              ACQUISTA ORA
            </NuxtLink>
          </div>
        </aside>
      </div>

      <div v-else class="cart-empty-state">
        <div class="cart-empty-state__card">
          <p class="cart-page__eyebrow">Carrello</p>
          <h2>Non ci sono ancora articoli nel tuo carrello.</h2>
          <p>
            Esplora il catalogo e aggiungi i prodotti che vuoi rivedere o acquistare.
          </p>
          <NuxtLink to="/product" class="summary-action summary-action--solid">
            VAI AL CATALOGO
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useNoIndexPageSeo } from '~/composables/usePageSeo'
import { useCartStore } from '~/stores/cartStore'

const FALLBACK_PRODUCT_IMAGE = 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg'
const FREE_SHIPPING_THRESHOLD = 28.9
const SHIPPING_PRICE = 4.95

useNoIndexPageSeo({
  title: 'Carrello',
  description: 'Rivedi gli articoli selezionati e procedi verso il checkout.',
  path: '/cart',
})

const cartStore = useCartStore()

const hasItems = computed(() => cartStore.cart.length > 0)
const shippingCost = computed(() => {
  if (!hasItems.value) return 0
  return cartStore.total > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_PRICE
})
const grandTotal = computed(() => Number(cartStore.total || 0) + shippingCost.value)
const shippingMessage = computed(() => {
  if (!hasItems.value) {
    return 'Aggiungi un prodotto per iniziare.'
  }

  if (shippingCost.value === 0) {
    return 'Hai gia sbloccato la spedizione gratuita.'
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

  return FALLBACK_PRODUCT_IMAGE
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

onMounted(() => {
  cartStore.loadCartFromLocalStorage()
  cartStore.flag_cart = false
})
</script>

<style scoped>
.cart-page {
  min-height: calc(100vh - 120px);
  padding: 36px 16px 48px;
  background:
    radial-gradient(circle at top left, rgba(93, 117, 139, 0.18), transparent 32%),
    linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%);
}

.cart-page__shell {
  max-width: 1120px;
  margin: 0 auto;
}

.cart-page__header {
  max-width: 760px;
  margin-bottom: 28px;
}

.cart-page__eyebrow,
.cart-summary__eyebrow {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #5d758b;
}

.cart-page__header h1,
.cart-empty-state__card h2,
.cart-summary h2 {
  margin: 0 0 10px;
  color: #0f172a;
  line-height: 1.1;
}

.cart-page__header h1 {
  font-size: clamp(32px, 5vw, 52px);
}

.cart-page__header p,
.cart-empty-state__card p,
.cart-summary__copy {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}

.cart-page__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(320px, 0.9fr);
  gap: 24px;
  align-items: start;
}

.cart-page__items {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.cart-line,
.cart-summary,
.cart-empty-state__card {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 28px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
}

.cart-line {
  display: grid;
  grid-template-columns: 168px minmax(0, 1fr);
  gap: 22px;
  padding: 22px;
}

.cart-line__image {
  border-radius: 22px;
  background: #f3f4f6;
  overflow: hidden;
  aspect-ratio: 4 / 4.4;
}

.cart-line__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-line__content {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.cart-line__top,
.cart-line__bottom {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.cart-line__brand {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #5d758b;
}

.cart-line__name {
  margin: 0;
  font-size: 24px;
  color: #0f172a;
}

.cart-line__remove {
  border: 0;
  background: transparent;
  color: #64748b;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.cart-line__details {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  color: #475569;
  font-size: 14px;
}

.cart-line__quantity {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  color: #334155;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 999px;
  background: #e2e8f0;
  color: #0f172a;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
}

.cart-line__price {
  font-size: 22px;
  color: #0f172a;
}

.cart-summary {
  position: sticky;
  top: 96px;
  padding: 28px;
}

.cart-summary__copy {
  margin-bottom: 24px;
}

.cart-summary__rows {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 0;
  border-top: 1px solid rgba(148, 163, 184, 0.35);
  border-bottom: 1px solid rgba(148, 163, 184, 0.35);
}

.cart-summary__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  color: #334155;
}

.cart-summary__row--total {
  color: #0f172a;
  font-size: 18px;
}

.cart-summary__actions {
  display: grid;
  gap: 12px;
  margin-top: 22px;
}

.summary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  padding: 14px 18px;
  border-radius: 999px;
  border: 1px solid #5d758b;
  text-decoration: none;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.summary-action:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.1);
}

.summary-action--ghost {
  background: transparent;
  color: #5d758b;
}

.summary-action--solid {
  background: #5d758b;
  border-color: #5d758b;
  color: #ffffff;
}

.cart-empty-state {
  display: flex;
  justify-content: center;
}

.cart-empty-state__card {
  width: min(560px, 100%);
  padding: 32px;
}

.cart-empty-state__card p {
  margin-bottom: 24px;
}

@media (max-width: 960px) {
  .cart-page__grid {
    grid-template-columns: 1fr;
  }

  .cart-summary {
    position: static;
  }
}

@media (max-width: 640px) {
  .cart-page {
    padding: 24px 12px 36px;
  }

  .cart-line {
    grid-template-columns: 1fr;
    padding: 18px;
  }

  .cart-line__image {
    max-width: 220px;
  }

  .cart-line__top,
  .cart-line__bottom {
    flex-direction: column;
  }

  .cart-line__name {
    font-size: 20px;
  }

  .cart-summary,
  .cart-empty-state__card {
    padding: 22px;
    border-radius: 24px;
  }
}
</style>
