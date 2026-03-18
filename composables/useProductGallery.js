import { computed, ref } from 'vue'

const DEFAULT_GALLERY_ITEM = {
  id: 'default',
  color: 'Standard',
  images: {
    main: '',
    others: [],
  },
}

function normalizeGalleryItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return [DEFAULT_GALLERY_ITEM]
  }

  return items
    .map((item, index) => {
      const mainImage = item?.images?.main || ''
      const otherImages = Array.isArray(item?.images?.others)
        ? item.images.others.filter((image) => typeof image === 'string' && image.trim())
        : []

      return {
        id: item?.id ?? index,
        color: item?.color || 'Standard',
        images: {
          main: mainImage,
          others: otherImages.filter((image) => image !== mainImage),
        },
      }
    })
    .filter((item) => item.images.main || item.images.others.length > 0)
}

export function useProductGallery(initialItems = []) {
  const galleryItems = ref(normalizeGalleryItems(initialItems))
  const currentColorIndex = ref(0)
  const currentImageIndex = ref(0)

  const currentMainImage = ref(galleryItems.value[0]?.images?.main || '')
  const currentOtherImages = ref(galleryItems.value[0]?.images?.others || [])

  const touchStartX = ref(0)
  const touchEndX = ref(0)
  const minSwipeDistance = 50
  const isTouchDevice = ref(false)

  const allImages = computed(() => {
    const current = galleryItems.value[currentColorIndex.value]
    if (!current?.images) return []

    return [current.images.main, ...(current.images.others || [])].filter(Boolean)
  })

  function syncCurrentSelection() {
    const selected = galleryItems.value[currentColorIndex.value]

    if (!selected?.images) {
      currentColorIndex.value = 0
      currentImageIndex.value = 0
      currentMainImage.value = ''
      currentOtherImages.value = []
      return
    }

    const images = [selected.images.main, ...(selected.images.others || [])].filter(Boolean)
    currentImageIndex.value = Math.min(currentImageIndex.value, Math.max(images.length - 1, 0))
    currentMainImage.value = images[currentImageIndex.value] || selected.images.main || ''
    currentOtherImages.value = (selected.images.others || []).filter(
      (image) => image !== currentMainImage.value
    )
  }

  function setGalleryItems(items) {
    galleryItems.value = normalizeGalleryItems(items)
    currentColorIndex.value = 0
    currentImageIndex.value = 0
    syncCurrentSelection()
  }

  function changeMainImage(image) {
    if (typeof image !== 'string' || !image.trim()) return

    currentMainImage.value = image
    const imageIndex = allImages.value.findIndex((img) => img === image)
    if (imageIndex !== -1) {
      currentImageIndex.value = imageIndex
    }

    const selected = galleryItems.value[currentColorIndex.value]
    currentOtherImages.value = (selected?.images?.others || []).filter((img) => img !== image)
  }

  function changeColor(index) {
    const selected = galleryItems.value[index]
    if (!selected?.images) return

    currentColorIndex.value = index
    currentImageIndex.value = 0
    currentMainImage.value = selected.images.main || ''
    currentOtherImages.value = selected.images.others || []
  }

  function nextImage() {
    if (currentImageIndex.value >= allImages.value.length - 1) return

    currentImageIndex.value += 1
    changeMainImage(allImages.value[currentImageIndex.value])
  }

  function previousImage() {
    if (currentImageIndex.value <= 0) return

    currentImageIndex.value -= 1
    changeMainImage(allImages.value[currentImageIndex.value])
  }

  function goToImage(index) {
    if (index < 0 || index >= allImages.value.length) return

    currentImageIndex.value = index
    changeMainImage(allImages.value[index])
  }

  function handleSwipe() {
    const swipeDistance = touchStartX.value - touchEndX.value

    if (Math.abs(swipeDistance) <= minSwipeDistance) {
      return
    }

    if (swipeDistance > 0) {
      nextImage()
      return
    }

    previousImage()
  }

  function handleTouchStart(event) {
    touchStartX.value = event.touches[0].clientX
    isTouchDevice.value = true
  }

  function handleTouchMove(event) {
    if (isTouchDevice.value) {
      event.preventDefault()
    }
  }

  function handleTouchEnd(event) {
    if (!isTouchDevice.value) return

    touchEndX.value = event.changedTouches[0].clientX
    handleSwipe()
    isTouchDevice.value = false
  }

  syncCurrentSelection()

  return {
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
  }
}
