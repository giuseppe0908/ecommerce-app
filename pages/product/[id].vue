<template>
  <div class="w-[95%] mx-auto md:my-0">
    <ProductDetailHero
      :product="product"
      :colorPrimary="colorPrimary"
      :galleryItems="galleryItems"
      :currentColorIndex="currentColorIndex"
      :currentMainImage="currentMainImage"
      :currentOtherImages="currentOtherImages"
      :allImages="allImages"
      :currentImageIndex="currentImageIndex"
      :stockQuantity="stockQuantity"
      :productSpecs="productSpecs"
      :isInWishlist="isInWishlist"
      @change-main-image="changeMainImage"
      @change-color="changeColor"
      @touch-start="handleTouchStart"
      @touch-move="handleTouchMove"
      @touch-end="handleTouchEnd"
      @previous-image="previousImage"
      @next-image="nextImage"
      @go-to-image="goToImage"
      @add-cart="addCart"
      @toggle-wishlist="toggleWishlist"
    />

    <div class="reviews-section mt-12 border-t pt-6">
      <ReviewComponent
        :productId="numericProductId"
        :reviews="productReviews"
        :averageRating="averageRating"
      />
    </div>

    <ProductRelatedGrid
      :relatedProducts="relatedProducts"
      :colorPrimary="colorPrimary"
      :colorSecondary="colorSecondary"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useWishlistStore } from '~/stores/wishlistStore'
import { useCartStore } from '~/stores/cartStore'
import ProductDetailHero from '~/components/Product/ProductDetailHero.vue'
import ProductRelatedGrid from '~/components/Product/ProductRelatedGrid.vue'
import { useProductGallery } from '~/composables/useProductGallery'
import { useAppToast } from '~/composables/useAppToast'
import { toAbsoluteUrl, truncateText } from '~/utils/seo'

const route = useRoute()
const numericProductId = Number.parseInt(String(route.params.id || ''), 10)

const colorPrimary = '#5D758B'
const colorSecondary = '#00192F'

const { data } = await useFetch(`/api/products/${numericProductId}`)
const product = ref(data.value || {})

const wishlistStore = useWishlistStore()
const cartStore = useCartStore()
const toast = useAppToast()

const {
  galleryItems,
  currentColorIndex,
  currentMainImage,
  currentOtherImages,
  allImages,
  currentImageIndex,
  setGalleryItems,
  changeMainImage,
  changeColor,
  nextImage,
  previousImage,
  goToImage,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
} = useProductGallery([])

const productReviews = ref([])
const averageRating = ref(0)
const relatedProducts = ref([])

function uniqueImages(images) {
  return Array.from(
    new Set(
      (Array.isArray(images) ? images : []).filter(
        (image) => typeof image === 'string' && image.trim()
      )
    )
  )
}

function buildGalleryItems(productData) {
  const productImages = Array.isArray(productData?.images) ? productData.images : []
  const generalImages = uniqueImages(
    productImages
      .filter((image) => image.imageType === 'GENERAL')
      .map((image) => image.imageUrl)
  )

  const colors = Array.isArray(productData?.productColors) ? productData.productColors : []
  const fallbackMainImage = productData?.photo || generalImages[0] || ''

  if (colors.length === 0) {
    return [
      {
        id: 'default',
        color: 'Standard',
        images: {
          main: fallbackMainImage,
          others: uniqueImages(generalImages.filter((image) => image !== fallbackMainImage)),
        },
      },
    ]
  }

  const gallery = colors
    .map((productColor, index) => {
      const color = productColor?.color
      if (!color?.id) return null

      const colorSpecificImages = productImages.filter(
        (image) => image.colorId === color.id && image.imageType !== 'GENERAL'
      )

      const mainImage =
        colorSpecificImages.find((image) => image.imageType === 'MAIN')?.imageUrl ||
        colorSpecificImages[0]?.imageUrl ||
        fallbackMainImage

      const secondaryImages = uniqueImages([
        ...colorSpecificImages
          .filter((image) => image.imageUrl !== mainImage)
          .map((image) => image.imageUrl),
        ...generalImages.filter((image) => image !== mainImage),
      ])

      return {
        id: color.id ?? index,
        color: color.name || 'Standard',
        images: {
          main: mainImage,
          others: secondaryImages,
        },
      }
    })
    .filter(Boolean)

  return gallery.length > 0
    ? gallery
    : [
        {
          id: 'default',
          color: 'Standard',
          images: {
            main: fallbackMainImage,
            others: uniqueImages(generalImages.filter((image) => image !== fallbackMainImage)),
          },
        },
      ]
}

const stockQuantity = computed(() => Number(product.value?.available_quantity ?? 0))

const productTitle = computed(() => {
  if (!product.value?.name) {
    return 'Dettaglio prodotto'
  }

  return product.value?.brand?.name
    ? `${product.value.name} - ${product.value.brand.name}`
    : product.value.name
})

const productDescription = computed(() =>
  truncateText(
    product.value?.description ||
      'Dettagli prodotto, disponibilita aggiornata, immagini reali e informazioni di acquisto.',
    160
  )
)

const productPath = computed(() =>
  Number.isInteger(numericProductId) && numericProductId > 0 ? `/product/${numericProductId}` : '/product'
)

