<script setup>
import { computed } from 'vue'
import { useCartStore } from '@/stores/cartStore'
import { useWishlistStore } from '@/stores/wishlistStore'
import { useAppToast } from '~/composables/useAppToast'

const FALLBACK_PRODUCT_IMAGE = 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg'

const props = defineProps({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  img: { type: String, default: '' },
  promo: { type: Boolean, default: false },
  plus: { type: Boolean, default: false },
  price: { type: Number, required: true },
  percentualPromo: { type: Number, default: 0 },
  category: { type: Object, default: () => ({}) },
  subCategory: { type: Object, default: () => ({}) },
  brand: { type: Object, default: () => ({}) },
  colorPrimary: { type: String, default: '#5D758B' },
  codeItem: { type: String, required: true },
})

const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const toast = useAppToast()

const subtitle = computed(() => {
  return props.subCategory?.name || props.category?.name || 'Catalogo'
})

const isInCart = computed(() => cartStore.isInCart(props.codeItem))
const isInWishlist = computed(() => wishlistStore.isInWishlist(props.id))

const originalPrice = computed(() => {
  if (!props.promo || !props.percentualPromo) return null
  const divisor = 1 - props.percentualPromo / 100
  if (divisor <= 0) return null
  return props.price / divisor
})

function formatCurrency(value) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(value) || 0)
}

function addToCart(event) {
  event.preventDefault()
  event.stopPropagation()

  const selectedProduct = {
    id: props.id,
    codeItem: props.codeItem,
    name: props.name,
    price: props.price,
    brand: props.brand,
    category: props.category,
    image: props.img || FALLBACK_PRODUCT_IMAGE,
  }

  const alreadyInCart = isInCart.value
  cartStore.addtocart(selectedProduct)

  if (alreadyInCart) {
    toast.info('Quantita aggiornata nel carrello')
    return
  }

  toast.success('Prodotto aggiunto al carrello')
}

function toggleWishlist(event) {
  event.preventDefault()
  event.stopPropagation()
  wishlistStore.toggleWishlistItem({
    ...props,
    photo: props.img || FALLBACK_PRODUCT_IMAGE,
  })
}
</script>

<template>
  <NuxtLink :to="`/product/${id}`" class="catalog-product-card">
    <article>
      <div class="catalog-product-card__media">
        <div class="catalog-product-card__badges">
          <span v-if="plus" class="catalog-product-card__badge catalog-product-card__badge--plus">PLUS</span>
          <span v-if="promo" class="catalog-product-card__badge catalog-product-card__badge--promo">PROMO</span>
        </div>

        <button
          type="button"
          class="catalog-product-card__wishlist"
          :aria-pressed="isInWishlist"
          :title="isInWishlist ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'"
          @click="toggleWishlist"
        >
          <svg viewBox="0 0 24 24" fill="none" :style="{ color: colorPrimary }" stroke="currentColor" stroke-width="1.8">
            <path
              :fill="isInWishlist ? 'currentColor' : 'none'"
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            />
          </svg>
        </button>

        <img
          :src="img || FALLBACK_PRODUCT_IMAGE"
          :alt="name"
          class="catalog-product-card__image"
          loading="lazy"
          decoding="async"
        >
      </div>

      <div class="catalog-product-card__content">
        <div class="catalog-product-card__brand">{{ brand?.name || 'Brand' }}</div>
        <div class="catalog-product-card__subtitle">{{ subtitle }}</div>
        <div class="catalog-product-card__name">{{ name }}</div>

        <div class="catalog-product-card__footer">
          <div>
            <div class="catalog-product-card__price">{{ formatCurrency(price) }}</div>
            <div v-if="promo && originalPrice" class="catalog-product-card__promo-info">
              Prezzo ordinario: <del>{{ formatCurrency(originalPrice) }}</del> -{{ percentualPromo }}%
            </div>
          </div>

          <button
            type="button"
            class="catalog-product-card__cart"
            :class="{ 'catalog-product-card__cart--active': isInCart }"
            :aria-pressed="isInCart"
            :title="isInCart ? 'Gia presente nel carrello' : 'Aggiungi al carrello'"
            @click="addToCart"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 4h2l.4 2m0 0L7 14h10l4-8H5.4m0 0L7 14m0 0l-1.5 1.5a1 1 0 0 0 .7 1.7H17m-8 2a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm10 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  </NuxtLink>
</template>

<style scoped>
.catalog-product-card {
  display: block;
  color: #333;
  text-decoration: none;
}

.catalog-product-card__media {
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: 8px;
  background: #f5f5f5;
  margin-bottom: 10px;
}

.catalog-product-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.catalog-product-card__badges {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 5px;
  z-index: 2;
}

.catalog-product-card__badge {
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.catalog-product-card__badge--plus {
  background: #fff;
  color: #777;
  border: 1px solid #e0e0e0;
}

.catalog-product-card__badge--promo {
  background: #223040;
  color: #fff;
}

.catalog-product-card__wishlist {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.catalog-product-card__wishlist svg,
.catalog-product-card__cart svg {
  width: 18px;
  height: 18px;
}

.catalog-product-card__content {
  font-size: 12px;
}

.catalog-product-card__brand {
  font-weight: 700;
  margin-bottom: 2px;
  text-transform: uppercase;
}

.catalog-product-card__subtitle {
  color: #777;
  font-size: 10px;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.catalog-product-card__name {
  font-size: 12px;
  line-height: 1.35;
  margin-bottom: 8px;
  min-height: 32px;
}

.catalog-product-card__footer {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.catalog-product-card__price {
  font-weight: 700;
  font-size: 13px;
}

.catalog-product-card__promo-info {
  font-size: 9px;
  color: #777;
  margin-top: 2px;
}

.catalog-product-card__cart {
  width: 34px;
  height: 34px;
  border: 1px solid #e0e0e0;
  border-radius: 999px;
  background: #fff;
  color: #5d7488;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.catalog-product-card__cart:hover {
  border-color: #5d7488;
}

.catalog-product-card__cart--active {
  background: #5d7488;
  border-color: #5d7488;
  color: #fff;
}
</style>