const productImageList = computed(() => {
  const galleryImages = galleryItems.value.flatMap((item) => [
    item?.images?.main,
    ...(Array.isArray(item?.images?.others) ? item.images.others : []),
  ])

  return uniqueImages([
    ...galleryImages,
    product.value?.photo,
  ])
})

const { baseUrl, canonicalUrl } = usePageSeo({
  title: productTitle,
  description: productDescription,
  path: productPath,
  image: computed(() => productImageList.value[0] || product.value?.photo || ''),
  type: 'product',
  index: computed(() => Boolean(product.value?.id)),
})

const productSpecs = computed(() => {
  const featureSpecs = Array.isArray(product.value?.features)
    ? product.value.features
        .filter((entry) => entry?.feature?.name && entry?.value)
        .map((entry) => ({
          name: entry.feature.name,
          value: entry.value,
        }))
    : []

  const fallbackSpecs = [
    product.value?.category?.name
      ? { name: 'Categoria', value: product.value.category.name }
      : null,
    product.value?.brand?.name
      ? { name: 'Brand', value: product.value.brand.name }
      : null,
    product.value?.gender?.name
      ? { name: 'Target', value: product.value.gender.name }
      : null,
    product.value?.codeItem
      ? { name: 'Codice articolo', value: product.value.codeItem }
      : null,
  ].filter(Boolean)

  return featureSpecs.length > 0 ? featureSpecs : fallbackSpecs
})

const isInWishlist = computed(() => wishlistStore.isInWishlist(product.value?.id))

const productStructuredData = computed(() => {
  if (!product.value?.id) return null

  const images = productImageList.value
    .map((image) => toAbsoluteUrl(baseUrl.value, image))
    .filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.value.name,
    description: productDescription.value,
    url: canonicalUrl.value,
    image: images,
    sku: product.value.codeItem || String(product.value.id),
    mpn: product.value.codeItem || String(product.value.id),
    brand: product.value?.brand?.name
      ? {
          '@type': 'Brand',
          name: product.value.brand.name,
        }
      : undefined,
    category: product.value?.category?.name || undefined,
    offers: {
      '@type': 'Offer',
      url: canonicalUrl.value,
      priceCurrency: 'EUR',
      price: Number(product.value.price || 0).toFixed(2),
      availability:
        stockQuantity.value > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating:
      productReviews.value.length > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: Number(averageRating.value || 0).toFixed(1),
            reviewCount: productReviews.value.length,
          }
        : undefined,
  }
})

useHead(() => ({
  script: productStructuredData.value
    ? [
        {
          key: 'product-jsonld',
          type: 'application/ld+json',
          children: JSON.stringify(productStructuredData.value),
        },
      ]
    : [],
}))

function addCart() {
  if (!product.value?.id) return

  const selectedProduct = {
    id: product.value.id,
    codeItem: product.value.codeItem || product.value.id,
    name: product.value.name,
    price: product.value.price,
    brand: product.value.brand,
    color: galleryItems.value[currentColorIndex.value]?.color || 'Standard',
    image: currentMainImage.value || product.value.photo,
  }

  cartStore.addtocart(selectedProduct)
  toast.success('Prodotto aggiunto al carrello!', {
    position: 'top-right',
    timeout: 3000,
  })
}

async function toggleWishlist() {
  if (!product.value?.id) return

  const wasInWishlist = isInWishlist.value
  const productToToggle = {
    id: product.value.id,
    name: product.value.name,
    price: product.value.price,
    brand: product.value.brand,
    img: currentMainImage.value || product.value.photo,
  }

  const heartIcon = document.querySelector('.wishlist-heart-icon')
  if (heartIcon) {
    heartIcon.classList.add('heart-pulse')
    setTimeout(() => {
      heartIcon.classList.remove('heart-pulse')
    }, 500)
  }

  await wishlistStore.toggleWishlistItem(productToToggle)

  if (wishlistStore.error) {
    toast.error(wishlistStore.error, {
      position: 'top-right',
      timeout: 2000,
    })
    return
  }

  if (wasInWishlist) {
    toast.info('Prodotto rimosso dai preferiti', {
      position: 'top-right',
      timeout: 2000,
    })
    return
  }

  toast.success('Prodotto aggiunto ai preferiti', {
    position: 'top-right',
    timeout: 2000,
  })
}

async function loadProductReviews() {
  const reviewsData = await $fetch(`/api/reviews/${numericProductId}`).catch(() => null)
  if (!Array.isArray(reviewsData)) {
    productReviews.value = []
    averageRating.value = 0
    return
  }

  productReviews.value = reviewsData

  if (reviewsData.length === 0) {
    averageRating.value = 0
    return
  }

  const sum = reviewsData.reduce((total, review) => total + (review?.rating || 0), 0)
  averageRating.value = sum / reviewsData.length
}

async function loadRelatedProducts() {
  const relatedData = await $fetch(`/api/products/related/${numericProductId}`).catch(() => null)
  relatedProducts.value = Array.isArray(relatedData) ? relatedData : []
}

watch(
  () => data.value,
  (nextProduct) => {
    product.value = nextProduct || {}
    setGalleryItems(buildGalleryItems(product.value))
  },
  { immediate: true }
)

onMounted(async () => {
  await wishlistStore.initWishlist()

  try {
    await Promise.all([loadProductReviews(), loadRelatedProducts()])
  } catch (error) {
    console.error('Errore nel caricamento dei dati prodotto:', error)
  }
})
</script>
